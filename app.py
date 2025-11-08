import asyncio
import json
from datetime import datetime

from flask import Flask, redirect, url_for, session, request, render_template_string, render_template, jsonify
from authlib.integrations.flask_client import OAuth
from pygments.lexers import templates
import database.db_manager as db_manager
from openpyxl import Workbook
from io import BytesIO

def get_course(year, group):
    course = datetime.now().year - year + 1
    if datetime.now().month < 9: course -= 1
    if group[0] == 'М': course += 4

    return course


app = Flask(__name__, template_folder='templates')
app.secret_key = "ajskdhA89sdjASD91823jsd0A8sdasdjA0s9d"

sql = db_manager.DatabaseManager()

# Настройка OAuth
oauth = OAuth(app)
yandex = oauth.register(
    name='yandex',
    client_id='0eb1ecd943fc408a8932a7ffda96b4db',       # получаем на Яндекс OAuth
    client_secret='29ab13bc219f4c268c2c1d52923485db',
    access_token_url='https://oauth.yandex.com/token',
    access_token_params=None,
    authorize_url='https://oauth.yandex.com/authorize',
    authorize_params=None,
    api_base_url='https://login.yandex.ru/info',
    client_kwargs={'scope': 'login:email login:info login:avatar'}
)

@app.route('/')
def homepage():
    if session.get('id'):
        return redirect(url_for('apps'))
    return render_template("aux_page.html", link=url_for('login'))

@app.route('/login')
def login():
    session.clear()
    redirect_uri = url_for('authorize', _external=True)
    return yandex.authorize_redirect(redirect_uri, prompt='login', force_confirm='yes')

@app.route('/authorize')
async def authorize():
    await sql.connect()
    await sql.init_db()

    try:
        token = yandex.authorize_access_token()
        resp = yandex.get('https://login.yandex.ru/info', token=token)
        user_info = resp.json()

        email = user_info.get('default_email')
        id = user_info.get('id')

        if not email or not email.endswith('@phystech.edu'):
            return render_template_string(f"""
                <h2>Доступ разрешен только для @phystech.edu</h2>"
                <form action="{{{{ url_for('logout') }}}}" method="post">
                    <button type="submit">Выйти</button>
                </form>
            """), 403

        first_name = user_info.get('first_name').split(' ')
        patronym = first_name[1] if len(first_name) > 1 else None
        first_name = first_name[0]
        last_name = user_info.get('last_name')

        try:
            await sql.execute("put_user.sql", (id, first_name, last_name, patronym, email))
        except Exception as e:
            print(f"Ошибка при получении информации о пользователе! Описание: {e}")
            return redirect(url_for('homepage'))

        avatar_link = "static/alt_photo.png"
        if not user_info.get('is_avatar_empty'):
            avatar_link = "https://avatars.yandex.net/get-yapic/%s/islands-200" % user_info.get('default_avatar_id')

        session['id'] = id
        session['avatar_link'] = avatar_link

        return redirect(url_for('apps'))

    except Exception as e:
        print(f"Ошибка при авторизации! Описание: {e}")
        return redirect(url_for('homepage'))

@app.route('/apps')
def apps():
    if not session.get('id'):
        return redirect(url_for('homepage'))

    return render_template('apps_page.html')

@app.route('/funds')
def funds():
    if not session.get('id'):
        return redirect(url_for('homepage'))

    return render_template('funds_page.html')

@app.route('/api/funds/<int:id>')
def open_fund(id):
    if not session.get('id'):
        return redirect(url_for('homepage'))

    print(id)
    return jsonify({"id": id})


@app.route('/guide')
def guide():
    if not session.get('id'):
        return redirect(url_for('homepage'))

    return render_template('guide_page.html')

@app.route('/department')
def department():
    if not session.get('id'):
        return redirect(url_for('homepage'))

    return render_template('department_page.html')

@app.route('/settings')
def settings():
    if not session.get('id'):
        return redirect(url_for('homepage'))

    return render_template('settings_page.html')


@app.route('/api/logout', methods=['POST'])
def logout_api():
    data = request.get_json()

    redirect_uri = ""
    if data.get('type') == "logout":
        redirect_uri = url_for('homepage')

        session.pop('id', None)
        session.clear()

    return redirect(redirect_uri)

@app.route('/api/get_user_session', methods=['GET'])
def get_user_session():
    try:
        user_id = session.get('id')
        avatar_link = session.get('avatar_link')

        user_data = {
            'id': user_id,
            'avatar_link': avatar_link
        }

        return jsonify({"status": "success", "data": user_data})
    except Exception as e:
        print(f"Ошибка при отправке информации о сессии! Описание: {e}")

@app.route('/api/get_user_info', methods=['GET'])
async def get_user_info():
    try:
        user_id = session.get('id')

        try:
            await sql.connect()
        except:
            print("Подключение уже произведено")
        finally:
            result = await sql.execute("get_user.sql", (user_id,), fetch=True)
            name, surname, patronym, phone, tg_nick, email, _, group, year, role = result

            departments = await sql.execute("get_departments.sql", (user_id,), fetch=True, one=False)
            print(departments)
            departments = [x[0] if x[0] is not None else "" for x in departments]
            await sql.close()

        user_data = {
            'email': email,
            'fullname': surname + ' ' + name + ' ' + patronym,
            'group': group,
            'year': year,
            'phone': phone,
            'telegram': tg_nick,
            'role': role,
            'departs': departments,
            'avatar_link': session.get('avatar_link'),
        }

        return jsonify({"status": "success", "data": user_data})
    except Exception as e:
        print(f"Ошибка при отправке информации о пользователе! Описание: {e}")
        return jsonify({"status": "failure", "message": e})

@app.route('/api/change_contacts', methods=['POST', 'GET'])
async def change_contacts():
    try:
        data = request.get_json()

        contact_type = data.get('type')
        value = data.get('value') if len(data.get('value'))>0 else None

        try:
            await sql.connect()
        except: pass
        finally: await sql.execute(f"change_contacts_{contact_type}.sql", (value, session.get('id')))

        return jsonify({"status": "success", "message": f"{contact_type} изменен"})
    except Exception as e:
        print(f"Ошибка при обновлении контактной информации пользователя! Описание: {e}")
        return jsonify({"status": "failure", "message": e})

# TODO: добавить в отдельный конфиг-файл
roles = {
    "Студент": 0,
    "Начальник курса": 1,
    "Староста курса": 1,
    "Глава департамента": 2,
}

@app.route('/api/get_funds', methods=['GET'])
async def get_funds():

    await sql.connect()
    # role_info = await sql.execute("get_role.sql", (session.get('id'),), fetch=True)
    # role_info = (role_info[0], role_info[1], roles[role_info[2]])
    # await sql.connect()

    user_info = await sql.execute("get_user.sql", (session.get('id'),), fetch=True)
    user_info = user_info[-3:]

    course = min(get_course(user_info[1], user_info[0]), 5)

    await sql.connect()
    funds_list = await sql.execute("get_funds.sql", (course, session.get('id'), session.get('id'),), fetch=True, one=False)

    data = {
        'can_change': roles[user_info[-1]],
        'funds_list': funds_list[:30]
    }

    return jsonify({"status": "success", "session_id": session.get('id'), "data" : data})
    # except Exception as e:
    #     print(f"Ошибка при получении информации о сборах! Описание: {e}")
    #     return jsonify({"status": "failure"})

@app.route('/api/get_own_to_funds', methods=['GET'])
async def get_own_to_funds():
    await sql.connect()
    res = await sql.execute("get_role.sql", (session.get('id'),), fetch=True)
    deps = await sql.execute("get_departments.sql", (session.get('id'),), fetch=True, one=False)
    dep_ids = [el[1] for el in deps]
    deps = [el[0] for el in deps]
    res = {
        "group": res[0],
        "year": res[1],
        "role": roles[res[2]],
        "departments": deps,
        "department_ids": dep_ids,
    }


    return jsonify({"status": "success", "data": res})

@app.route('/api/put_fund', methods=['POST'])
async def put_fund():
    data = request.get_json()
    user_data = json.loads((await get_own_to_funds()).data.decode('utf-8'))['data']

    course = min(get_course(user_data['year'], user_data['group']), 5)

    await sql.execute("put_fund.sql",
                      (data['start_date'], data['end_date'],
                       session.get('id'), user_data['role'],
                       course, user_data['department_ids'][0],
                       b"table",))

    return jsonify({"status": "success"})
    # await sql.connect()


@app.route('/api/get_apps', methods=['GET'])
async def get_apps():
    try:
        # try:
        #     await sql.connect()
        # except: print("Подключение уже произведено")
        # finally:
        #     role_info = await sql.execute("get_role.sql", (session.get('id'),), fetch=True)
        #     role_info = (role_info[0], role_info[1], role_info[2] not in ["Студент"])
        #     await sql.close()

        return jsonify({"status": "success", "data" : ""})
    except Exception as e:
        print(f"Ошибка при получении информации о заявлениях! Описание: {e}")
        return jsonify({"status": "failure"})

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True, port=5000)

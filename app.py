from flask import Flask, redirect, url_for, session, request, render_template_string, render_template, jsonify
from authlib.integrations.flask_client import OAuth
from pygments.lexers import templates
import database.db_manager as db_manager

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
        return redirect(url_for('welcome'))
    return render_template("aux_page.html", link=url_for('login'))

@app.route('/login')
def login():
    session.clear()
    redirect_uri = url_for('authorize', _external=True)
    return yandex.authorize_redirect(redirect_uri, prompt='login', force_confirm='yes')

@app.route('/authorize')
def authorize():
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
            sql.execute("put_user.sql", (id, first_name, last_name, patronym, email))
        except Exception as e:
            print(f"Ошибка при получении информации о пользователе! Описание: {e}")
            return redirect(url_for('homepage'))

        avatar_link = "static/alt_photo.png"
        if not user_info.get('is_avatar_empty'):
            avatar_link = "https://avatars.yandex.net/get-yapic/%s/islands-200" % user_info.get('default_avatar_id')

        session['id'] = id
        session['avatar_link'] = avatar_link

        return redirect(url_for('welcome'))

    except Exception as e:
        print(f"Ошибка при авторизации! Описание: {e}")
        return redirect(url_for('homepage'))

@app.route('/welcome')
def welcome():
    if not session.get('id'):
        return redirect(url_for('homepage'))

    return render_template('user_account.html')

@app.route('/api/logout', methods=['POST'])
def logout_api():
    data = request.get_json()

    redirect_uri = ""
    if data.get('type') == "logout":
        redirect_uri = url_for('homepage')

        session.pop('id', None)
        session.clear()

    return redirect(redirect_uri)

@app.route('/api/get_user_info', methods=['GET'])
def get_user_info():
    try:
        result = sql.execute("get_user.sql", (session.get('id'),), fetch=True)
        name, surname, patronim, phone, tg_nick, email, _, group, year, role = result

        user_data = {
            'email': email,
            'fullname': name + ' ' + surname + ' ' + patronim,
            'group': group,
            'year': year,
            'phone': phone,
            'telegram': tg_nick,
            'role': role,
            'avatar_link': session.get('avatar_link'),
        }

        return jsonify({"status": "success", "data": user_data})
    except Exception as e:
        print(f"Ошибка при отправке информации о пользователе! Описание: {e}")
        return jsonify({"status": "failure", "message": e})

@app.route('/api/change_contacts', methods=['POST', 'GET'])
def change_contacts():
    try:
        data = request.get_json()

        contact_type = data.get('type')
        value = data.get('value') if len(data.get('value'))>0 else None

        sql.execute(f"change_contacts_{contact_type}.sql", (value, session.get('id')))

        return jsonify({"status": "success", "message": f"{contact_type} изменен"})
    except Exception as e:
        print(f"Ошибка при обновлении контактной информации пользователя! Описание: {e}")
        return jsonify({"status": "failure", "message": e})


if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True, port=5000)

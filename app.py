# app.py
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

# Стартовая страница
@app.route('/')
def homepage():
    return render_template("aux_page.html", link=url_for('login'))

# Роут для авторизации
@app.route('/login')
def login():
    session.clear()
    redirect_uri = url_for('authorize', _external=True)
    return yandex.authorize_redirect(redirect_uri, prompt='login', force_confirm='yes')

# Callback после входа через Яндекс
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

        sql.execute("put_user.sql", (id, first_name, last_name, patronym, 1, email))

        avatar_link = "static/alt_photo.png"
        if not user_info.get('is_avatar_empty'):
            avatar_link = "https://avatars.yandex.net/get-yapic/%s/islands-200" % user_info.get('default_avatar_id')

        session['user_email'] = email
        session['user_name'] = last_name + ' ' + first_name + ' ' + patronym
        session['avatar_link'] = avatar_link

        return redirect(url_for('welcome'))

    except Exception as e:
        print(f"Ошибка! Описание: {e}")
        return redirect(url_for('homepage'))

@app.route('/api/user_info', methods=['GET'])
def user_info():
    user_data = {
        'email': session.get('user_email'),
        'fullname': session.get('user_name'),
        'avatar_link': session.get('avatar_link'),
    }

    return jsonify(user_data)


# Приветственная страница
@app.route('/welcome')
def welcome():
    if not session.get('user_email'):
        return redirect(url_for('homepage'))

    return render_template('user_account.html')

@app.route('/logout', methods=['GET'])
def logout():
    # Удаляем данные пользователя из сессии
    session.pop('user_email', None)
    session.clear()

    return redirect(url_for('homepage'))

# --- Получаем данные от фронтенда (POST) ---
@app.route('/api/logout', methods=['POST'])
def logout_api():
    data = request.get_json()
    print("Получено от фронтенда:", data)

    redirect_uri = ""
    if data.get('type') == "logout":
        redirect_uri = url_for('logout')

    return redirect(redirect_uri)

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True, port=5000)

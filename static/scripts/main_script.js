// document.querySelector('.overlay').addEventListener('click', (e) => {
//     if (e.target.classList.contains('overlay')) {
//         document.querySelector('.overlay').style.display = 'none';
//     }
// });

// async function editContacts(object) {
//     object.classList.add("active");
//
//     function handleClickOutside(event) {
//         const isClickInside = object.contains(event.target);
//         if (!isClickInside) {
//             cleanup();
//             object.classList.remove("active");
//            
//             console.log(object.value.replace(/\D/g, ""));
//         }
//     }
//
//     // function handleKeydown(event) {
//     //     console.log('Key released in input:', event.key);
//     //     if (event.key === 'Enter') {
//     //         object.classList.remove("active");
//     //         cleanup();
//     //     }
//     // }
//     //
//     document.addEventListener("click", handleClickOutside);
//     // document.addEventListener("keydown", handleKeydown);
//
//     function cleanup() {
//         document.removeEventListener("click", handleClickOutside);
//         // document.removeEventListener("keydown", handleKeydown);
//     }
// }

// Подгрузка инфы о пользователе при загрузке страницы
document.addEventListener('DOMContentLoaded', async function () {
    await getUserInfo();
});

// Основные элементы
const account_menu_close_btn = document.querySelector(".account_menu_close_btn");
const account_menu_overlay = document.querySelector(".overlay");
const user_icon = document.querySelector(".navigation__user");
const logout_btn = document.querySelector(".sign_out_btn");
const phone = document.querySelector("#phone-number");
const telegram = document.querySelector("#tg-nickname");

const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");
const style = getComputedStyle(phone);
context.font = `${style.fontSize} ${style.fontFamily}`;

let change_flag_phone = 0;
let change_flag_telegram = 0;

// Вычисление курса обучения
async function getCourse(year) {
    const admission_year = new Date(year, 8, 1);
    const now = new Date();

    let course = now.getFullYear() - admission_year.getFullYear() + 1;

    if (now.getMonth() < 8) {
        course--;
    }

    return course;
}

// Получение инфы о пользователе
async function getUserInfo() {
    const response = await fetch('/api/get_user_info');
    const expand = await response.json();

    if (expand["status"] === "success") {
        const data = expand.data;

        let year = await getCourse(data['year']);
        let phone_number = data['phone'];
        let role_title = data['role'];

        document.querySelector(".user_fullname").textContent = data['fullname'];
        document.querySelector(".user_email").textContent = data['email'];
        document.querySelector(".user_study #group #group-number").textContent = data['group'];
        document.querySelector(".user_study #course #course-number").textContent = (year.toFixed() || " курс");
        document.querySelector(".user_avatar img").src = data['avatar_link'];

        if (phone_number !== null) {
            phone.value = `+7 (${phone_number.substring(2, 5)}) ${phone_number.substring(5, 8)}
-${phone_number.substring(8, 10)}-${phone_number.substring(10, 12)}`;
        } else {
            phone.value = phone_number;
        }
        telegram.value = data['telegram'];

        const role = document.querySelector(".user_role");
        if (role_title === "Студент") {
            role.style.display = "none";
        } else {
            role.style.display = "block";
            role.querySelector("#role").textContent = role_title;
        }
    } else {
        console.log(expand["status"], expand["message"]);
    }
}

// Открытие карточки пользователя
user_icon.addEventListener("click", async () => {
    await getUserInfo();

    const text_width_phone = context.measureText(phone.value || phone.placeholder).width;
    phone.style.width = `${text_width_phone + 10}px`;
    const text_width_telegram = context.measureText(telegram.value || telegram.placeholder).width;
    telegram.style.width = `${text_width_telegram + 10}px`;

    account_menu_overlay.style.display = "flex";
});

// Закрытие карточки пользователя (крестик)
account_menu_close_btn.addEventListener("click", (e) => {
    if (e.button === 0) {
        account_menu_overlay.style.display = "none";
        telegram.classList.remove("wrong");
        phone.classList.remove("wrong");
    }
});

// Закрытие карточки пользователя (оверлей)
account_menu_overlay.addEventListener("click", (e) => {
    if (e.target === account_menu_overlay && e.button === 0) {
        account_menu_overlay.style.display = "none";
        telegram.classList.remove("wrong");
        phone.classList.remove("wrong");
    }
});

// Выход из аккаунта
logout_btn.addEventListener("click", async (e) => {
    if (e.button === 0) {
        const responseData = {
            type: "logout"
        };

        const response = await fetch('/api/logout', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(responseData)
        });
        
        if (response.redirected) {
            window.location.href = response.url;
        }
    }
});

// Функции обработки телефона и почты
async function handleClickOutside(event) {
    const isClickInsidePhone = phone.contains(event.target);
    const isClickInsideTelegram = telegram.contains(event.target);

    if (!isClickInsidePhone) {
        cleanup();
        phone.classList.remove("active");
        change_flag_phone = 0;

        if (phone.value.length < 18 && phone.value.length > 0) {
            phone.classList.add("wrong");
        } else {
            phone.classList.remove("wrong");
            let number = phone.value.replace(/\D/g, "");
            if (phone.value.length > 0) {number = `+${number}`;}
            await changeContacts("phone", number);
        }
    }

    if (!isClickInsideTelegram) {
        cleanup();
        telegram.classList.remove("active");
        change_flag_telegram = 0;

        if (telegram.value.length <= 5 && telegram.value.length > 0) {
            telegram.classList.add("wrong");
        } else {
            telegram.classList.remove("wrong");
            await changeContacts("telegram", telegram.value);
        }
    }
}

async function handleKeydown(event) {
    if (event.key === 'Enter') {
        cleanup();
        phone.classList.remove("active");
        telegram.classList.remove("active");
        change_flag_telegram = 0;
        change_flag_phone = 0;

        if (phone.value.length < 18 && phone.value.length > 0) {
            phone.classList.add("wrong");
        } else {
            phone.classList.remove("wrong");
            let number = phone.value.replace(/\D/g, "");
            if (phone.value.length > 0) {number = `+${number}`;}
            await changeContacts("phone", number);
        }

        if (telegram.value.length <= 5 && telegram.value.length > 0) {
            telegram.classList.add("wrong");
        } else {
            telegram.classList.remove("wrong");
            await changeContacts("telegram", telegram.value);
        }
    }
}

function cleanup() {
    document.removeEventListener("click", handleClickOutside);
    document.removeEventListener("keydown", handleKeydown);
}

// Отправка измененных контактов в БД
async function changeContacts(type, val) {
    const responseData = {
        type: type,
        value: val
    };

    const response = await fetch('/api/change_contacts', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(responseData)
    });

    console.log(response.status, response.ok);
}

// Ввод телефона
phone.addEventListener("input", (e) => {
    const target = e.target;
    let value = target.value.replace(/\D/g, "");

    if (value.startsWith("7")) value = value.slice(1);

    let formatted = "+7 ";
    if (value.length === 0) formatted = "";
    if (value.length > 0) formatted += "(" + value.substring(0, 3);
    if (value.length > 3) formatted += ") " + value.substring(3, 6);
    if (value.length > 6) formatted += "-" + value.substring(6, 8);
    if (value.length > 8) formatted += "-" + value.substring(8, 10);

    let textWidth = context.measureText(formatted || target.placeholder).width;

    target.value = formatted;
    target.style.width = `${textWidth + 10}px`;

    change_flag_phone = Math.min(change_flag_phone+1, 2);

    if (change_flag_phone === 1) {
        document.addEventListener("click", handleClickOutside);
        document.addEventListener("keydown", handleKeydown);
        target.classList.add("active");
        change_flag_phone = 2;
    }
});

// Ввод телеграма
telegram.addEventListener("input", (e) => {
    const target = e.target;
    let value = target.value;

    if (value.startsWith("@")) value = value.slice(1);

    let formatted = "@";
    if (value.length === 0) formatted = "";
    if (value.length > 0) formatted += value.substring(0);

    let textWidth = context.measureText(formatted || target.placeholder).width;

    target.value = formatted;
    target.style.width = `${textWidth + 10}px`;

    change_flag_telegram = Math.min(change_flag_telegram+1, 2);

    if (change_flag_telegram === 1) {
        document.addEventListener("click", handleClickOutside);
        document.addEventListener("keydown", handleKeydown);
        target.classList.add("active");
        change_flag_telegram = 2;
    }
});

function copyFunc() {
    const copyText = document.querySelector(".user_email").textContent;
    window.navigator.clipboard.writeText(copyText);
}

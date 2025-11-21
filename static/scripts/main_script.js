const PATH_NAMES = {
    "funds": '/funds',
    "apps": '/apps',
    "guide": '/guide',
    "department": '/department',
    "settings": '/settings',
}
const API_GET_USER_SESSION = '/api/get_user_session';
const API_GET_USER_INFO = '/api/get_user_info';
const API_CHANGE_CONTACTS = '/api/change_contacts';
const API_LOGOUT = '/api/logout';


const pageHeader = document.querySelector(".page-header");
const navigationMenu = pageHeader.querySelector(".navigation__menu");
const navigationLinks = navigationMenu.querySelectorAll(".navigation__link");
const navigationUser = pageHeader.querySelector(".navigation__user img");

const messageWindow = document.querySelector(".message-window");
const messageWindowProgress = messageWindow.querySelector(".message-window-progress");
const messageMainLabel = messageWindow.querySelector(".message__text-1");
const messageAuxLabel = messageWindow.querySelector(".message__text-2");

const overlays = document.querySelectorAll(".overlay");
const accountMenuOverlay = document.querySelector(".account-menu-overlay");
const accountMenuInfo = accountMenuOverlay.querySelector(".account-menu__info");
const accountMenuInfoAvatar = accountMenuInfo.querySelector(".account-menu__info__avatar img");
const accountMenuInfoFullname = accountMenuInfo.querySelector(".account-menu__info__fullname");
const accountMenuInfoEmail = accountMenuInfo.querySelector(".account-menu__info__email");
const accountMenuInfoStudy = accountMenuInfo.querySelector(".account-menu__info__study");
const accountMenuInfoContacts = accountMenuInfo.querySelector(".account-menu__info__contacts");
const accountMenuInfoDepartments = accountMenuInfo.querySelector(".account-menu__info__departments");
const accountMenuInfoRole = accountMenuInfo.querySelector(".account-menu__info__role");

const groupNumber = accountMenuInfoStudy.querySelector("#group-number");
const courseNumber = accountMenuInfoStudy.querySelector("#course-number");
const phoneNumber = accountMenuInfoContacts.querySelector("#phone-number");
const telegramNickname = accountMenuInfoContacts.querySelector("#tg-nickname");
const phoneNumberSubmitButton = accountMenuInfoContacts.querySelector(".phone-submit-button");
const telegramNicknameSubmitButton = accountMenuInfoContacts.querySelector(".tg-submit-button");
const departmentGrid = accountMenuInfoDepartments.querySelector(".departments-grid");

// const accountMenuCloseButton = accountMenuOverlay.querySelector(".account-menu__close-button");
const accountMenuSignOutButton = accountMenuOverlay.querySelector(".account-menu__sign-out-button");

const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");
const style = getComputedStyle(groupNumber);
context.font = `${style.fontSize} ${style.fontFamily}`;

const cache = new Map();


// =============================== //
// ===== АСИНХРОННЫЕ ФУНКЦИИ ===== //
// =============================== //

// ===== запрос на сервер ===== //

async function request(url, options = {}) {
    // if (cache.has(url)) return cache.get(url);
    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        if (response.redirected) {
            window.location.href = response.url;
        }

        const data = (await response.json())['data'];
        // if (options['method'] !== 'POST') {cache.set(url, data);}

        return data;
    } catch (error) {
        console.error("Request failed:", error);
        throw error;
    }
}

// ===== получение информации о текущей сессии ===== //

async function getUserSession() {
    const data = await request(API_GET_USER_SESSION);

    navigationUser.src = data['avatar_link'];
}

// ===== копирование нажатого текста ===== //

async function copyFunc(event) {
    const copyText = event.target.textContent;
    await window.navigator.clipboard.writeText(copyText);
}

// ===== отправление измененных контактов на сервер ===== //

async function changeContacts(type, value) {
    const data = {
        type: type,
        value: value,
    };

    const options = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    };

    await request(API_CHANGE_CONTACTS, options);
}

// ===== выход из аккаунта ===== //

async function logout() {
    const options = {
        method: 'POST',
    };

    await request(API_LOGOUT, options);
}

// ===== получение информации о пользователе ===== //

async function getUserInfo() {
    const data = await request(API_GET_USER_INFO);

    const group = data['group'];
    const year = Math.min(getCourse(data['year']), 6).toFixed();
    const phone = data['phone'];
    const telegram = data['telegram'];

    const departments = data['departs'];
    const roleTitle = data['role'];

    accountMenuInfoAvatar.src = data['avatar_link'];
    accountMenuInfoFullname.textContent = data['fullname'];
    accountMenuInfoEmail.textContent = data['email'];

    groupNumber.textContent = group;
    courseNumber.textContent = `${year} курс`;

    phoneNumber.value = `+7 (${phone.substring(2, 5)}) ${phone.substring(5, 8)}
-${phone.substring(8, 10)}-${phone.substring(10, 12)}`;

    telegramNickname.value = telegram;

    if (departments.length === 1 && departments[0] === '') {
        accountMenuInfoDepartments.style.display = "none";
    } else {
        accountMenuInfoDepartments.style.display = "block";
        departmentGrid.replaceChildren();

        departments.forEach(depart => addDepart(depart));
    }

    if (roleTitle === "Студент") {
        accountMenuInfoRole.style.display = "none";
    } else {
        accountMenuInfoRole.style.display = "block";
        accountMenuInfoRole.textContent = roleTitle;
    }
}


// =================== //
// ===== ФУНКЦИИ ===== //
// =================== //

// ===== появление сообщения ===== //

function showMessage(label, text) {
    messageMainLabel.textContent = label;
    messageAuxLabel.textContent = text;

    messageWindow.classList.add("active");
    messageWindowProgress.classList.add("active");

    setTimeout(() => {
        messageWindow.classList.remove("active");
    }, 5000);

    setTimeout(() => {
        messageWindowProgress.classList.remove("active");
    }, 5300);
}

// ===== вычисление курса обучения ===== //

function getCourse(year) {
    const admissionYear = new Date(year, 8, 1);
    const now = new Date();

    let course = now.getFullYear() - admissionYear.getFullYear() + 1;

    if (now.getMonth() < 8) {
        course--;
    }

    return course;
}

// ===== добавление департамента в сетку ===== //

function addDepart(departmentName) {
    const newDepartment = document.createElement('span');
    newDepartment.classList.add("depart");
    newDepartment.textContent = departmentName;

    departmentGrid.appendChild(newDepartment);
}


// ===================== //
// ===== ЛИСТЕНЕРЫ ===== //
// ===================== //

// ===== подтверждения изменений контактов ===== //

phoneNumberSubmitButton.addEventListener("click", async (e) => {
    if (phoneNumber.value.length < 18 && phoneNumber.value.length > 0) {
        phoneNumber.classList.add("wrong");
    } else {
        phoneNumber.classList.remove("wrong");
        phoneNumberSubmitButton.style.display = 'none';
        let number = phoneNumber.value.replace(/\D/g, "");
        if (phoneNumber.value.length > 0) {number = `+${number}`;}

        await changeContacts("phone", number);
    }
});

telegramNicknameSubmitButton.addEventListener("click", async (e) => {
    if (telegramNickname.value.length <= 5 && telegramNickname.value.length > 0) {
        telegramNickname.classList.add("wrong");
    } else {
        telegramNickname.classList.remove("wrong");
        telegramNicknameSubmitButton.style.display = 'none';
        let nickname = telegramNickname.value;

        await changeContacts("telegram", nickname);
    }
});

// ===== обработка изменений контактов ===== //

phoneNumber.addEventListener("input", (e) => {
    phoneNumberSubmitButton.style.display = 'flex';

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
});

telegramNickname.addEventListener("input", (e) => {
    telegramNicknameSubmitButton.style.display = 'flex';

    const target = e.target;
    let value = target.value;

    if (value.startsWith("@")) value = value.slice(1);

    let formatted = "@";
    if (value.length === 0) formatted = "";
    if (value.length > 0) formatted += value.substring(0);

    let textWidth = context.measureText(formatted || target.placeholder).width;

    target.value = formatted;
    target.style.width = `${textWidth + 10}px`;
});

// ===== открытие карточки пользователя ===== //

navigationUser.addEventListener("click", async () => {
    await getUserInfo();

    pageHeader.style.display = "none";
    const textWidthPhone = context.measureText(phoneNumber.value || phoneNumber.placeholder).width;
    phoneNumber.style.width = `${textWidthPhone + 10}px`;
    const textWidthTelegram = context.measureText(telegramNickname.value || telegramNickname.placeholder).width;
    telegramNickname.style.width = `${textWidthTelegram + 10}px`;

    accountMenuOverlay.style.display = "flex";
});

// ===== закрытие карточки пользователя ===== //

accountMenuOverlay.addEventListener("mousedown", (e) => {
    if (e.target === accountMenuOverlay && e.button === 0) {
        pageHeader.style.display = "block";

        telegramNickname.classList.remove("wrong");
        phoneNumber.classList.remove("wrong");

        phoneNumberSubmitButton.style.display = "none";
        telegramNicknameSubmitButton.style.display = "none";
    }
});

// ===== выход из аккаунта ===== //

accountMenuSignOutButton.addEventListener("click", async (e) => {
    if (e.button === 0) await logout();
});

// ===== закрытие любого оверлея ===== //

overlays.forEach(overlay => {
    overlay.addEventListener("mousedown", (e) => {
        if (e.target === overlay && e.button === 0) {
            overlay.style.display = "none";
        }
    });
});

// ===== переход по навигации ===== //

navigationLinks.forEach(link =>
    link.addEventListener("click",() => {
        const pathname = PATH_NAMES[link.id];

        if (window.location.pathname !== pathname) {
            window.location.href = pathname
        }
    })
)


// ============================= //
// ===== ЗАГРУЗКА СТРАНИЦЫ ===== //
// ============================= //

document.addEventListener('DOMContentLoaded', async function () {
    document.querySelector(`.navigation__link#${window.location.pathname.substring(1).split('/')[0]}`).classList.add("active");

    await getUserSession();
});

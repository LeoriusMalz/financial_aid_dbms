const MONTHS = {
    1: "Январь",
    2: "Февраль",
    3: "Март",
    4: "Апрель",
    5: "Май",
    6: "Июнь",
    7: "Июль",
    8: "Август",
    9: "Сентябрь",
    10: "Октябрь",
    11: "Ноябрь",
    12: "Декабрь",
};
const API_GET_APPS = '/api/get_applications';
const API_GET_APP = '/api/get_application';
const API_DELETE_APP = '/api/delete_application';


const applicationPage = document.querySelector(".application-page");
const applicationEmptyPage = applicationPage.querySelector(".application-empty");
const applicationWindowOverlay = applicationPage.querySelector(".application-window-overlay");
const applicationGrid = applicationPage.querySelector(".application-grid");

const applicationWindow = applicationWindowOverlay.querySelector(".application-window");
const applicationWindowLabel = applicationWindow.querySelector(".application-window__label");
const applicationWindowTotal = applicationWindow.querySelector(".application-window__total");
const applicationWindowComment = applicationWindow.querySelector(".application-window__comment textarea");
const applicationWindowCatsListTable = applicationWindow.querySelector(".categories-list__table");

const applicationWindowButtons = applicationWindow.querySelector(".application-window__buttons");
const downloadButton = applicationWindowButtons.querySelector(".button.download");
const deleteButton = applicationWindowButtons.querySelector(".button.delete");


// =============================== //
// ===== АСИНХРОННЫЕ ФУНКЦИИ ===== //
// =============================== //

async function getApplications() {
    const data = await request(API_GET_APPS);

    applicationPage.style.display = "block";
    const applications = data['applications_list'];

    if (!applications.length) {
        applicationEmptyPage.style.display = "block";
    }

    applications.forEach(app => {
        showApplicationCell(app);
    })
}

async function getApplication(id) {
    const options = {
        method: 'GET',
    }
    const url = `${API_GET_APP}/${id}`;
    const response = await request(url, options);

    if (!response) {
        showMessage("Ошибка!", "Такое заявление недоступно!");
    } else {
        showApplication(response);
    }
}

async function deleteApplication(id) {
    const options = {
        method: 'DELETE',
    }
    console.log(id);
    const url = `${API_DELETE_APP}/${id}`;
    const response = await request(url, options);

    if (!response['is_deleted']) {
        showMessage("Ошибка!", "Это заявление удалить нельзя!");
    } else {
        sessionStorage.setItem('deletedStatus', JSON.stringify(true));
        hideApplication(true);
    }
}


// =================== //
// ===== ФУНКЦИИ ===== //
// =================== //

// ===== отображение заявлений ===== //

function showApplicationCell(application) {
    const applicationID = application[0];
    const applicationMonth = MONTHS[parseInt(application[3])];
    const applicationDate = application[2];

    let applicationApprove = null;
    if (application[7] === 1) {
        applicationApprove = "approve";
    } else if (application[7] === 0) {
        applicationApprove = "reject";
    }

    let applicationLabel = "";
    if (application[4] === 1) {
        applicationLabel = `${application[5]} курс`;
    } else {
        applicationLabel = application[6];
    }

    const newApplication = document.createElement('div');
    newApplication.classList.add("application-grid__element");
    if (applicationApprove) newApplication.classList.add(applicationApprove);
    newApplication.id = applicationID;

    const newApplicationMonth = document.createElement('div');
    newApplicationMonth.classList.add("application-grid__element__month");
    newApplicationMonth.textContent = applicationMonth;

    const newApplicationDate = document.createElement('div');
    newApplicationDate.classList.add("application-grid__element__date");
    newApplicationDate.textContent = applicationDate;

    const newApplicationLabel = document.createElement('div');
    newApplicationLabel.classList.add("application-grid__element__label");
    newApplicationLabel.textContent = applicationLabel;

    newApplication.appendChild(newApplicationMonth);
    newApplication.appendChild(newApplicationDate);
    newApplication.appendChild(newApplicationLabel);

    applicationGrid.appendChild(newApplication);
    animateCell(newApplication);
    clickEvent(newApplication);
}

function animateCell(cell) {
    cell.addEventListener('mousemove', (e) => {
        const rect = cell.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * 15;
        const rotateY = ((x - centerX) / centerX) * -15;

        cell.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.08, 1.08, 1.08)`;
    })

    cell.addEventListener('mouseleave', () => {
        cell.style.transform = `rotateX(0deg) rotateY(0deg)`
    })
}

function clickEvent(cell) {
    cell.addEventListener('click', async () => {
        const applicationID = cell.id;
        history.pushState({}, "", `/apps/${applicationID}`);

        await getApplication(applicationID);
    })
}

// ===== отображение окна с информацией о заявлении ===== //

function showApplication(info) {
    applicationWindowCatsListTable.replaceChildren();

    const application = info['application'];
    const categories = info['categories'];

    applicationWindow.id = application[0];
    applicationWindowTotal.textContent = `${application[1]}₽`;
    applicationWindowComment.value = application[2];
    applicationWindowLabel.textContent = application[3];

    downloadButton.id = application[0];
    deleteButton.id = application[0];

    categories.forEach(cat => {
        let name = cat[0];
        let amount = cat[1];

        const catElement = document.createElement('tr');
        catElement.classList.add("categories-list__element");

        const catElementName = document.createElement('td');
        const catElementAmount = document.createElement('td');
        catElementName.classList.add("categories-list__element__name");
        catElementAmount.classList.add("categories-list__element__amount");

        catElementName.textContent = name;
        catElementAmount.textContent = `${amount}₽`;

        catElement.appendChild(catElementName);
        catElement.appendChild(catElementAmount);

        applicationWindowCatsListTable.appendChild(catElement);
    });

    applicationWindowOverlay.style.display = "flex";
}

function hideApplication(reload = false) {
    history.pushState({}, "", `/apps`);
    applicationWindow.removeAttribute('id');
    if (reload) {location.reload();}
}

applicationWindowOverlay.addEventListener('mousedown', (e) => {
    if (e.target === applicationWindowOverlay) {
        hideApplication();
    }
});

deleteButton.addEventListener('click', async (e) => {
    if (confirm("Вы уверены, что хотите удалить заявление? Эта операция необратима!")) {
        await deleteApplication(e.target.id);
    }
});


// ============================= //
// ===== ЗАГРУЗКА СТРАНИЦЫ ===== //
// ============================= //

document.addEventListener('DOMContentLoaded', async function () {
    await getApplications();
    if (APP_ID) {
        await getApplication(APP_ID);
    }

    if (JSON.parse(sessionStorage.getItem("deletedStatus"))) {
        showMessage("Успех!", "Заявление удалено!");
        sessionStorage.removeItem("deletedStatus");
    }
});
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

// Подгрузка инфы о пользователе при загрузке страницы
document.addEventListener('DOMContentLoaded', async function () {
    await getApps();
});
//
// const nav_link_funds = document.querySelector(".navigation__link#funds");
// const nav_link_apps = document.querySelector(".navigation__link#apps");
//
//

async function getApps() {
    const response = await (await fetch('/api/get_apps')).json();
    const data = response.data;

    const apps_page = document.querySelector(".apps");

    if (response["status"] === "success") {
        apps_page.style.display = "block";
        const apps_list = data['applications_list'];
        apps_list.forEach(app => {
            showApp(app);
        })

    } else {
        console.log(response["status"]);
    }

    animate();
}

const apps_grid = document.querySelector(".apps__grid");
// const app_element = apps_grid.querySelectorAll(".apps__element");
// const app_element_month = app_element.querySelector(".apps__element_month");
// const app_element_date = app_element.querySelector(".apps__element_date");
// const app_element_type = app_element.querySelector(".apps__element_type");

function showApp(app) {
    const app_id = app[0];
    const month = MONTHS[parseInt(app[3])];
    const app_date = app[2];

    let approve = null;
    if (app[7] === 1) {
        approve = "approve";
    } else if (app[7] === 0) {
        approve = "reject";
    }

    let label = "";
    if (app[4] === 1) {
        label = `${app[5]} курс`;
    } else {
        label = app[6];
    }

    const newApp = document.createElement('div');
    newApp.classList.add("apps__element");
    if (approve) newApp.classList.add(approve);
    newApp.id = app_id;

    const newApp_month = document.createElement('div');
    newApp_month.classList.add("apps__element_month");
    newApp_month.textContent = month;

    const newApp_date = document.createElement('div');
    newApp_date.classList.add("apps__element_date");
    newApp_date.textContent = app_date;

    const newApp_label = document.createElement('div');
    newApp_label.classList.add("apps__element_type");
    newApp_label.textContent = label;

    newApp.appendChild(newApp_month);
    newApp.appendChild(newApp_date);
    newApp.appendChild(newApp_label);

    apps_grid.appendChild(newApp);
}

function animate() {
    const app_element = apps_grid.querySelectorAll(".apps__element");

    app_element.forEach(element => {
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * 15;
            const rotateY = ((x - centerX) / centerX) * -15;

            element.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.08, 1.08, 1.08)`;
        })

        element.addEventListener('mouseleave', () => {
            element.style.transform = `rotateX(0deg) rotateY(0deg)`
        })
    });
}

// app_element.forEach(element =>
//     element.addEventListener('mouseleave', () => {
//         element.style.transform = `rotateX(0deg) rotateY(0deg)`
//     })
// );


// nav_link_funds.addEventListener("click", async (e) => {
//     // fundings_page.style.display = "block";
//     await getFunds();
// });

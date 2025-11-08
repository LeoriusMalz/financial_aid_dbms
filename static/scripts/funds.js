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
    await getFunds();
});
//
// const nav_link_funds = document.querySelector(".navigation__link#funds");
// const nav_link_apps = document.querySelector(".navigation__link#apps");
//
//

const fundings_create_btn = document.querySelector(".funding__create");
const fundings_page = document.querySelector(".funding");
const funding_menu_overlay = document.querySelector(".funding-overlay");

const funding_list = document.querySelector(".funding__list");

const funding_creating_window = document.querySelector(".funding-creating-win");
const fcw_own = funding_creating_window.querySelector(".fcw__own");
const fcw_dates = funding_creating_window.querySelector(".fcw__dates");
const fcw_create_btn = funding_creating_window.querySelector(".fcw__create");

async function getFunds() {
    const response = await (await fetch('/api/get_funds')).json();
    if (response["status"] === "success") {
        const data = response.data;
        const session_id = parseInt(response.session_id);

        if (data['can_change']) {
            fundings_create_btn.style.display = "flex";
        } else {
            fundings_create_btn.style.display = "none";
        }
        fundings_page.style.display = "block";

        console.log(data);

        for (const fund of data['funds_list']) {
            showFunds(fund, session_id);
        }
        animatePanel();
        clickEvent();
    }
}

async function getOwn2Funds() {
    const response = await (await fetch('/api/get_own_to_funds')).json();
    if (response["status"] === "success") {
        const data = response.data;
        let label = "";

        if (!data['role']) {
            alert(`Недостаточно прав! Данная роль не может создавать сборы!`);
            location.reload();
        } else if (data['role'] === 2) {
            const dep = data['departments'];
            if (dep.length > 1) {
                alert(`У данной роли не может быть больше 1 департамента!`);
                location.reload();
            }

            label = dep;
        } else {
            let course = await getCourse(data['year']);
            if (data['group'].startsWith("М")) {course += 4;}
            if (course < 5) {label = `${course} курс`;} else {label = "Магистратура";}
        }

        fcw_own.textContent = label;
    }
}

function showFunds(fund, session_id) {
    let dest = fund[6];

    if (fund[5] === 1) {
        if (dest > 4) {
            dest = "Магистратура";
        } else {
            dest = `${dest} курс`;
        }
    } else if (fund[5] === 2) {
        dest = fund[7];
    } else {
        return;
    }

    const newFund = document.createElement('div');
    newFund.classList.add("funding__element");
    newFund.id = fund[0];

    const newFund_dates = document.createElement('div');
    newFund_dates.classList.add("funding__element_dates");

    let start_date = new Date(fund[1] * 1000);
    let end_date = new Date(fund[2] * 1000 - 1000);
    newFund_dates.textContent = `${start_date.getDate()}.${start_date.getMonth()} - ${end_date.getDate()}.${end_date.getMonth()}`

    const newFund_status = document.createElement('div');
    newFund_status.classList.add("funding__element_status");

    const img_status = document.createElement('img');
    img_status.src = "../static/alt_photo.png";
    img_status.alt = "";
    newFund_status.appendChild(img_status);

    const newFund_owner = document.createElement('div');
    newFund_owner.classList.add("funding__element_owner");

    newFund_owner.textContent = `${fund[3]} ${fund[4]} | ${dest}`;

    if (end_date > new Date()) {
        newFund.classList.add("true");
    } else {
        newFund.classList.add("false");
    }
    if (fund[8] === session_id) {
        newFund.classList.add("own");
    }

    newFund.appendChild(newFund_dates);
    newFund.appendChild(newFund_status);
    newFund.appendChild(newFund_owner);

    funding_list.appendChild(newFund);
}

function animatePanel() {
    const fund_element = document.querySelectorAll(".funding__element");

    fund_element.forEach(element =>
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * 15;
            const rotateY = ((x - centerX) / centerX) * -15;

            element.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.08, 1.08, 1.08) translateX(40px)`;
        })
    );

    fund_element.forEach(element =>
        element.addEventListener('mouseleave', () => {
            element.style.transform = `rotateX(0deg) rotateY(0deg)`
        })
    );
}

function clickEvent() {
    const fund_element = document.querySelectorAll(".funding__element");

    fund_element.forEach(element =>
        element.addEventListener('click', async () => {
            let id = element.id;
            history.pushState({ fundId: id }, "", `/funds/${id}`);
            const response = await (await fetch(`/api/funds/${id}`)).json();
            console.log(response);
        })
    );
}

fundings_create_btn.addEventListener('click', async (e) => {
    funding_menu_overlay.style.display = "flex";
    await getOwn2Funds();

    const dates = fcw_dates.querySelectorAll("input");
    const start = dates[0];

    let now = new Date();
    now = `${now.getFullYear()}-${("0" + (now.getMonth()+1)).slice(-2)}-${("0" + now.getDate()).slice(-2)}`;
    console.log(now);
    // const start_date = (start.valueAsDate.getTime()/1000).toFixed();

    start.value = now;
});

funding_menu_overlay.addEventListener('click', (e) => {
    if (e.target === funding_menu_overlay) {
        funding_menu_overlay.style.display = "none";
    }
});

fcw_create_btn.addEventListener('click', async (e) => {
    // const start_date = fcw_dates.querySelector(" #start");
    // const end_date = fcw_dates.querySelector(" #end");
    const dates = fcw_dates.querySelectorAll("input");
    const start = dates[0];
    const end = dates[1];
    const alert_message = document.querySelector("#alert");

    const now = ((new Date()).getTime()/1000).toFixed();
    let start_date = start.valueAsDate;
    let end_date = end.valueAsDate;

    if (end.valueAsDate == null || end.valueAsDate <= start.valueAsDate) {
        end.classList.add("wrong");
        alert_message.textContent = "Некорректное значение конечной даты!";
        return;
    } else {
        alert_message.textContent = "";
        end_date = (end_date.getTime()/1000+86400-10800).toFixed();
        end.classList.remove("wrong");
    }

    if (start.valueAsDate == null || start.valueAsDate < now) {
        start.classList.add("wrong");
        alert_message.textContent = "Некорректное значение начальной даты!";
        return;
    } else {
        alert_message.textContent = "";
        start_date = (start_date.getTime()/1000-10800).toFixed();
        start.classList.remove("wrong");
    }

    const responseData = {"start_date": start_date, "end_date": end_date};

    const response = await fetch('/api/put_fund', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(responseData)
    });

    end.value = null;
    console.log(response);

    location.reload();
});



// nav_link_funds.addEventListener("click", async (e) => {
//     // fundings_page.style.display = "block";
//     await getFunds();
// });

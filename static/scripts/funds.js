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
    await getCategories();
    if (JSON.parse(sessionStorage.getItem("uploadStatus"))) {
        showMessage("Успех!", "Заявление подано!");
        sessionStorage.removeItem("uploadStatus");
    }
});
//
// const nav_link_funds = document.querySelector(".navigation__link#funds");
// const nav_link_apps = document.querySelector(".navigation__link#apps");
//
//

const fundings_create_btn = document.querySelector(".funding__create");
const fundings_page = document.querySelector(".funding");

const funding_menu_overlay = document.querySelector(".funding-overlay#create");
const funding_edit_overlay = document.querySelector(".funding-overlay#edit");

const funding_list = document.querySelector(".funding__list");

const funding_creating_window = document.querySelector(".funding-creating-win");
const fcw_own = funding_creating_window.querySelector(".fcw__own");
const fcw_dates = funding_creating_window.querySelector(".fcw__dates");
const fcw_create_btn = funding_creating_window.querySelector(".fcw__create");

const funding_window = document.querySelector(".fund-win");
const fw_cat_add_btn = funding_window.querySelector(".fw__cat-add button");
const fw_cat_list = funding_window.querySelector(".fw__cat-list");
const fw_cat = funding_window.querySelector(".fw__cat");
const fw_cat_select = funding_window.querySelector(".cat-select");
const fw_total_amount = funding_window.querySelector(".fw__total");
const fw_own = funding_window.querySelector(".fw__own");
const fw_send = funding_window.querySelector(".fw__send");
const fw_comment = funding_window.querySelector(".fw__comment");

const download_word = funding_window.querySelector("#download #word");
const download_pdf = funding_window.querySelector("#download #pdf");
const upload_app = funding_window.querySelector("#upload");

// const categories = getCategories();

const amount_inputs = fw_cat_list.querySelectorAll(".cat-amount");

amount_inputs[0].addEventListener("focusout", updateTotalAmount);


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

async function getCategories() {
    const response = await (await fetch('/api/get_cats')).json();
    if (response["status"] === "success") {
        const data = response.data;

        Object.entries(data).forEach(key => {
            const option = document.createElement('option');
            option.textContent = key[0];
            option.value = key[1].toString();
            fw_cat_select.appendChild(option);
        });
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
    newFund_dates.textContent = `${start_date.getDate()}.${start_date.getMonth()+1} - ${end_date.getDate()}.${end_date.getMonth()+1}`

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
    const fund_elements = document.querySelectorAll(".funding__element");

    fund_elements.forEach(element => {
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

        element.addEventListener('mouseleave', () => {
            element.style.transform = `rotateX(0deg) rotateY(0deg)`
        })
    });
}

function clickEvent() {
    const fund_elements = document.querySelectorAll(".funding__element.true");

    fund_elements.forEach(element =>
        element.addEventListener('click', async () => {
            let id = element.id;
            let check = await checkFund4App(id);

            if (check) {
                history.pushState({fundId: id}, "", `/funds/${id}`);
                document.title = `Сбор №${id}`

                showModal(element, id);
            }
        })
    );
}

function showModal(element, id) {
    funding_edit_overlay.style.display = "flex";
    funding_window.id = id;
    fw_own.textContent = element.querySelector(".funding__element_owner").textContent.split("| ")[1];
}

async function checkFund4App(fund_id) {
    const request = await fetch('/api/check_fund', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({id: fund_id})
    });

    if (request.ok) {
        const response = await request.json()
        const data = response.data;

        if (data['apps_num'] > 0) {
            showMessage("Извините!", "Заявление уже подано!")
            return false;
        }
        return true;
    } else {return false;}
}

async function uploadFile(cats, comment, file, fund) {
    const form = new FormData();
    form.append('categories', cats);
    form.append('file', file);
    form.append('comment', comment);
    form.append('fund_id', fund);

    const response = await fetch('/api/put_application', {
        method: 'PUT',
        body: form
    });

    if (!response.ok) {
        alert("Такой сбор недоступен!");
    } else {
        // message.classList.add("show");
        sessionStorage.setItem('uploadStatus', JSON.stringify(true));
    }

    location.reload();
}

upload_app.addEventListener('change', (e) => {
    fw_send.querySelector("button").disabled = !(e.target.files && e.target.files.length > 0);
});

fw_send.addEventListener('click', async () => {
    const fund_id = funding_window.id;
    let check = await checkFund4App(fund_id);

    if (check) {
        let cat_ids = {};
        let comment = "";
        let cats = funding_window.querySelectorAll(".fw__cat");

        if (upload_app.files.length === 0) {
            alert('Пожалуйста, выберите файл');
            return;
        }

        for (let i = 0; i < cats.length; i++) {
            let cat = cats[i];
            let category = cat.querySelector(".cat-select").value;
            let amount = cat.querySelector(".cat-amount").value;

            if (category === "none") {
                alert("Категория не может быть пустой!");
                return;
            }
            category = parseInt(category);
            if (cat_ids[category] || cat_ids[category] === 0) {
                alert("Категория не может повторяться!");
                return;
            }

            cat_ids[category] = parseInt(amount);
        }

        cat_ids = JSON.stringify(cat_ids);
        console.log(cat_ids);
        comment = fw_comment.querySelector("textarea").value;

        await uploadFile(cat_ids, comment, upload_app.files[0], fund_id);
    }

    history.pushState({}, "", `/funds`);
    document.title = `Сборы`
    location.reload();
});

fundings_create_btn.addEventListener('click', async (e) => {
    funding_menu_overlay.style.display = "flex";
    await getOwn2Funds();

    const dates = fcw_dates.querySelectorAll("input");
    const start = dates[0];

    let now = new Date();
    now = `${now.getFullYear()}-${("0" + (now.getMonth()+1)).slice(-2)}-${("0" + now.getDate()).slice(-2)}`;
    // const start_date = (start.valueAsDate.getTime()/1000).toFixed();

    start.value = now;
});

const fund_overlays = document.querySelectorAll(".funding-overlay");

fund_overlays.forEach(overlay => {
    overlay.addEventListener('mousedown', (e) => {
        let link;
        if (e.target === overlay) {
            overlay.style.display = "none";
            link = location.href.split('/');
            link = parseInt(link[link.length - 1]);
            if (link) {
                history.pushState({}, "", `/funds`);
                document.title = `Сборы`
                funding_window.removeAttribute('id');
            }
        }
    });
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

fw_cat_select.addEventListener('change', (e) => {
    const selector = e.target;
    selector.parentElement.id = selector.options[selector.selectedIndex].value;
});

fw_cat_add_btn.addEventListener('click', () => {
    let new_cat = fw_cat.cloneNode(true);

    new_cat.id = "none";
    new_cat.querySelector(".cat-select").addEventListener('change', (e) => {
        const selector = e.target;
        selector.parentElement.id = selector.options[selector.selectedIndex].value;
    });

    new_cat.querySelector(".cat-remove").disabled = false;
    new_cat.querySelector(".cat-amount").value = "0";

    new_cat.querySelector(".cat-amount").addEventListener('focusout', updateTotalAmount);

    fw_cat_list.appendChild(new_cat);

    const fw_cat_remove_btn = new_cat.querySelector(".cat-remove");
    fw_cat_remove_btn.addEventListener('click', () => {
        new_cat.remove();
        updateTotalAmount();
    });
});

download_word.addEventListener('click', downloadWord);

function updateTotalAmount() {
    const amount_inputs = fw_cat_list.querySelectorAll(".cat-amount");

    fw_total_amount.textContent = "0₽";
    amount_inputs.forEach(amount => {
        if (isNaN(parseInt(amount.value))) {
            amount.value = 0
        } else {
            amount.value = Math.max(parseInt(amount.value), 0)
        }
        if (amount.value >= 0) {
            fw_total_amount.textContent = parseInt(fw_total_amount.textContent) + parseInt(amount.value) + "₽";
        }
    });

    if (parseInt(fw_total_amount.textContent) <= 15000) {
        fw_total_amount.classList.remove("over");
    } else {
        fw_total_amount.classList.add("over")
    }
}

async function downloadWord(e) {
    let fund_window = e.target.parentElement.parentElement.parentElement.parentElement;
    let cat_ids = {};

    let cats = fund_window.querySelectorAll(".fw__cat");

    for (let i = 0; i < cats.length; i++) {
        let cat = cats[i];
        let category = cat.querySelector(".cat-select").value;
        let amount = cat.querySelector(".cat-amount").value;

        if (category === "none") {
            alert("Категория не может быть пустой!");
            return;
        }
        if (cat_ids[category] || cat_ids[category] === 0) {
            alert("Категория не может повторяться!");
            return;
        }

        cat_ids[category] = parseInt(amount);
    }

    const responseData = {"categories": cat_ids, "fund_id": fund_window.id};

    // const response = await fetch('/api/download_word', {
    //     method: 'POST',
    //     headers: {'Content-Type': 'application/json'},
    //     body: JSON.stringify(responseData)
    // });
    //
    // console.log(response);
}

// const category_amount = document.querySelector(".cat-amount");
// category_amount.addEventListener("input", (e) => {
//     let value = e.target.value;
//     console.log(value);
//     if (value < 0) e.target.value = "0₽";
// });


// nav_link_funds.addEventListener("click", async (e) => {
//     // fundings_page.style.display = "block";
//     await getFunds();
// });

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
    await getApps();
});
//
// const nav_link_funds = document.querySelector(".navigation__link#funds");
// const nav_link_apps = document.querySelector(".navigation__link#apps");
//
//

async function getApps() {
    const response = await fetch('/api/get_apps');
    const expand = await response.json();

    const apps_page = document.querySelector(".apps");

    if (expand["status"] === "success") {
        const data = expand.data;

        apps_page.style.display = "block";
        console.log(data);

    } else {
        console.log(expand["status"]);
    }
}

const app_element = document.querySelectorAll(".apps__element");
const app_element_month = document.querySelector(".apps__element_month");
const app_element_date = document.querySelector(".apps__element_date");
const app_element_type = document.querySelector(".apps__element_type");

app_element.forEach(element =>
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
);

app_element.forEach(element =>
    element.addEventListener('mouseleave', () => {
        element.style.transform = `rotateX(0deg) rotateY(0deg)`
    })
);


// nav_link_funds.addEventListener("click", async (e) => {
//     // fundings_page.style.display = "block";
//     await getFunds();
// });

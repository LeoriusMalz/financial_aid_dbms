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

async function getFunds() {
    const response = await fetch('/api/get_funds');
    const expand = await response.json();


    const fundings_create_btn = document.querySelector(".funding__create");
    const fundings_page = document.querySelector(".funding");

    if (expand["status"] === "success") {
        const data = expand.data;

        if (data[2]) {
            fundings_create_btn.style.display = "flex";
        } else {
            fundings_create_btn.style.display = "none";
        }
        fundings_page.style.display = "block";
        console.log(data);

    } else {
        console.log(expand["status"]);
    }
}

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


// nav_link_funds.addEventListener("click", async (e) => {
//     // fundings_page.style.display = "block";
//     await getFunds();
// });

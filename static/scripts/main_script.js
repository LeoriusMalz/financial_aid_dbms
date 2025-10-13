// document.querySelector('.overlay').addEventListener('click', (e) => {
//     if (e.target.classList.contains('overlay')) {
//         document.querySelector('.overlay').style.display = 'none';
//     }
// });

async function getUserInfo() {
    const response = await fetch('/api/user_info');
    const data = await response.json();

    document.querySelector(".user_fullname").textContent = data['fullname'];
    document.querySelector(".user_email").textContent = data['email'];
    document.querySelector(".user_avatar img").src = data['avatar_link'];
}


document.addEventListener('DOMContentLoaded', async function () {
    await getUserInfo();
});


const account_menu_close_btn = document.querySelector(".account_menu_close_btn");
const account_menu_overlay = document.querySelector(".overlay");
const user_icon = document.querySelector(".navigation__user");
const logout_btn = document.querySelector(".sign_out_btn");

account_menu_close_btn.addEventListener("mouseup", (e) => {
    if (e.button === 0) {
        account_menu_overlay.style.display = "none";
    }
});

user_icon.addEventListener("click", async () => {
    await getUserInfo();

    account_menu_overlay.style.display = "flex";
});

logout_btn.addEventListener('mouseup', async (e) => {
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
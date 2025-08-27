function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
}

function getCookie(name) {
    const cname = name + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let c of ca) {
        while (c.charAt(0) === ' ') c = c.substring(1);
        if (c.indexOf(cname) === 0) return c.substring(cname.length, c.length);
    }
    return "";
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".loginForm");

    if(!localStorage.getItem('cookiesConsent')){
        localStorage.setItem('cookiesConsent', 'false');
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        let users = JSON.parse(localStorage.getItem("users")) || [];

        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            alert("Invalid email or password.");
            return;
        }

        if (localStorage.getItem('cookiesConsent') === 'true') {
            console.log('Cookies consent given, setting persistent cookie');
            setCookie("loggedInUser", email, 7);
        }
        else {
            console.log('Cookies denied, using sessionStorage instead');
            sessionStorage.setItem("loggedInUser", email);
        }

        alert("Login successful!");
        window.location.href = "index.html";
    });
});

document.querySelector(".backBtn").addEventListener("click", () => {
    if (window.history.length > 1) {
        window.history.back(); // go back to the previous page
    } else {
        window.location.href = "index.html"; // fallback if no history
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".forgotForm");

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        let users = JSON.parse(localStorage.getItem("users")) || [];

        const user = users.find(u => u.email === email);

        if (!user) {
            alert("No account found with this email.");
            return;
        }

        // ⚠️ Insecure but works for demo
        alert(`Your password is: ${user.password}`);
        window.location.href = "login.html";
    });
});

document.querySelector(".backBtn").addEventListener("click", () => {
    if (window.history.length > 1) {
        window.history.back(); // go back to the previous page
    } else {
        window.location.href = "index.html"; // fallback if no history
    }
});

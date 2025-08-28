document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".registerForm");

    // Email validation function
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const confirmPassword = document.getElementById("confirmPassword").value.trim();

        // Email format validation
        if (!isValidEmail(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        if (password.length < 8) {
            alert("Password must be at least 8 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        let users = JSON.parse(localStorage.getItem("users")) || [];

        if (users.some(user => user.email === email)) {
            alert("Email is already registered.");
            return;
        }

        const newUser = {
            username: "user",
            email: email,
            password: password,
            countryCode: "+60",
            phone: "",
            gender: "Male",
            dob: "",
            // arrays for addresses & cards
            addresses: [],
            bankCards: [],
            cart: [],
            history: []
        };

        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));

        alert("Account created successfully!");
        form.reset();

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
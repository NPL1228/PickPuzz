document.addEventListener("DOMContentLoaded", () => {
    const questions = document.querySelectorAll(".faqQuestion");

    questions.forEach((btn) => {
        btn.addEventListener("click", () => {
            const answer = btn.nextElementSibling;

            // Toggle class for smooth transition
            answer.classList.toggle("show");
        });
    });
});

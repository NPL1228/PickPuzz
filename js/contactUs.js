document.querySelector('form').addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        message: document.getElementById('message').value
    };

    // Simple validation
    if (!formData.fullName || !formData.email || !formData.message) {
        alert('Please fill in all fields');
        return;
    }

    const submitBtn = document.querySelector('.submitBtn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    setTimeout(() => {
        alert('Thank you for your message! We\'ll get back to you soon.');
        this.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 2000);
});
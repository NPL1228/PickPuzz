(function () {
    var btn = document.getElementById('orderNow');
    if (btn) {
        btn.addEventListener('click', function () {
            var phone = '60123456789'; // replace with your WhatsApp number (country code + number)
            var text = encodeURIComponent('Hi, I would like to order a custom-made puzzle.');
            var waUrl = 'https://wa.me/' + phone + '?text=' + text;
            window.open(waUrl, '_blank');
        });
    }
    // Show da-share block if plugin is present
    try {
        if (window.da_share) {
            var daEl = document.getElementById('daShareBlock');
            if (daEl) daEl.style.display = 'block';
        }
    } catch (e) {}
})();
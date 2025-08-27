const forYouContainer = document.querySelector('.forYouContainer');
let productsData = []; // This will store our loaded products

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    await loadProductData();

    // Load "For You" first
    loadForYouProducts();

    // Check cookies consent
    const cookiesConsent = localStorage.getItem('cookiesConsent');
    console.log('Cookies consent status:', cookiesConsent);
    if (cookiesConsent) {
        cookies.style.display = 'none';
    }

    setTimeout(() => {
        if (!cookiesConsent) {
            cookies.style.display = 'none';
            localStorage.setItem('cookiesConsent', false);
        }
    }, 5 * 60 * 1000);

});

// Load product data from JSON file
async function loadProductData() {
    try {
        const response = await fetch('js/productInfo.json');
        console.log('Loading product data from js/productInfo.json');
        if (!response.ok) {
            throw new Error('Failed to load products data');
        }
        const data = await response.json();
        productsData = data.products;
    } catch (error) {
        console.error('Error loading product data:', error);
        showAlert('danger', 'Failed to load product information');
    }
}

// Load 4 random "For You" products (no filtering, just shuffle)
function loadForYouProducts() {
    if (!forYouContainer) {
        console.error('For You container not found');
        return;
    }
    forYouContainer.innerHTML = '';

    // Shuffle & pick 4
    const randomProducts = [...productsData]
        .sort(() => Math.random() - 0.5)
        .slice(0, 4);

    randomProducts.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'forYouItem';
        productElement.innerHTML = `
            <img id="forYouImg" src="${product.images[0]}" alt="${product.name}" width="200" height="200" loading="lazy">
            <p id="forYouProductName">${product.name}</p>
            <p id="forYouPrice">${formatPrice(product.price)}</p>
            <div id="forYouDetails">
                <div>
                    <img src="picture/productDetail/puzzle-piece.png" alt="puzzle" width="25" height="25">
                    <span>Pieces: </span>
                    <p>${product.details.pieces}</p>
                </div>
                <div>
                    <img src="picture/productDetail/material.png" alt="material" width="25" height="25">
                    <span>Materials: </span>
                    <p>${product.details.material}</p>
                </div>
                <div>
                    <img src="picture/productDetail/maximize.png" alt="maximize" width="25" height="25">
                    <span>Size: </span>
                    <p>${product.details.size}</p>
                </div>
            </div>
        `;

        productElement.addEventListener('click', () => {
            window.location.href = `productDetail.html?id=${product.id}`;
        });

        forYouContainer.appendChild(productElement);
    });
}

function formatPrice(price) {
    return `RM${price.toFixed(2)}`;
}

function showAlert(type, message) {
    // Implement your alert/notification system here
    console.log(`${type}: ${message}`);
}

const cookies = document.querySelector('.cookiesContainer');

// Cookies mechanism
document.getElementById('cookiesRejectBtn').addEventListener('click', function () {
    cookies.style.display = 'none';
    localStorage.setItem('cookiesConsent', false);
});

document.getElementById('cookiesAcceptBtn').addEventListener('click', function () {
    cookies.style.display = 'none';
    localStorage.setItem('cookiesConsent', true);
});

//social media plug in
(function () {
    var currentUrl = encodeURIComponent(window.location.href);
    var pageTitle = encodeURIComponent(document.title);

    var fb = document.getElementById('shareFacebook');
    if (fb) fb.href = 'https://www.facebook.com/sharer/sharer.php?u=' + currentUrl;

    var x = document.getElementById('shareX');
    if (x) x.href = 'https://twitter.com/intent/tweet?url=' + currentUrl + '&text=' + pageTitle;

    var wa = document.getElementById('shareWhatsApp');
    if (wa) wa.href = 'https://api.whatsapp.com/send?text=' + pageTitle + '%20' + currentUrl;

    var em = document.getElementById('shareEmail');
    if (em) em.href = 'mailto:?subject=' + pageTitle + '&body=' + pageTitle + '%20' + currentUrl;

    var btn = document.getElementById('nativeShareBtn');
    if (btn) {
        btn.addEventListener('click', function () {
            var shareData = { title: document.title, text: document.title, url: window.location.href };
            if (navigator.share) {
                navigator.share(shareData).catch(function () { });
            } else {
                window.open('https://www.facebook.com/sharer/sharer.php?u=' + currentUrl, '_blank', 'noopener');
            }
        });
    }

    var ig = document.getElementById('shareInstagram');
    if (ig) {
        ig.addEventListener('click', function (e) {
            e.preventDefault();
            var currentUrl = window.location.href;
    
            if (navigator.share) {
                navigator.share({
                    title: document.title,
                    text: "Check this out!",
                    url: currentUrl
                }).catch(console.error);
            } else if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(currentUrl).then(function () {
                    alert('Link copied. Open Instagram to paste and share.');
                }).catch(function () {
                    window.prompt('Copy this link to share on Instagram:', currentUrl);
                });
            } else {
                window.prompt('Copy this link to share on Instagram:', currentUrl);
            }
        });
    }

    var ms = document.getElementById('shareMessenger');
    if (ms) {
        ms.addEventListener('click', function (e) {
            e.preventDefault();
            var currentUrl = window.location.href;
            var messengerUrl = 'fb-messenger://share/?link=' + encodeURIComponent(currentUrl);
            var fbFallback = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(currentUrl);
    
            // Try Messenger scheme
            window.location.href = messengerUrl;
    
            // Fallback if Messenger not available (desktop browser etc.)
            setTimeout(function () {
                window.open(fbFallback, '_blank', 'noopener');
            }, 500); // slightly longer delay so mobile has time to catch
        });
    }

    // If da-share plugin is loaded, show plugin block and keep fallback visible as well
    try {
        if (window.da_share) {
            var daEl = document.getElementById('daShareBlock');
            if (daEl) daEl.style.display = 'block';
        }
    } catch (e) { }
})();
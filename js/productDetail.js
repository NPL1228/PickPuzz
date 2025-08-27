window.productsData = [];
// Load product data
const productImagesContainer = document.getElementById('productImages');
const productNameElement = document.getElementById('product-name');
const productPriceElement = document.getElementById('product-price');
const productDescElement = document.getElementById('product-desc');
const detailsContent = document.getElementById('details');
const includesContent = document.getElementById('includes');
const stockAvailability = document.getElementById('stockAvailability');
let currentStock = 0;
const relatedProductsContainer = document.getElementById('relatedProducts');

window.loadProduct = function(productId) {
    const product = productsData.find(p => p.id === productId);
    if (!product) {
        alert('Product not found');
        return;
    }
    console.log("Loaded product:", product.name);
    // Update main product info
    productNameElement.textContent = product.name;
    console.log("Product price:", product.name);
    productPriceElement.textContent = formatPrice(product.price);
    productDescElement.textContent = product.description;
    stockAvailability.textContent = `${product.stock} items available`;
    currentStock = product.stock;

    // Update images
    productImagesContainer.innerHTML = '';
    product.images.forEach(image => {
        const img = document.createElement('img');
        img.src = image;
        img.alt = product.name;
        img.loading = 'lazy'; // Add lazy loading
        productImagesContainer.appendChild(img);
    });

    // Update details
    detailsContent.innerHTML = `
        <div>
            <img src="picture/productDetail/puzzle-piece.png" alt="puzzle" width="25px" height="25px">
            <span>Pieces: </span>
            <p>${product.details.pieces}</p>
        </div>
        <div>
            <img src="picture/productDetail/material.png" alt="material" width="25px" height="25px">
            <span>Materials: </span>
            <p>${product.details.material}</p>
        </div>
        <div>
            <img src="picture/productDetail/maximize.png" alt="maximise" width="25px" height="25px">
            <span>Size: </span>
            <p>${product.details.size}</p>
        </div>
    `;

    // Update includes
    includesContent.innerHTML = `
        <p><strong>The package includes</strong></p>
        <ul>
            ${product.includes.map(item => `<li>${item}</li>`).join('')}
        </ul>
    `;

    // Load related products (excluding current product)
    loadRelatedProducts(productId, product.category);
}
// Load related products
function loadRelatedProducts(currentProductId) {
    relatedProductsContainer.innerHTML = '';

    // Filter related products (same category, excluding current product)
    const relatedProducts = productsData.filter(product =>
        product.id !== currentProductId);

    // If no related products in same category, show other products
    const productsToShow = relatedProducts.length > 0 ? relatedProducts :
        productsData.filter(product => product.id !== currentProductId);

    // Create product elements
    productsToShow.forEach(product => {
        const card = createProductCard(product);
        relatedProductsContainer.appendChild(card);
    });

    setupRelatedList();
}

function setupRelatedList() {
    const container = document.querySelector('.related-container-2');
    if (!container) return;

    const leftArrow = document.querySelector('.arrowLeft');
    const rightArrow = document.querySelector('.arrowRight');

    if (container.children.length === 0) return;

    let scrollPos = 0;
    let autoScroll = true;
    let scrollInterval;

    function updateArrows() {
        const maxScroll = container.scrollWidth - container.clientWidth;
        leftArrow.style.visibility = scrollPos <= 0 ? 'hidden' : 'visible';
        rightArrow.style.visibility = scrollPos >= maxScroll - 5 ? 'hidden' : 'visible';
    }

    function scrollTo(position) {
        scrollPos = position;
        container.scrollTo({ left: position, behavior: 'smooth' });
        updateArrows();
    }

    // Auto-scroll logic - RIGHT ONLY with loop
    function startAutoScroll() {
        clearInterval(scrollInterval);
        scrollInterval = setInterval(() => {
            if (!autoScroll) return;

            const maxScroll = container.scrollWidth - container.clientWidth;
            if (scrollPos >= maxScroll) {
                // When reaching end, instantly reset to start (without animation)
                scrollPos = 0;
                container.scrollTo({ left: 0, behavior: 'instant' });
                updateArrows();
            } else {
                // Normal rightward scroll
                scrollTo(scrollPos + 1);
            }
        }, 50);
    }

    // Manual navigation
    leftArrow?.addEventListener('click', () => {
        autoScroll = false;
        scrollTo(Math.max(0, scrollPos - 300));
        setTimeout(() => autoScroll = true, 3000);
    });

    rightArrow?.addEventListener('click', () => {
        autoScroll = false;
        const maxScroll = container.scrollWidth - container.clientWidth;
        scrollTo(Math.min(maxScroll, scrollPos + 300));
        setTimeout(() => autoScroll = true, 3000);
    });

    container.addEventListener('scroll', () => {
        scrollPos = container.scrollLeft;
        updateArrows();
    });

    // Initialize
    updateArrows();
    startAutoScroll();
}
// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    await loadProductData();
    const productId = getProductIdFromUrl();
     if (productId) {
        loadProduct(productId);
    }

    document.getElementById('cartIcon')?.addEventListener('click', () => {
        window.location.href = 'cart.html';
    });

    // Setup dynamic share links for product detail page
    (function setupShareLinks() {
        var currentUrl = encodeURIComponent(window.location.href);
        var pageTitle = encodeURIComponent(document.title);

        var container = document.querySelector('.share-socialMedia');
        if (!container) return;

        var anchors = container.querySelectorAll('a');
        anchors.forEach(function (a) {
            var img = a.querySelector('img');
            if (!img || !img.alt) return;
            var alt = img.alt.toLowerCase();

            if (alt.indexOf('facebook') !== -1) {
                a.href = 'https://www.facebook.com/sharer/sharer.php?u=' + currentUrl;
                a.target = '_blank';
                a.rel = 'noopener';
            } else if (alt.indexOf('twitter') !== -1 || alt === 'x') {
                a.href = 'https://twitter.com/intent/tweet?url=' + currentUrl + '&text=' + pageTitle;
                a.target = '_blank';
                a.rel = 'noopener';
            } else if (alt.indexOf('whatsapp') !== -1) {
                a.href = 'https://api.whatsapp.com/send?text=' + pageTitle + '%20' + currentUrl;
                a.target = '_blank';
                a.rel = 'noopener';
            } else if (alt.indexOf('instagram') !== -1) {
                a.addEventListener('click', function (e) {
                    e.preventDefault();
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(window.location.href).then(function () {
                            alert('Link copied. Open Instagram to paste and share.');
                        }).catch(function () {
                            window.prompt('Copy this link to share on Instagram:', window.location.href);
                        });
                    } else {
                        window.prompt('Copy this link to share on Instagram:', window.location.href);
                    }
                });
            } else if (alt.indexOf('messenger') !== -1) {
                a.addEventListener('click', function (e) {
                    e.preventDefault();
                    var messengerUrl = 'fb-messenger://share/?link=' + currentUrl;
                    var fbFallback = 'https://www.facebook.com/sharer/sharer.php?u=' + currentUrl;
                    var opened = window.open(messengerUrl);
                    setTimeout(function () {
                        if (!opened || opened.closed) {
                            window.open(fbFallback, '_blank', 'noopener');
                        }
                    }, 300);
                });
            }
        });
    })();
});

// Helper functions
function getProductIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || productsData[0]?.id || 'animal12';
}

function formatPrice(price) {
    return `RM${price.toFixed(2)}`;
}

function showAlert(type, message) {
    // Implement your alert/notification system here
    alert(`${type}: ${message}`);
}

// share and wishList
document.addEventListener("DOMContentLoaded", () => {
    const shareButton = document.querySelector(".share");

    shareButton.addEventListener("click", (e) => {
        e.stopPropagation(); // prevent click from bubbling
        shareButton.classList.toggle("active");
    });

    // Optional: Click anywhere else to close
    document.addEventListener("click", () => {
        shareButton.classList.remove("active");
    });
});


//product tab
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach((btn, index) => {
    btn.addEventListener('click', () => {
        // Remove active from all
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        // Add active to clicked button and matching content
        btn.classList.add('active');
        tabContents[index].classList.add('active');
    });
});

// Quantity control functionality
document.querySelector('.minus').addEventListener('click', function () {
    const input = document.querySelector('.quantity-input');
    let value = parseInt(input.value) || 1;
    if (value > 1) {
        input.value = value - 1;
    }
});

document.querySelector('.plus').addEventListener('click', function () {
    const input = document.querySelector('.quantity-input');
    let value = parseInt(input.value) || 1;
    if (value < currentStock) {
        input.value = value + 1;
    }
});

let users = JSON.parse(localStorage.getItem("users")) || [];
const loggedInEmail = getCookie("loggedInUser") || sessionStorage.getItem("loggedInUser");

// Find current logged-in user
let user = users.find(u => u.email === loggedInEmail);

document.querySelector('.add-to-cart').addEventListener('click', function () {

    if(!user) {
        alert("Please login before adding to cart!");
        return;
    }

    const input = document.querySelector('.quantity-input');
    let qty = parseInt(input.value) || 1;
    if (qty > currentStock) {
        qty = currentStock; // Limit to available stock
    }
    if (qty < 1) {
        qty = 1; // Minimum quantity is 1
    }
    input.value = qty;

    // Add to cart logic
    const productId = getProductIdFromUrl();
    const product = productsData.find(p => p.id === productId);
    if (!product) {
        showAlert('Danger', 'Product not found');
        return;
    }

    let cart = user.cart || [];
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
        existingItem.qty += qty;
        console.log("Existing item quantity:", existingItem.qty);
        
        if (existingItem.qty > currentStock) {
            existingItem.qty = currentStock; // Limit to stock
            showAlert('warning', `Only ${currentStock} items available. Quantity adjusted.`);
        } else {
            showAlert('Success', 'Quantity updated in cart');
        }
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            qty: qty,
            img: product.images[0] // Use first image as thumbnail
        });
        showAlert('Success', 'Added to cart');
    }
    localStorage.setItem('users', JSON.stringify(users));
    window.location.reload();
});

// Checkout button: add to cart then go to checkout
document.querySelector('.checkout').addEventListener('click', function () {
    if(!user) {
        alert("Please login before checkout!");
        window.location.href = 'login.html';
        return;
    }

    const input = document.querySelector('.quantity-input');
    let qty = parseInt(input.value) || 1;
    if (qty > currentStock) {
        qty = currentStock;
    }
    if (qty < 1) {
        qty = 1;
    }
    input.value = qty;

    const productId = getProductIdFromUrl();
    const product = productsData.find(p => p.id === productId);
    if (!product) {
        showAlert('Danger', 'Product not found');
        return;
    }

    let cart = user.cart || [];
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
        existingItem.qty += qty;
        if (existingItem.qty > currentStock) {
            existingItem.qty = currentStock;
            showAlert('warning', `Only ${currentStock} items available. Quantity adjusted.`);
        }
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            qty: qty,
            img: product.images[0]
        });
    }

    // Persist and navigate to checkout
    user.cart = cart;
    localStorage.setItem('users', JSON.stringify(users));
    alert("Proceed to checkout!");
    window.location.href = 'checkout.html';
});
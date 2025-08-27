// share function between allProduct.js, ProductDetail.js and search.js
window.productsData = [];
function formatPrice(price) {
    return `RM${price.toFixed(2)}`;
}

// Load product data from JSON file
async function loadProductData() {
    try {
        const response = await fetch('js/productInfo.json');
        if (!response.ok) throw new Error('Failed to load products data');

        const data = await response.json();
        productsData = data.products; // products array
        await renderProducts(); // render once data is loaded and DOM is painted
    } catch (error) {
        console.error('Error loading product data:', error);
        showAlert('danger', 'Failed to load product information');
    }
}

// Function to render products by category
function renderProducts(containerId = 'categoriesContainer', options = { mode: "list" }) {
    return new Promise(resolve => {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`renderProducts: container #${containerId} not found`);
            return resolve(); //  safe exit
        }

        container.innerHTML = '';

        // Group products by category
        const categories = {};
        productsData.forEach(product => {
            if (!categories[product.category]) {
                categories[product.category] = [];
            }
            categories[product.category].push(product);
        });

        // Render each category
        Object.entries(categories).forEach(([categoryName, products]) => {
            const header = document.createElement('h2');
            header.className = 'category-header';
            header.textContent = categoryName;
            header.id = `${categoryName.replace(/\s+/g, '')}Header`;

            const grid = document.createElement('div');
            grid.className = 'category-grid';

            console.log('Rendering category:', categoryName, 'with', products.length, 'products');

            products.forEach(product => {
                grid.appendChild(createProductCard(product, options));
            });

            container.appendChild(header);
            container.appendChild(grid);
        });

        // resolve after next frame (guarantee DOM update)
        requestAnimationFrame(() => resolve());
    });
}

function createProductCard(product, options = {}) {
    const { mode = "list" } = options; 
    // mode: "list" (allProducts) | "detail" (productDetail)

    const productElement = document.createElement('div');
    productElement.className = 'related-product';

    productElement.innerHTML = `
        <img id="related-img" src="${product.images[0]}" alt="${product.name}" width="200" height="200" loading="lazy">
        <p id="related-productName">${product.name}</p>
        <p id="related-price">${formatPrice(product.price)}</p>
        <div id="related-details">
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

    if (mode === "list") {
        // allProducts: click → navigate
        productElement.addEventListener('click', () => {
            window.location.href = `productDetail.html?id=${product.id}`;
        });
    } else if (mode === "detail") {
        // productDetail: click → update content without leaving page
        productElement.addEventListener('click', () => {
            window.scrollTo(0, 0);
            const productContainer = document.querySelector('.product-container-2');
            if (productContainer) productContainer.scrollTop = 0;

            window.history.pushState({}, '', `productDetail.html?id=${product.id}`);
            loadProduct(product.id);
        });
    }

    return productElement;
}

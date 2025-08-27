// Function to format price with currency symbol
function createProductCard(product) {
    const productElement = document.createElement('div');
    productElement.className = 'related-product'; // can rename to 'product-card'

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

    productElement.addEventListener('click', () => {
        window.location.href = `productDetail.html?id=${product.id}`;
    });
    return productElement;
}
// Function to render products by category
function renderProducts(containerId = 'categoriesContainer') {
    return new Promise(resolve => {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        // Group products
        const categories = {};
        productsData.forEach(product => {
            if (!categories[product.category]) {
                categories[product.category] = [];
            }
            categories[product.category].push(product);
        });

        // Render
        Object.entries(categories).forEach(([categoryName, products]) => {
            const header = document.createElement('h2');
            header.className = 'category-header';
            header.textContent = categoryName;
            header.id = `${categoryName.replace(/\s+/g, '')}Header`;

            const grid = document.createElement('div');
            grid.className = 'category-grid';

            console.log('Rendering category:', categoryName, 'with', products.length, 'products');

            products.forEach(product => {
                grid.appendChild(createProductCard(product));
            });

            container.appendChild(header);
            container.appendChild(grid);
        });

        // resolve after next frame (guarantee DOM update)
        requestAnimationFrame(() => resolve());
    });
}


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

// Load a single product (e.g. for details popup/page)
// function loadProduct(productId) {
//     const product = productsData.find(p => p.id === productId);
//     if (!product) {
//         showAlert('danger', 'Product not found');
//         return;
//     }
//     alert(`Load product: ${product.name}`);
// }


// Back to top button functionality
const backToTopButton = document.getElementById('backToTopBtn');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 0) {   // show as soon as user scrolls down
        backToTopButton.classList.add('visible');
    } else {
        backToTopButton.classList.remove('visible');
    }
});

backToTopButton.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});


// Initialize the page when loaded
document.addEventListener('DOMContentLoaded', async () => {
    await loadProductData(); // ensures products are loaded and rendered
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    console.log('Category from URL:', category);
    if (category) {
        const headerId = `${category.replace(/\s+/g, '')}Header`;
        const headerElem = document.getElementById(headerId);
        if (headerElem) {
            headerElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
});

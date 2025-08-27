document.querySelector(".backBtn").addEventListener("click", () => {
    window.location.href = "index.html";
});



// Load last order summary from sessionStorage and render
(function () {
    try {
        const raw = sessionStorage.getItem('lastOrder');
        if (!raw) return;
        const last = JSON.parse(raw);
        if (!last) return;

        const productPriceEl = document.getElementById('succProductPrice');
        const shippingFeeEl = document.getElementById('succShippingFee');
        const totalPriceEl = document.getElementById('succTotalPrice');
        const orderMetaEl = document.getElementById('orderMeta');

        if (productPriceEl) productPriceEl.textContent = 'RM ' + Number(last.productTotal || 0).toFixed(2);
        if (shippingFeeEl) shippingFeeEl.textContent = 'RM ' + Number(last.shipping || 0).toFixed(2);
        if (totalPriceEl) totalPriceEl.textContent = 'RM ' + Number(last.total || ((last.productTotal || 0) + (last.shipping || 0))).toFixed(2);

        const meta = [];
        if (last.id) meta.push('Order: ' + last.id);
        if (last.shippingMethod) meta.push('Shipping: ' + last.shippingMethod);
        if (last.paymentMethod) meta.push('Payment: ' + last.paymentMethod);
        if (orderMetaEl) orderMetaEl.textContent = meta.join(' | ');
    } catch (e) { }
})(); 
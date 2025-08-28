const navLinks = document.querySelectorAll('.nav-pills a');

// Add click event to each link
navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();

        // Remove active class from all links
        navLinks.forEach(l => l.classList.remove('active'));

        // Add active class to clicked link
        this.classList.add('active');

        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Show the target section
        const targetId = this.getAttribute('href');
        document.querySelector(targetId).classList.add('active');
    });
});

function getCookie(name) {
    const cname = name + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let c of ca) {
        c = c.trim();
        if (c.indexOf(cname) === 0) {
            return c.substring(cname.length, c.length);
        }
    }
    return "";
}



document.addEventListener('DOMContentLoaded', fetchData);

// Mobile sidebar functionality
function initializeMobileMenu() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    // Show/hide toggle button based on screen size
    function toggleSidebarButton() {
        if (window.innerWidth <= 768) {
            sidebarToggle.style.display = 'block';
        } else {
            sidebarToggle.style.display = 'none';
            sidebar.classList.remove('show');
            sidebarOverlay.classList.remove('show');
        }
    }
    
    // Initialize on load
    toggleSidebarButton();
    
    // Listen for window resize
    window.addEventListener('resize', toggleSidebarButton);
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('show');
            sidebarOverlay.classList.toggle('show');
        });
        
        // Close sidebar when clicking overlay
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', function() {
                sidebar.classList.remove('show');
                sidebarOverlay.classList.remove('show');
            });
        }
        
        // Close sidebar when clicking on a nav link (mobile)
        const navLinks = document.querySelectorAll('.nav-pills a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('show');
                    sidebarOverlay.classList.remove('show');
                }
            });
        });
    }
}

// Initialize all data from localStorage
function fetchData() {
    fetchProfile();
    fetchBanksCard();
    fetchAddresses();
    renderPurchases();

    // Activate section based on hash (e.g., #purchasesSection)
    activateSectionFromHash();
    
    // Initialize mobile menu
    initializeMobileMenu();
    
    // Initialize menu icon for categories and filters
    initializeMenuIcon();
}

function activateSectionFromHash() {
    const hash = window.location.hash || '#profileSection';
    const link = document.querySelector(`.nav-pills a[href="${hash}"]`);
    const target = document.querySelector(hash);
    if (!target) return;

    // Deactivate all
    document.querySelectorAll('.nav-pills a').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));

    // Activate matching
    if (link) link.classList.add('active');
    target.classList.add('active');
}

// Respond to hash changes
window.addEventListener('hashchange', activateSectionFromHash);

// Handle window resize for responsive behavior
window.addEventListener('resize', function() {
    const sidebar = document.querySelector('.sidebar');
    if (window.innerWidth > 768 && sidebar) {
        sidebar.classList.remove('show');
    }
});

let users = JSON.parse(localStorage.getItem("users")) || [];
const loggedInEmail = getCookie("loggedInUser") || sessionStorage.getItem("loggedInUser");

document.addEventListener('DOMContentLoaded', () => {
    if (!loggedInEmail) {
        alert("No user is currently logged in. Redirecting to login page.");
        window.location.href = "login.html"; // Redirect to login page
    }
});

// Find current logged-in user
let user = users.find(u => u.email === loggedInEmail);

// PROFILE FUNCTIONS
function fetchProfile() {
    // Ensure defaults if missing (only fill empty values, don’t overwrite)
    if (!user.username) user.username = 'user';
    if (!user.email) user.email = loggedInEmail || '';
    if (!user.countryCode) user.countryCode = '+60';
    if (!user.phone) user.phone = '';
    if (!user.gender) user.gender = 'Male';
    if (!user.dob) user.dob = '';

    // Save back updated users array
    localStorage.setItem("users", JSON.stringify(users));

    // Update the view with the current user's data
    updateProfileView(user);
}



function updateProfileView(profileData) {
    document.getElementById('username').textContent = profileData.username;
    document.getElementById('email').textContent = profileData.email;
    document.getElementById('countryCode').textContent = profileData.countryCode;
    document.getElementById('phone').textContent = profileData.phone;
    document.getElementById('dob').textContent = formatDateDMY(profileData.dob);
    document.getElementById('gender').textContent = profileData.gender;
}

function loadEditForm() {
    document.getElementById('editUsername').value = user.username;
    document.getElementById('editEmail').value = user.email;
    document.getElementById('editCountryCode').value = user.countryCode;
    document.getElementById('editPhone').value = user.phone;
    document.getElementById('editDob').value = user.dob;

    // Set gender radio button
    document.querySelectorAll('input[name="editGender"]').forEach(radio => {
        radio.checked = (radio.value === user.gender);
    });
}


function saveProfile() {
    const username = document.getElementById('editUsername').value;
    const email = document.getElementById('editEmail').value;
    const countryCode = document.getElementById('editCountryCode').value;
    const phone = document.getElementById('editPhone').value;
    const dob = document.getElementById('editDob').value;
    const selectedGender = document.querySelector('input[name="editGender"]:checked');
    const gender = selectedGender ? selectedGender.value : 'other';

    if (isNaN(phone)) {
        alert("Phone numbers must be number digit only!");
        return;
    }

    if (!username || !email || !phone || !dob) {
        alert('Please fill in all required fields');
        return;
    }

    user.username = username;
    user.email = email;
    user.countryCode = countryCode;
    user.phone = phone;
    user.gender = gender;
    user.dob = dob;

    // Save to localStorage
    localStorage.setItem('users', JSON.stringify(users));

    // Update the view with new values
    updateProfileView(user);

    alert('Profile updated successfully!');

    // Close the popup
    toggleForm('profile');
}


let bankCards = user.bankCards || [];

// BANK FUNCTIONS
function fetchBanksCard() {
    if (!bankCards) {
        bankCards = [];
        localStorage.setItem('users', JSON.stringify(users));
    }

    // Update the view with stored values
    updateBankCardsView(bankCards);
}

function updateBankCardsView(bankCards) {
    const container = document.getElementById('bankCardsContainer');
    container.innerHTML = '';

    bankCards.forEach((bankCard, index) => {
        const cardItem = document.createElement('li');
        cardItem.className = 'card-item';
        cardItem.addEventListener("click", () => showBankCardInfo(index));
        cardItem.innerHTML = `
                    <div class="card-details">
                        <h5>${bankCard.bankCardName}</h5>
                        <p><strong>Account:</strong> **** **** **** ${bankCard.accountNumber.slice(-4)}</p>
                        <p><strong>Expires:</strong> ${bankCard.expiryDate}</p>
                    </div>
                    <div class="info-btn">
                        <i class="fas fa-info"></i>
                    </div>
                `;
        container.appendChild(cardItem);
    });
}

// Render Purchases History
function renderPurchases() {
    const list = document.getElementById('purchasesList');
    if (!list) return;
    list.innerHTML = '';

    const purchases = (user && Array.isArray(user.purchases)) ? user.purchases : [];
    if (purchases.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'text-muted';
        empty.textContent = 'No purchases yet.';
        list.appendChild(empty);
        return;
    }

    purchases
        .slice() // copy
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .forEach(order => {
            const orderItem = document.createElement('li');
            orderItem.className = 'card-item purchase-item';

            const createdAt = order.createdAt ? new Date(order.createdAt) : new Date();
            const timeText = createdAt.toLocaleString();

            // Take first item for thumbnail/summary
            const first = (order.items && order.items[0]) ? order.items[0] : null;
            const name = first ? first.name : 'Order';
            const img = first ? first.img : '';
            const qtyTotal = Array.isArray(order.items) ? order.items.reduce((sum, it) => sum + (it.qty || 0), 0) : 0;
            const total = typeof order.total === 'number' ? order.total : ((order.productTotal || 0) + (order.shipping || 0));

            orderItem.innerHTML = `
                <div class="card-details d-flex align-items-center w-100">
                    <img class="purchase-thumb" src="${img}" alt="product" width="70" height="70">
                    <div class="ms-3 flex-grow-1 text-start">
                        <h5 class="mb-1">${name}</h5>
                        <div class="text-muted small">${timeText}</div>
                    </div>
                    <div class="text-end me-3"><strong>Qty:</strong> ${qtyTotal}</div>
                    <div class="text-end"><strong>Total:</strong> RM ${total.toFixed(2)}</div>
                </div>
            `;

            // Click to open full order details popup
            orderItem.style.cursor = 'pointer';
            orderItem.addEventListener('click', () => {
                showPurchaseInfo(order);
            });

            list.appendChild(orderItem);
        });
}

function loadBankCardForm(index = -1) {

    // account number input formatter
    const accountNumberInput = document.getElementById("accountNumber");
    if (accountNumberInput && !accountNumberInput.hasListener) {
        accountNumberInput.addEventListener("input", function () {
            let digits = this.value.replace(/\D/g, ""); // only numbers

            if (digits.length > 16) digits = digits.substring(0, 16); // max 16
            this.value = digits.replace(/(.{4})/g, "$1 ").trim(); // format xxxx xxxx xxxx xxxx

        });
        accountNumberInput.hasListener = true; // prevent double-binding
    }

    // expiry date input formatter (MM/YY)
    const expiryInputField = document.getElementById("expiryDate");
    if (expiryInputField && !expiryInputField.hasListener) {
        expiryInputField.addEventListener("input", function () {
            formatDateMY(this);
        });
        expiryInputField.hasListener = true; // prevent double-binding
    }

    if (index >= 0 && index < bankCards.length) {
        // Editing existing bankCard
        document.getElementById('bankCardFormTitle').textContent = 'Edit Bank Card Account';
        document.getElementById('editBankCardIndex').value = index;

        const bankCard = bankCards[index];
        document.getElementById('bankCardName').value = bankCard.bankCardName;
        document.getElementById('accountNumber').value = bankCard.accountNumber;
        document.getElementById('expiryDate').value = bankCard.expiryDate;
        document.getElementById('cvv').value = bankCard.cvv;
    } else {
        // Adding new bankCard
        document.getElementById('bankCardFormTitle').textContent = 'Add New Bank Card';
        document.getElementById('editBankCardIndex').value = -1;

        // Reset form
        document.getElementById('bankCardName').value = '';
        document.getElementById('accountNumber').value = '';
        document.getElementById('expiryDate').value = '';
        document.getElementById('cvv').value = '';
    }
}

function saveBankCard() {
    const index = parseInt(document.getElementById('editBankCardIndex').value);
    const bankCardName = document.getElementById('bankCardName').value;
    const accountNumber = document.getElementById('accountNumber').value;
    const expireInput = document.getElementById('expiryDate');
    const cvv = document.getElementById('cvv').value; // regex pattern \D: any char not a digit g:global search

    if (isNaN(cvv)) {
        alert("CVV must be number digit only!");
        return;
    }

    if (!formatDateMY(expireInput)) {
        window.alert('Month must be between 01 and 12');
        return;
    }
    const expiryDate = expireInput.value;

    if (!bankCardName || !accountNumber || !expiryDate || !cvv) {
        alert('Please fill in all fields');
        return;
    }

    const bankCardData = {
        bankCardName,
        accountNumber,
        expiryDate,
        cvv
    };

    if (index >= 0 && index < bankCards.length) {
        // Update existing bankCard
        user.bankCards[index] = bankCardData;
    } else {
        // Add new bankCard
        user.bankCards.push(bankCardData);
    }

    // Save to localStorage
    localStorage.setItem('users', JSON.stringify(users));

    // Update the view
    updateBankCardsView(bankCards);

    alert('Bank Card account saved successfully!');

    // Close the popup
    toggleForm('bankCard');
}

function showBankCardInfo(index) {
    const bankCard = bankCards[index];

    if (!bankCard) return;

    const popupDetails = document.getElementById('popupDetails');
    popupDetails.innerHTML = `
                <div class="detail-item d-flex justify-content-between align-items-center mb-3">
                    <span class="col-5 detail-label">Bank Card Name:</span>
                    <span class="col-7 detail-value">${bankCard.bankCardName}</span>
                </div>
                <div class="detail-item d-flex justify-content-between align-items-center mb-3"">
                    <span class="col-5 detail-label">Account Number:</span>
                    <span class="col-7 detail-value">**** **** **** ${bankCard.accountNumber.slice(-4)}</span>
                </div>
                <div class="detail-item d-flex justify-content-between align-items-center mb-3"">
                    <span class="col-5 detail-label">Expiry Date:</span>
                    <span class="col-7 detail-value">${bankCard.expiryDate}</span>
                </div>
                <div class="detail-item d-flex justify-content-between align-items-center mb-3"">
                    <span class="col-5 detail-label">CVV:</span>
                    <span class="col-7 detail-value">***</span>
                </div>
            `;

    document.getElementById('detailsTitle').textContent = 'Bank Card Details';
    // Remove purchase title style if previously applied
    const titleEl1 = document.getElementById('detailsTitle');
    if (titleEl1) titleEl1.classList.remove('purchase-title');

    // Show action buttons for editable entity
    const editBtn = document.getElementById('popupEditBtn');
    const removeBtn = document.getElementById('popupRemoveBtn');
    if (editBtn) editBtn.style.display = '';
    if (removeBtn) removeBtn.style.display = '';

    // Set up the edit and remove buttons
    document.getElementById('popupEditBtn').onclick = function () {
        closeDetailsPopup();
        toggleForm('bankCard');
        loadBankCardForm(index);
    };

    document.getElementById('popupRemoveBtn').onclick = function () {
        removeBankCard(index);
    };

    // Show the popup
    document.getElementById('popupDetailsOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function removeBankCard(index) {
    if (confirm('Are you sure you want to remove this bank card account?')) {
        if (index >= 0 && index < bankCards.length) {
            bankCards.splice(index, 1);
            localStorage.setItem('users', JSON.stringify(users));
            updateBankCardsView(bankCards);
            alert('Bank Card account removed successfully!');
        }
        closeDetailsPopup();
    }
}

let addresses = user.addresses || [];
// ADDRESS FUNCTIONS
function fetchAddresses() {
    if (!addresses) {
        addresses = [];
        localStorage.setItem('users', JSON.stringify(users));
    }

    // Update the view with stored values
    updateAddressesView(addresses);
}

function updateAddressesView(addresses) {
    const container = document.getElementById('addressCardsContainer');
    container.innerHTML = '';

    addresses.forEach((address, index) => {
        const cardItem = document.createElement('li');
        cardItem.className = 'card-item';
        cardItem.addEventListener("click", () => showAddressInfo(index));
        cardItem.innerHTML = `
                    <div class="card-details">
                        <h5>${address.title}</h5>
                        <p>${address.addressLine1}, ${address.city}</p>
                        <p><strong>Phone:<strong> ${address.phone}</p>
                    </div>
                    <div class="info-btn">
                        <i class="fas fa-info"></i>
                    </div>
                `;
        container.appendChild(cardItem);
    });
}

function loadAddressForm(index = -1) {

    if (index >= 0 && index < addresses.length) {
        // Editing existing address
        document.getElementById('addressFormTitle').textContent = 'Edit Address';
        document.getElementById('editAddressIndex').value = index;

        const address = addresses[index];
        document.getElementById('addressTitle').value = address.title;
        document.getElementById('address1').value = address.addressLine1;
        document.getElementById('address2').value = address.addressLine2 || '';
        document.getElementById('postalCode').value = address.postalCode;
        document.getElementById('city').value = address.city;
        document.getElementById('state').value = address.state;
        document.getElementById('addressPhone').value = address.phone;
    } else {
        // Adding new address
        document.getElementById('addressFormTitle').textContent = 'Add New Address';
        document.getElementById('editAddressIndex').value = -1;

        // Reset form
        document.getElementById('addressTitle').value = '';
        document.getElementById('address1').value = '';
        document.getElementById('address2').value = '';
        document.getElementById('postalCode').value = '';
        document.getElementById('city').value = '';
        document.getElementById('state').value = '';
        document.getElementById('addressPhone').value = '';
    }
}

function saveAddress() {
    const index = parseInt(document.getElementById('editAddressIndex').value);
    const title = document.getElementById('addressTitle').value;
    const address1 = document.getElementById('address1').value;
    const address2 = document.getElementById('address2').value;
    const postalCode = document.getElementById('postalCode').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const phone = document.getElementById('addressPhone').value;

    if (isNaN(phone)) {
        alert("Phone numbers must be number digit only!");
        return;
    }

    if (!title || !address1 || !postalCode || !city || !state || !phone) {
        alert('Please fill in all required address fields');
        return;
    }

    const addressData = {
        title,
        addressLine1: address1,
        addressLine2: address2,
        postalCode,
        city,
        state,
        phone
    };

    if (index >= 0 && index < addresses.length) {
        // Update existing address
        user.addresses[index] = addressData;
    } else {
        // Add new address
        user.addresses.push(addressData);
    }

    // Save to localStorage
    localStorage.setItem('users', JSON.stringify(users));

    // Update the view
    updateAddressesView(addresses);

    alert('Address saved successfully!');

    // Close the popup
    toggleForm('address');
}

function showAddressInfo(index) {
    const address = addresses[index];

    if (!address) return;

    const popupDetails = document.getElementById('popupDetails');
    popupDetails.innerHTML = `
                <div class="detail-item d-flex justify-content-between align-items-center mb-3">
                    <span class="col-5 detail-label">Title:</span>
                    <span class="col-7 detail-value">${address.title}</span>
                </div>
                <div class="detail-item d-flex justify-content-between align-items-center mb-3">
                    <span class="col-5 detail-label">Address Line 1:</span>
                    <span class="col-7 detail-value">${address.addressLine1}</span>
                </div>
                <div class="detail-item d-flex justify-content-between align-items-center mb-3">
                    <span class="col-5 detail-label">Address Line 2:</span>
                    <span class="col-7 detail-value">${address.addressLine2 || 'N/A'}</span>
                </div>
                <div class="detail-item d-flex justify-content-between align-items-center mb-3">
                    <span class="col-5 detail-label">City:</span>
                    <span class="col-7 detail-value">${address.city}</span>
                </div>
                <div class="detail-item d-flex justify-content-between align-items-center mb-3">
                    <span class="col-5 detail-label">State:</span>
                    <span class="col-7 detail-value">${address.state}</span>
                </div>
                <div class="detail-item d-flex justify-content-between align-items-center mb-3">
                    <span class="col-5 detail-label">Postal Code:</span>
                    <span class="col-7 detail-value">${address.postalCode}</span>
                </div>
                <div class="detail-item d-flex justify-content-between align-items-center mb-3">
                    <span class="col-5 detail-label">Phone:</span>
                    <span class="col-7 detail-value">${address.phone}</span>
                </div>
            `;

    document.getElementById('detailsTitle').textContent = 'Address Details';
    // Remove purchase title style if previously applied
    const titleEl2 = document.getElementById('detailsTitle');
    if (titleEl2) titleEl2.classList.remove('purchase-title');

    // Show action buttons for editable entity
    const editBtn = document.getElementById('popupEditBtn');
    const removeBtn = document.getElementById('popupRemoveBtn');
    if (editBtn) editBtn.style.display = '';
    if (removeBtn) removeBtn.style.display = '';

    // Set up the edit and remove buttons
    document.getElementById('popupEditBtn').onclick = function () {
        closeDetailsPopup();
        toggleForm('address');
        loadAddressForm(index);
    };

    document.getElementById('popupRemoveBtn').onclick = function () {
        removeAddress(index);
    };

    // Show the popup
    document.getElementById('popupDetailsOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Show full order details including all purchased items
function showPurchaseInfo(order) {
    if (!order) return;

    const popupDetails = document.getElementById('popupDetails');
    const createdAt = order.createdAt ? new Date(order.createdAt) : new Date();
    const headerHtml = `
        <div class="mb-3">
            <div><strong>Order ID:</strong> ${order.id || ''}</div>
            <div class="text-muted small">${createdAt.toLocaleString()}</div>
            <div class="mt-1"><strong>Shipping:</strong> ${order.shippingMethod || ''}</div>
            <div><strong>Payment:</strong> ${order.paymentMethod || ''}</div>
        </div>
    `;

    const items = Array.isArray(order.items) ? order.items : [];
    const itemsHtml = items.map(it => {
        const lineTotal = (Number(it.price) || 0) * (Number(it.qty) || 0);
        return `
            <div class="d-flex align-items-center justify-content-between mb-2">
                <div class="d-flex align-items-center">
                    <img src="${it.img || ''}" alt="product" width="50" height="50" style="object-fit:cover;border-radius:6px;">
                    <div class="ms-2">
                        <div class="fw-semibold">${it.name || ''}</div>
                        <div class="text-muted small">RM ${(Number(it.price) || 0).toFixed(2)} × ${it.qty || 0}</div>
                    </div>
                </div>
                <div class="fw-semibold">RM ${lineTotal.toFixed(2)}</div>
            </div>
        `;
    }).join('');

    const subtotal = Number(order.productTotal) || items.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.qty) || 0), 0);
    const shipping = Number(order.shipping) || 0;
    const total = Number(order.total) || (subtotal + shipping);

    const summaryHtml = `
        <div class="purchase-summary mt-2 p-3 rounded-3">
            <div class="d-flex justify-content-between mb-1"><span>Product Price:</span><span class="fw-bold">RM ${subtotal.toFixed(2)}</span></div>
            <div class="d-flex justify-content-between mb-2"><span>Shipping Fee:</span><span class="fw-bold">RM ${shipping.toFixed(2)}</span></div>
            <div class="d-flex justify-content-between"><span class="fs-6">Total:</span><span class="fs-6 fw-bold text-danger">RM ${total.toFixed(2)}</span></div>
        </div>
    `;

    // Wrap header + items as one colored block
    const bodyHtml = `<div class="purchase-body p-3 rounded-3 mb-2">${headerHtml}${itemsHtml}</div>`;
    const separatorHtml = `<hr class="purchase-separator">`;

    popupDetails.innerHTML = bodyHtml + separatorHtml + summaryHtml;
    const titleEl = document.getElementById('detailsTitle');
    if (titleEl) {
        titleEl.textContent = 'Purchase Details';
        titleEl.classList.add('purchase-title');
    }

    // Hide edit/remove for purchases (not editable)
    const editBtn = document.getElementById('popupEditBtn');
    const removeBtn = document.getElementById('popupRemoveBtn');
    if (editBtn) editBtn.style.display = 'none';
    if (removeBtn) removeBtn.style.display = 'none';

    document.getElementById('popupDetailsOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function removeAddress(index) {
    if (confirm('Are you sure you want to remove this address?')) {
        if (index >= 0 && index < addresses.length) {
            addresses.splice(index, 1);
            localStorage.setItem('users', JSON.stringify(users));
            updateAddressesView(addresses);
            alert('Address removed successfully!');
        }
        closeDetailsPopup();
    }
}

// PASSWORD CHANGE FUNCTIONS
const oldPasswordInput = document.getElementById("oldPassword");
const newPasswordInput = document.getElementById("newPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");
const form = document.getElementById("passwordForm");

// Old password check

// Form submit validation
form.addEventListener("submit", function (event) {
    event.preventDefault(); // Stop form from submitting immediately

    if (oldPasswordInput.value !== user.password) {
        alert("Old password is incorrect!");
        return;
    }
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (newPassword.length < 8) {
        alert("Password must be at least 8 characters long.");
        return;
    }

    if (newPassword === "" || confirmPassword === "") {
        alert("Please fill in all password fields.");
        return;
    }

    if (confirm("Are you sure you want to change your password?")) {
        if (newPassword !== confirmPassword) {
            alert("New Password and Confirm Password do not match!");
            return;
        } else {
            user.password = newPassword;
            localStorage.setItem("users", JSON.stringify(users));
            alert("Password updated successfully!");
            form.submit(); // <-- only submit if valid
        }
    }
});



// UTILITY FUNCTIONS
function updateCountryLabel() {
    const select = document.getElementById('editCountryCode');
    const label = document.getElementById('countryLabel');
    switch (select.value) {
        case '+60':
            label.textContent = 'Malaysia';
            break;
        case '+65':
            label.textContent = 'Singapore';
            break;
        case '+86':
            label.textContent = 'China';
            break;
        case 'other':
            label.textContent = 'Other';
            break;
        default:
            label.textContent = '';
    }
}

function formatDateDMY(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Format and validate MM/YY for card expiry date
function formatDateMY(input) {
    let value = input.value.replace(/[^0-9]/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 3) {
        value = value.slice(0, 2) + '/' + value.slice(2);
    }
    input.value = value;

    // Validate MM
    if (value.length >= 2) {
        const mm = parseInt(value.slice(0, 2), 10);
        if (mm < 1 || mm > 12) {
            return false;
        }
    }
    return true;
}

function closeDetailsPopup() {
    document.getElementById('popupDetailsOverlay').classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Toggle form visibility
function toggleForm(type) {
    const popupProfile = document.getElementById('popupFormProfile');
    const popupBankCard = document.getElementById('popupFormBankCard');
    const popupAddress = document.getElementById('popupFormAddress');

    if (type === 'profile') {
        popupProfile.classList.toggle('active');
        // Close address and bankCard popup if open
        if (popupAddress.classList.contains('active')) {
            popupAddress.classList.remove('active');
        }
        if (popupBankCard.classList.contains('active')) {
            popupBankCard.classList.remove('active');
        }

        if (popupProfile.classList.contains('active')) {
            loadEditForm();
        }
    } else if (type === 'bankCard') {
        popupBankCard.classList.toggle('active');
        // Close profile and address popup if open
        if (popupAddress.classList.contains('active')) {
            popupAddress.classList.remove('active');
        }
        if (popupProfile.classList.contains('active')) {
            popupProfile.classList.remove('active');
        }

        if (popupBankCard.classList.contains('active')) {
            loadBankCardForm();
        }
    } else if (type === 'address') {
        popupAddress.classList.toggle('active');
        // Close profile and bank popup if open
        if (popupBankCard.classList.contains('active')) {
            popupBankCard.classList.remove('active');
        }
        if (popupProfile.classList.contains('active')) {
            popupProfile.classList.remove('active');
        }

        if (popupAddress.classList.contains('active')) {
            loadAddressForm();
        }
    }

    // Prevent body from scrolling when any popup is open
    if (popupProfile.classList.contains('active') || popupBankCard.classList.contains('active') || popupAddress.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
}

// Close popup if clicked outside of content
document.getElementById('popupFormProfile').addEventListener('click', function (e) {
    if (e.target === this) {
        toggleForm('profile');
    }
});

document.getElementById('popupFormBankCard').addEventListener('click', function (e) {
    if (e.target === this) {
        toggleForm('bankCard');
    }
});

document.getElementById('popupFormAddress').addEventListener('click', function (e) {
    if (e.target === this) {
        toggleForm('address');
    }
});

document.getElementById('popupDetailsOverlay').addEventListener('click', function (e) {
    if (e.target === this) {
        closeDetailsPopup();
    }
});

// Menu icon functionality for categories and filters
function initializeMenuIcon() {
    const menuBtn = document.getElementById("menuIcon");
    const filterContainer = document.querySelector(".filterCatContainer");
    const overlay = document.querySelector(".overlay");
    
    if (menuBtn && filterContainer) {
        menuBtn.addEventListener("click", () => {
            filterContainer.classList.toggle("show");
            if (overlay) {
                overlay.classList.toggle("show");
            }
        });
        
        // Close filter container when clicking overlay
        if (overlay) {
            overlay.addEventListener("click", () => {
                filterContainer.classList.remove("show");
                overlay.classList.remove("show");
            });
        }
        
        // Close filter container when clicking outside
        document.addEventListener("click", (e) => {
            if (!filterContainer.contains(e.target) && !menuBtn.contains(e.target)) {
                filterContainer.classList.remove("show");
                if (overlay) {
                    overlay.classList.remove("show");
                }
            }
        });
    }
}



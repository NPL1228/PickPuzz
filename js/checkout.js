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

// Load saved address on page load
document.addEventListener("DOMContentLoaded", function () {

  renderCheckout();
  console.log("grandTotal1: ", grandTotal);

  updatePrices(grandTotal, 5);

  // Ensure input formatters for checkout form
  attachCheckoutInputFormatters();

  // Render saved items
  renderSavedAddresses();
  renderSavedCards();
});
let users = JSON.parse(localStorage.getItem("users")) || [];
const loggedInEmail = getCookie("loggedInUser") || sessionStorage.getItem("loggedInUser");

if (!loggedInEmail) {
  alert("No user is currently logged in. Redirecting to login page.");
  window.location.href = "login.html"; // Redirect to login page
}


// Find current logged-in user
let user = users.find(u => u.email === loggedInEmail);

// Ensure defaults
if (user) {
  if (!Array.isArray(user.cart)) user.cart = [];
  if (!Array.isArray(user.addresses)) user.addresses = [];
  if (!Array.isArray(user.bankCards)) user.bankCards = [];
  // persist any normalization
  localStorage.setItem('users', JSON.stringify(users));
}

let products = user ? user.cart || [] : [];

const checkoutTable = document.getElementById("checkoutTable");
const checkoutBody = document.getElementById("checkoutBody");
let grandTotal;
function renderCheckout() {
  checkoutBody.innerHTML = "";
  grandTotal = 0;

  products.forEach((p) => {
    let totalPrice = p.price * p.qty;
    grandTotal += totalPrice;
    console.log("totalPrice: ", totalPrice);
    console.log("grandTotal: ", grandTotal);
    let row = document.createElement("tr");
    row.setAttribute("data-id", p.id);
    console.log("row1: ", row.getAttribute("data-id"));
    row.innerHTML = `
            <td>
              <img src="${p.img}" alt="product" width="100" height="100">
              <p>${p.name}</p>
            </td>
            <td>RM ${p.price}</td>
            <td>
              <span class="mx-2">${p.qty}</span>
            </td>
            <td>RM ${(totalPrice).toFixed(2)}</td>
          `;
    checkoutBody.appendChild(row);
  });
}


const savedAddress = document.querySelector(".savedAddress");
// Render saved addresses as a list on checkout page
function renderSavedAddresses() {
  if (!savedAddress) return;
  savedAddress.innerHTML = "";

  if (user && Array.isArray(user.addresses) && user.addresses.length > 0) {
    let list = document.createElement("ul");
    list.className = "list-group";
    user.addresses.forEach((address, idx) => {
      let title = "";
      let line1 = "";
      if (typeof address === "object" && address !== null) {
        title = address.title || "";
        line1 = address.addressLine1 || address.line1 || address.address1 || address.addressLine1 || "";
      } else if (typeof address === "string") {
        line1 = address;
      }
      const displayText = title && line1 ? `${title}: ${line1}` : (title || line1 || 'Untitled');
      let li = document.createElement("li");
      li.className = "list-group-item d-flex align-items-center";
      li.innerHTML = `
        <input type="radio" name="savedAddressRadio" id="savedAddress${idx}" value="${encodeURIComponent(line1)}" class="form-check-input me-2">
        <label for="savedAddress${idx}" class="mb-0 flex-grow-1">${displayText}</label>
      `;
      list.appendChild(li);
    });
    savedAddress.innerHTML = "<label class='form-label mb-2'>Select a saved address:</label>";
    savedAddress.appendChild(list);
  } else {
    savedAddress.innerHTML = "<div class='text-muted'>No saved addresses found.</div>";
  }
}

// Saved cards container on checkout page
const savedCardContainer = document.querySelector('.savedCard');
function renderSavedCards() {
  if (!savedCardContainer) return;
  savedCardContainer.innerHTML = "";

  if (user && Array.isArray(user.bankCards) && user.bankCards.length > 0) {
    let list = document.createElement('ul');
    list.className = 'list-group';

    user.bankCards.forEach((card, idx) => {
      const last4 = (card.accountNumber || '').toString().slice(-4);
      let li = document.createElement('li');
      li.className = 'list-group-item d-flex align-items-center';
      li.innerHTML = `
        <input type="radio" name="savedCardRadio" id="savedCard${idx}" value="${idx}" class="form-check-input me-2">
        <label for="savedCard${idx}" class="mb-0 flex-grow-1">${card.bankCardName || 'Card'} •••• ${last4}</label>
      `;
      list.appendChild(li);
    });

    savedCardContainer.innerHTML = "<label class='form-label mb-2'>Select a saved card:</label>";
    savedCardContainer.appendChild(list);
  } else {
    savedCardContainer.innerHTML = "<div class='text-muted'>No saved cards found.</div>";
  }
}

// Save Address from checkout form
function saveAddress() {
  const index = parseInt(document.getElementById('editAddressIndex').value);
  const title = document.getElementById('addressTitle').value;
  const address1 = document.getElementById('address1').value;
  const address2 = document.getElementById('address2').value;
  const postalCode = document.getElementById('postalCode').value;
  const city = document.getElementById('city').value;
  const state = document.getElementById('state').value;
  const phone = document.getElementById('addressPhone').value;

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

  if (index >= 0 && user.addresses && index < user.addresses.length) {
    user.addresses[index] = addressData;
  } else {
    user.addresses.push(addressData);
  }

  // Save to localStorage
  localStorage.setItem('users', JSON.stringify(users));

  // Update the saved list on checkout
  renderSavedAddresses();

  alert('Address saved successfully!');

  // Reset form fields
  document.getElementById('addressTitle').value = '';
  document.getElementById('address1').value = '';
  document.getElementById('address2').value = '';
  document.getElementById('postalCode').value = '';
  document.getElementById('city').value = '';
  document.getElementById('state').value = '';
  document.getElementById('addressPhone').value = '';
}

// Save Bank Card from checkout form
function saveBankCard() {
  const index = parseInt(document.getElementById('editBankCardIndex').value);
  const bankCardName = document.getElementById('bankCardName').value;
  const accountNumberInput = document.getElementById('accountNumber');
  const expireInput = document.getElementById('expiryDate');
  const cvvInput = document.getElementById('cvv');

  const rawAccountNumber = accountNumberInput.value.replace(/\s+/g, '');
  const cvv = cvvInput.value;

  if (isNaN(cvv)) {
    alert("CVV must be number digit only!");
    return;
  }

  if (!formatDateMY(expireInput)) {
    window.alert('Month must be between 01 and 12');
    return;
  }
  const expiryDate = expireInput.value;

  if (!bankCardName || !rawAccountNumber || !expiryDate || !cvv) {
    alert('Please fill in all fields');
    return;
  }

  const bankCardData = {
    bankCardName,
    accountNumber: accountNumberInput.value, // keep formatted value with spaces
    expiryDate,
    cvv
  };

  if (index >= 0 && user.bankCards && index < user.bankCards.length) {
    user.bankCards[index] = bankCardData;
  } else {
    user.bankCards.push(bankCardData);
  }

  // Save to localStorage
  localStorage.setItem('users', JSON.stringify(users));

  // Update the saved list on checkout
  renderSavedCards();

  alert('Bank Card account saved successfully!');

  // Reset form
  document.getElementById('bankCardName').value = '';
  document.getElementById('accountNumber').value = '';
  document.getElementById('expiryDate').value = '';
  document.getElementById('cvv').value = '';
}

function attachCheckoutInputFormatters() {
  // Account number xxxx xxxx xxxx xxxx
  const accountNumberInput = document.getElementById('accountNumber');
  if (accountNumberInput && !accountNumberInput.hasListener) {
    accountNumberInput.addEventListener('input', function () {
      let digits = this.value.replace(/\D/g, '');
      if (digits.length > 16) digits = digits.substring(0, 16);
      this.value = digits.replace(/(.{4})/g, '$1 ').trim();
    });
    accountNumberInput.hasListener = true;
  }

  // CVV numeric max 3
  const cvvInput = document.getElementById('cvv');
  if (cvvInput && !cvvInput.hasListener) {
    cvvInput.addEventListener('input', function () {
      this.value = this.value.replace(/\D/g, '');
      if (this.value.length > 3) {
        this.value = this.value.slice(0, 3);
      }
    });
    cvvInput.hasListener = true;
  }
}

function updatePrices(productTotal, shipping) {
  console.log("productTotal inside updatePrices:", productTotal);

  document.getElementById("productPrice").textContent = "RM " + (productTotal).toFixed(2);
  document.getElementById("shippingFee").textContent = "RM " + (shipping).toFixed(2);
  document.getElementById("totalPrice").textContent = "RM " + (productTotal + shipping).toFixed(2);
}

// Handle Confirm Order button
document.querySelectorAll(".btn-confirm").forEach(btn => {
  btn.addEventListener("click", function () {
    let shipping = (document.querySelector("input[name=shipping]:checked") || {}).value;
    let payment = (document.querySelector("input[name=payment]:checked") || {}).value;
    // Fallback: treat card selection as a payment choice
    if (!payment) {
      const cardMain = document.getElementById('cardRadio');
      const cardSaved = document.getElementById('cardRadio2');
      if ((cardMain && cardMain.checked) || (cardSaved && cardSaved.checked)) {
        payment = 'Credit / Debit Card';
      }
    }
    let selectedBank = document.getElementById("bankSelect") ? document.getElementById("bankSelect").value : "";

    if (payment === 'Online Banking') {
      if (selectedBank === "") {
        alert("Pleases select a bank to proceed with Online Banking.");
        return;
      } else {
        // Redirect user to the chosen bank's login page
        window.location.href = selectedBank;
        return;
      }
    }


    //Situation: User doesn't select shipping/ payment method
    if (!shipping || !payment) {
      alert("Please select a shipping and payment method before confirming your order.");
    } else {
      // Save order summary for success page and clear cart
      const selectedSavedAddress = document.querySelector('input[name="savedAddressRadio"]:checked');
      const selectedSavedCard = document.querySelector('input[name="savedCardRadio"]:checked');
      // Build order object and persist to history
      const order = {
        id: 'ORD-' + Date.now(),
        createdAt: new Date().toISOString(),
        items: Array.isArray(products) ? products.map(p => ({ id: p.id, name: p.name, img: p.img, price: p.price, qty: p.qty })) : [],
        productTotal: grandTotal || 0,
        shipping: 5,
        total: (grandTotal || 0) + 5,
        shippingMethod: shipping,
        paymentMethod: payment,
        savedAddress: selectedSavedAddress ? decodeURIComponent(selectedSavedAddress.value) : '',
        savedCardIndex: selectedSavedCard ? selectedSavedCard.value : ''
      };

      try {
        sessionStorage.setItem('lastOrder', JSON.stringify(order));
      } catch (e) { }

      // Persist to user's purchase history
      if (user) {
        if (!Array.isArray(user.purchases)) user.purchases = [];
        user.purchases.push(order);
      }

      // Clear cart for current user
      if (user && Array.isArray(user.cart)) {
        user.cart = [];
      }
      localStorage.setItem('users', JSON.stringify(users));

      // Redirect to success page
      window.location.href = 'purchaseSuccess.html';
    }
  });
});

//E-wallet transfer
document.addEventListener("DOMContentLoaded", function () {
  const ewalletRadio = document.querySelector('input[value="E-wallet Transfer"]');
  const ewalletOptions = document.getElementById("ewalletOptions");

  // Listen for selection
  document.querySelectorAll('input[name="payment"]').forEach(radio => {
    radio.addEventListener("change", function () {
      if (ewalletRadio && ewalletRadio.checked && ewalletOptions) {
        ewalletOptions.style.display = "block";
      } else if (ewalletOptions) {
        ewalletOptions.style.display = "none";
        ewalletOptions.value = ""; // reset selection
      }
    });
  });
});

// Bootstrap form validation
(() => {
  'use strict';

  const form = document.querySelector('#shippingForm');

  form.addEventListener('submit', function (event) {
    if (!form.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      event.preventDefault();
      saveAddress();
    }
    form.classList.add('was-validated');
  }, false);
})();

document.querySelector(".backBtn").addEventListener("click", () => {
  if (window.history.length > 1) {
    window.history.back(); // go back to the previous page
  } else {
    window.location.href = "index.html"; // fallback if no history
  }
});

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

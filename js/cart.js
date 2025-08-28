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

document.addEventListener("DOMContentLoaded", function () {
  // Ensure direct checkout flag is cleared when coming from cart
  try { sessionStorage.removeItem('directCheckoutItem'); } catch (e) { }

  let users = JSON.parse(localStorage.getItem("users")) || [];
  const loggedInEmail = getCookie("loggedInUser") || sessionStorage.getItem("loggedInUser");

  if (!loggedInEmail) {
    alert("No user is currently logged in. Redirecting to login page.");
    window.location.href = "login.html"; // Redirect to login page
  }

  // Find current logged-in user
  let user = users.find(u => u.email === loggedInEmail);

  let products = user ? user.cart || [] : [];

  // Initialize partial cart for selected items
  let partialCart = [];

  const cartBody = document.getElementById("cartBody");
  const emptyCartBox = document.querySelector(".emptyCartBox");
  const grandTotalEl = document.getElementById("grandTotal");
  const selectAll = document.getElementById("selectAll");
  const cartTable = document.getElementById("cartTable");
  const cartFooter = document.getElementById("cartFooter");

  // Function to update partial cart based on checked items
  function updatePartialCart() {
    partialCart = [];
    document.querySelectorAll(".item-check:checked").forEach((cb) => {
      const id = cb.closest("tr").getAttribute("data-id");
      const item = products.find((p) => p.id === id);
      if (item) {
        partialCart.push(item);
      }
    });
    updateTotalDisplay();
  }

  // Function to update total display (shows partial cart total if items selected, otherwise 0)
  function updateTotalDisplay() {
    let total = 0;
    if (partialCart.length > 0) {
      // Show partial cart total
      partialCart.forEach((p) => {
        total += p.price * p.qty;
      });
      grandTotalEl.textContent = total.toFixed(2);
    } else {
      // Show 0 when no items are selected
      grandTotalEl.textContent = "0.00";
    }
  }

  // Render Cart
  function renderCart() {
    cartBody.innerHTML = "";
    if (products.length === 0) {
      emptyCartBox.style.display = "flex";
      cartTable.style.display = "none";
      cartFooter.classList.add("hide"); // to show
      grandTotalEl.textContent = "0";
      return;
    }

    emptyCartBox.style.display = "none";
    cartTable.style.display = "table";
    cartFooter.classList.remove("hide"); // to hide

    products.forEach((p) => {
      let totalPrice = p.price * p.qty;
      console.log("totalPrice: ", totalPrice);
      let row = document.createElement("tr");
      row.setAttribute("data-id", p.id);
      console.log("row1: ", row.getAttribute("data-id"));
      row.innerHTML = `
            <td><input type="checkbox" class="item-check" checked></td>
            <td>
              <div class="product">
                <img src="${p.img}" alt="product" width="100" height="100">
                <p>${p.name}</p>
              </div>
            </td>
            <td>RM ${p.price}</td>
            <td>
              <button class="btn btn-sm btn-outline-secondary minus">-</button>
              <span class="mx-2">${p.qty}</span>
              <button class="btn btn-sm btn-outline-secondary plus">+</button>
            </td>
            <td>RM ${(totalPrice).toFixed(2)}</td>
            <td><button class="btn btn-danger btn-sm deleteBtn">Delete</button></td>
          `;
      cartBody.appendChild(row);
    });

    // Set select all checkbox to checked by default
    if (selectAll) {
      selectAll.checked = true;
    }

    // Initialize partial cart and update total display
    updatePartialCart();

    document.querySelectorAll(".item-check").forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const allChecked = [...document.querySelectorAll(".item-check")].every(cb => cb.checked);
        selectAll.checked = allChecked;
        updatePartialCart();
      });
    });
  }

  // Initial render
  renderCart();

  // Load product stock data from productInfo.json
  let productStockMap = {};
  fetch('js/productInfo.json')
    .then(res => res.json())
    .then(data => {
      if (data && data.products) {
        data.products.forEach(prod => {
          productStockMap[prod.id] = prod.stock;
        });
      }
    });

  // Event delegation
  cartBody.addEventListener("click", function (e) {
    let target = e.target;
    let row = target.closest("tr");
    console.log("row: ", row.getAttribute("data-id"));
    if (!row) return;
    let id = row.getAttribute("data-id");
    console.log("id: ", id);
    let item = products.find((p) => p.id === id);

    if (target.classList.contains("plus")) {
      // Check stock before increasing
      let maxStock = productStockMap[id] !== undefined ? productStockMap[id] : Infinity;
      if (item.qty + 1 > maxStock) {
        alert("Cannot add more. Stock limit reached!");
        return;
      }
      item.qty++;
      user.cart = products;
      localStorage.setItem("users", JSON.stringify(users));
      renderCart();
    }

    if (target.classList.contains("minus")) {
      if (item.qty > 1) {
        item.qty--;
        user.cart = products;
        localStorage.setItem("users", JSON.stringify(users));
        renderCart();
      } else if (item.qty === 1) {
        // Ask user if they want to delete
        if (confirm("Quantity will be 0. Do you want to remove this product from your cart?")) {
          products = products.filter((p) => p.id !== id);
          user.cart = products;
          localStorage.setItem("users", JSON.stringify(users));
          renderCart();
          window.location.reload();
        }
      }
    }

    if (target.classList.contains("deleteBtn")) {
      if (confirm("Quantity will be 0. Do you want to remove this product from your cart?")) {
        products = products.filter((p) => p.id !== id);
        user.cart = products;
        localStorage.setItem("users", JSON.stringify(users));
        renderCart();
        window.location.reload();
      }
    }
  });

  // Select all
  selectAll.addEventListener("change", function () {
    document.querySelectorAll(".item-check").forEach((cb) => {
      cb.checked = selectAll.checked;
    });
    updatePartialCart();
  });

  // Delete selected
  document.getElementById("deleteSelected").addEventListener("click", function () {
    let idsToDelete = [];
    document.querySelectorAll(".item-check:checked").forEach((cb) => {
      let id = cb.closest("tr").getAttribute("data-id");
      idsToDelete.push(id);
    });
    if (confirm("Quantity will be 0. Do you want to remove this product from your cart?")) {
      products = products.filter((p) => !idsToDelete.includes(p.id));
      user.cart = products;
      localStorage.setItem("users", JSON.stringify(users));
      renderCart();
      window.location.reload();
    }
  });

  // Checkout
  document.getElementById("checkoutBtn").addEventListener("click", function () {
    // Explicitly clear any direct-checkout item so checkout uses partial cart
    try { sessionStorage.removeItem('directCheckoutItem'); } catch (e) { }

    if (products.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    // Check if any items are selected for partial checkout
    if (partialCart.length > 0) {
      // Store partial cart in session storage for checkout
      sessionStorage.setItem('partialCart', JSON.stringify(partialCart));
      alert("Proceeding to checkout with " + partialCart.length + " selected items. Total: RM " + grandTotalEl.textContent);
      window.location.href = "checkout.html";
    } else {
      // No items selected, show error message
      alert("Please select at least one item to proceed with checkout.");
    }
  });

});

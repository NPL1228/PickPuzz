const profileIcon = document.getElementById("profile");
const profileDropdown = document.getElementById("profileDropdown");
const signDropdown = document.getElementById("signDropdown");

function getCookie(name) {
  const nameEQ = name + "=";
  const ca = decodeURIComponent(document.cookie).split(";");
  for (let c of ca) {
    c = c.trim();
    if (c.startsWith(nameEQ)) {
      return c.substring(nameEQ.length);
    }
  }
  return null;
}

const auth = getCookie("loggedInUser") || sessionStorage.getItem("loggedInUser");

if (auth) {
  profileDropdown.style.display = "none";
  signDropdown.style.display = "none";
} else {
  signDropdown.style.display = "none";
  profileDropdown.style.display = "none";
}

profileIcon.addEventListener("click", () => {
  if (auth) {
    profileDropdown.classList.toggle("show");
  } else {
    signDropdown.classList.toggle("show");
  }
});
//prodile
document.addEventListener("click", (e) => {
  if (!profileIcon.contains(e.target) &&
    !profileDropdown.contains(e.target) &&
    !signDropdown.contains(e.target)) {
    [profileDropdown, signDropdown].forEach(dd => {
      if (dd.classList.contains("show")) {
        dd.classList.remove("show");
        setTimeout(() => {
          dd.style.display = "none";
        }, 300);
      }
    });
  }
});
//profile dropdown
function attachObserver(dropdown) {
  const observer = new MutationObserver(() => {
    if (dropdown.classList.contains("show")) {
      dropdown.style.display = "flex";
    }
  });
  observer.observe(dropdown, { attributes: true, attributeFilter: ["class"] });
}

attachObserver(profileDropdown);
attachObserver(signDropdown);




/* menu toggle */
const menuBtn = document.getElementById("menuIcon");
const filterContainer = document.querySelector(".filterCatContainer");
const overlay = document.querySelector(".overlay");

const rangevalue = document.querySelector(".slider .priceSlider");
const rangeInputvalue = document.querySelectorAll(".rangeInput input");
const priceInputvalue = document.querySelectorAll(".priceInput input");

let priceGap = 50;

// Keep track of current filter state
let currentFilters = {
  min: 0,
  max: 1000,
  materials: [],
  pieces: []
};

// Function to update current filters from checkboxes
function updateCurrentFilters() {
  // Materials checkboxes
  currentFilters.materials = Array.from(
    document.querySelectorAll("[data-filter='material'] input:checked")
  ).map(cb => cb.id);

  // Pieces checkboxes
  currentFilters.pieces = Array.from(
    document.querySelectorAll("[data-filter='pieces'] input:checked")
  ).map(cb => cb.id);
}

// Add event listeners for material checkboxes
function attachMaterialCheckboxListeners() {
  const materialCheckboxes = document.querySelectorAll("[data-filter='material'] input[type='checkbox']");
  materialCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updateCurrentFilters);
  });
}

// Add event listeners for pieces checkboxes
function attachPiecesCheckboxListeners() {
  const piecesCheckboxes = document.querySelectorAll("[data-filter='pieces'] input[type='checkbox']");
  piecesCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updateCurrentFilters);
  });
}

// --- MENU OPEN/CLOSE ---
menuBtn.addEventListener("click", () => {
  filterContainer.classList.toggle("show");
  overlay.classList.toggle("show");
});

// --- OVERLAY CLICK: close + apply ---
overlay.addEventListener("click", () => {
  filterContainer.classList.remove("show");
  overlay.classList.remove("show");
});

// --- REDIRECT HELPER ---
function redirectWithPrice(min, max) {
  let params = new URLSearchParams();

  // Preserve existing search query if present
  const currentSearchQuery = new URLSearchParams(window.location.search).get("q");
  if (currentSearchQuery) {
    params.set("q", currentSearchQuery);
    console.log("Preserving search query:", currentSearchQuery);
  }

  params.set("min", min);
  params.set("max", max);

  if (currentFilters.materials.length > 0) {
    params.set("material", currentFilters.materials.join(","));
  }

  if (currentFilters.pieces.length > 0) {
    params.set("pieces", currentFilters.pieces.join(","));
  }

  console.log("Redirecting with params:", params.toString());

  // redirect
  window.location.href = "search.html?" + params.toString();
}

// --- PRICE INPUT BOXES ---
for (let i = 0; i < priceInputvalue.length; i++) {
  priceInputvalue[i].addEventListener("input", e => {
    let minp = parseInt(priceInputvalue[0].value) || 0;
    let maxp = parseInt(priceInputvalue[1].value) || 1000;

    if (minp < 0) minp = 0;
    if (maxp > 1000) maxp = 1000;
    if (minp > maxp - priceGap) minp = maxp - priceGap;

    currentFilters.min = minp;
    currentFilters.max = maxp;

    // update slider visuals only
    rangeInputvalue[0].value = minp;
    rangeInputvalue[1].value = maxp;
    rangevalue.style.left = `${(minp / rangeInputvalue[0].max) * 100}%`;
    rangevalue.style.right = `${100 - (maxp / rangeInputvalue[1].max) * 100}%`;
  });
}

// --- SLIDER RANGES ---
for (let i = 0; i < rangeInputvalue.length; i++) {
  rangeInputvalue[i].addEventListener("input", e => {
    let minVal = parseInt(rangeInputvalue[0].value);
    let maxVal = parseInt(rangeInputvalue[1].value);

    if (maxVal - minVal < priceGap) return;

    currentFilters.min = minVal;
    currentFilters.max = maxVal;

    priceInputvalue[0].value = minVal;
    priceInputvalue[1].value = maxVal;
    rangevalue.style.left = `${(minVal / rangeInputvalue[0].max) * 100}%`;
    rangevalue.style.right = `${100 - (maxVal / rangeInputvalue[1].max) * 100}%`;
  });
}

// Filter initialization moved to DOMContentLoaded event

// --- APPLY BUTTON ---
const applyFiltersBtn = document.getElementById("applyFiltersBtn");
if (applyFiltersBtn) {
  applyFiltersBtn.addEventListener("click", () => {
    redirectWithPrice(currentFilters.min, currentFilters.max);
  });
}

// --- RESET FILTERS BUTTON ---
const resetFiltersBtn = document.getElementById("resetFiltersBtn");
if (resetFiltersBtn) {
  resetFiltersBtn.addEventListener("click", () => {
    resetAllFilters();
  });
}

// Function to reset all filters to default values
function resetAllFilters() {
  // Reset current filters
  currentFilters.min = 0;
  currentFilters.max = 1000;
  currentFilters.materials = [];
  currentFilters.pieces = [];

  // Reset price inputs
  const minInput = document.querySelector(".minInput");
  const maxInput = document.querySelector(".maxInput");
  if (minInput) minInput.value = 0;
  if (maxInput) maxInput.value = 1000;

  // Reset range sliders
  const minRange = document.querySelector(".minRange");
  const maxRange = document.querySelector(".maxRange");
  if (minRange) minRange.value = 0;
  if (maxRange) maxRange.value = 1000;

  // Reset price slider visual
  const rangevalue = document.querySelector(".slider .priceSlider");
  if (rangevalue) {
    rangevalue.style.left = "0%";
    rangevalue.style.right = "0%";
  }

  // Uncheck all material checkboxes
  const materialCheckboxes = document.querySelectorAll("[data-filter='material'] input[type='checkbox']");
  materialCheckboxes.forEach(checkbox => {
    checkbox.checked = false;
  });

  // Uncheck all pieces checkboxes
  const piecesCheckboxes = document.querySelectorAll("[data-filter='pieces'] input[type='checkbox']");
  piecesCheckboxes.forEach(checkbox => {
    checkbox.checked = false;
  });

  console.log("All filters have been reset to default values");
}

const magIcon = document.getElementById("magGlassIcon");
magIcon.addEventListener("click", () => {
  const search = document.getElementById("search");
  const query = search.value.trim();
  
  if (query) {
    window.location.href = "search.html?q=" + encodeURIComponent(query);
  } else {
    search.focus();
  }
});

//searchbar 
$("#search").on("keydown", function (e) {
  const isEnter = e.key === "Enter" || e.which === 13;
  if (!isEnter) return;
  // Avoid handling Enter on the search results page itself
  if (window.location.pathname.toLowerCase().endsWith("/search.html") || window.location.pathname.toLowerCase().endsWith("search.html")) {
    return;
  }
  e.preventDefault();
  const query = $(this).val().trim();
  if (query) {
    window.location.href = "search.html?q=" + encodeURIComponent(query);
  }
});

// Handle search input changes to show/hide clear button
$("#search").on("input", function () {
  const query = $(this).val().trim();
  const clearBtn = document.getElementById("clearSearchBtn");

  if (clearBtn) {
    if (query) {
      clearBtn.style.display = "flex";
    } else {
      clearBtn.style.display = "none";
    }
  }
});

// Clear search button functionality
const clearSearchBtn = document.getElementById("clearSearchBtn");
if (clearSearchBtn) {
  clearSearchBtn.addEventListener("click", () => {
    clearSearch();
  });
}

// Function to clear search and redirect to search page without query
function clearSearch() {
  // Get current URL parameters
  const urlParams = new URLSearchParams(window.location.search);

  // Remove search query but keep other parameters (filters)
  urlParams.delete("q");

  // Redirect to search page with remaining parameters
  const newUrl = urlParams.toString() ? `search.html?${urlParams.toString()}` : "search.html";
  window.location.href = newUrl;
}

// Function to update search bar with current query
function updateSearchBar() {
  const searchInput = document.getElementById("search");
  const clearBtn = document.getElementById("clearSearchBtn");

  if (!searchInput || !clearBtn) return;

  // Get current search query from URL
  const urlParams = new URLSearchParams(window.location.search);
  const currentQuery = urlParams.get("q");

  if (currentQuery) {
    // Show current search query in search bar
    searchInput.value = currentQuery;

    // Show clear button
    clearBtn.style.display = "flex";
  } else {
    // Clear search bar and hide clear button
    searchInput.value = "";
    clearBtn.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Update search bar with current query
  updateSearchBar();

  // Initialize filters and attach listeners
  updateCurrentFilters();
  attachMaterialCheckboxListeners();
  attachPiecesCheckboxListeners();

  // Get users and logged-in user
  let users = JSON.parse(localStorage.getItem("users")) || [];
  const loggedInEmail = getCookie("loggedInUser") || sessionStorage.getItem("loggedInUser");
  let user = users.find(u => u.email === loggedInEmail);

  // Calculate total quantity
  let totalTypes = 0;
  if (user && Array.isArray(user.cart)) {
    totalTypes = user.cart.length;
  }

  // Show in header (create badge if not exists)
  let cartIcon = document.getElementById("cartIcon");
  if (cartIcon) {
    let badge = document.getElementById("cartQtyBadge");
    if (!badge) {
      badge = document.createElement("span");
      badge.id = "cartQtyBadge";
      badge.className = "cart-qty-badge";
      cartIcon.parentElement.style.position = "relative";
      cartIcon.parentElement.appendChild(badge);
    }
    badge.textContent = totalTypes;
    badge.style.display = totalTypes > 0 ? "inline-block" : "none";
  }

  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      document.cookie = "loggedInUser=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      alert("Logged out successfully!");
      window.location.href = "login.html";
    });
  }

  // Ensure Google Translate element exists and script loaded (idempotent)
  ensureGoogleTranslateElement();
  loadGoogleTranslateScript();
});

// ---- Google Translate integration ----
function ensureGoogleTranslateElement() {
  const footer = document.querySelector('footer');
  if (!footer) return;

  if (!document.getElementById('google_translate_element')) {
    const el = document.createElement('div');
    el.id = 'google_translate_element';
    footer.appendChild(el);
  }
}

function loadGoogleTranslateScript() {
  console.log("Loading Google Translate script");
  // If already initialized by inline script or previous call, skip
  // if (window.google && window.google.translate && document.getElementById('google_translate_element')) {
  //   console.log("Google Translate already initialized");
  //   return;
  // }
  if (document.getElementById('google_translate_script')) return;

  // Provide global init callback
  window.googleTranslateElementInit = function () {
    try {
      new google.translate.TranslateElement
        ({
          pageLanguage: 'en', autoDisplay:
            false, includedLanguages: 'en,fr,es,zh-CN,ja,ms,ur,hi', gaTrack: true, gaId: 'key here'
        }, 'google_translate_element');
    } catch (_) { }
  };

  const s = document.createElement('script');
  s.id = 'google_translate_script';
  s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  document.body.appendChild(s);
}

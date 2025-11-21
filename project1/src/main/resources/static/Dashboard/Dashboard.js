const URL = "http://localhost:8080";


// ============================== LOAD TOTAL INVENTORY QUANTITY ==============================

/**
 * Fetches all inventory items, calculates total quantity and value,
 * formats results, and updates the dashboard display fields.
 * @async
 * @returns {Promise<void>}
 */
async function loadTotalInventoryQuantityAndValue() {
    try {
      const response = await fetch(`/inventory`, {credentials: "include"});
      const inventoryItems = await response.json();
      let totalQuantity = 0;
      let totalValue = 0;
      inventoryItems.forEach(item => {
        totalQuantity += item.quantity || 0;
        totalValue += (item.quantity || 0) * (item.product.price || 0);
      });
      const formattedValue = totalValue.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

      document.getElementById("totalInventoryQuantity").innerHTML = `
      <span class="card-value">
      <h3>Overall supply inventory</h3>
      ${totalQuantity}</span>`;

      document.getElementById("totalInventoryValue").innerHTML = `
      <span class="card-value">
      <h3>Total Inventory Value</h3>
      $${formattedValue}</span>`;
    
    } catch (err) {
      console.error("Error loading total inventory quantity:", err);
    }
}



// ============================== LOW STOCK COUNT ==============================

/**
 * Loads the number of inventory items that are below their minimum stock level
 * and updates the low stock counter on the dashboard.
 * @async
 * @returns {Promise<void>}
 */
async function loadLowStockCount() {
  try {
    const response = await fetch("/inventory/below-minimum", {credentials: "include"});
    const items = await response.json();
    const count = items.length;
    document.getElementById("lowStockValue").innerHTML = `${count} <small>items</small>`;
  } catch (err) {
    console.error("Error fetching low-stock count:", err);
    document.getElementById("lowStockValue").innerHTML = `<span style="color:red;">Error</span>`;
  }
}



// ============================== LOGIN CHECK ==============================

let currentUserEmail = null;

/**
 * Checks the current logged-in user.  
 * If no valid user session exists, redirects to the Login page.
 * If valid, populates the user dropdown label.
 * @async
 * @returns {Promise<void>}
 */
async function checkLogin() {
  try {
    const response = await fetch("/users/current-user", {credentials: "include"});
    if (!response.ok) return (window.location.href = "/Login");
    const user = await response.json();
    currentUserEmail = user.email;
    const userLabel = document.getElementById("userDropdown").firstChild;
    userLabel.textContent = `${user.email} ▾`;
  } catch {
    window.location.href = "/Login";
  }
}



// ============================== LOGOUT ==============================

/**
 * Logs out the current user by calling the logout endpoint,
 * then redirects to the Login page.
 * @async
 * @returns {Promise<void>}
 */
async function logout() {
  await fetch("/users/logout", { method: "POST", credentials: "include" });
  window.location.href = "/Login";
}



// ============================== INITIAL LOAD ==============================

// Initial startup calls
checkLogin();
loadRestockOrders();
loadLowStockCount();
loadTotalInventoryQuantityAndValue();
loadWarehouses();



// ============================== DASHBOARD DROPDOWN (top right) ==============================

const dropdown = document.getElementById("userDropdown");
const menu = document.getElementById("dropdownMenu");

/**
 * Toggles the user dropdown menu when clicked.
 */
dropdown.addEventListener("click", () => menu.classList.toggle("show"));

/**
 * Closes the dropdown menu when users click outside of it.
 */
window.addEventListener("click", (e) => {
  if (!dropdown.contains(e.target)) menu.classList.remove("show");
});



// ============================== TAB SWITCHING ==============================

const tabs = document.querySelectorAll(".tab");
const restockSection = document.getElementById("restockSection");
const warehouseSection = document.getElementById("warehouseSection");
const checkoutSection = document.getElementById("checkoutSection");
const productsSection = document.getElementById("productsSection");

/**
 * Handles dashboard tab switching, updating visible sections
 * and triggering appropriate loader functions.
 */
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    if (tab.textContent.includes("Warehouses")) {
      restockSection.style.display = "none";
      warehouseSection.style.display = "block";
      checkoutSection.style.display = "none";
      productsSection.style.display = "none";
      suppliersSection.style.display = "none";
      loadWarehouses();
    } else if(tab.textContent.includes("Restock Orders")) {
      warehouseSection.style.display = "none";
      restockSection.style.display = "block";
      checkoutSection.style.display = "none";
      productsSection.style.display = "none";
      suppliersSection.style.display = "none";
      loadRestockOrders();
    }
    else if(tab.textContent.includes("Checkouts")) {
      warehouseSection.style.display = "none";
      restockSection.style.display = "none";
      checkoutSection.style.display = "block";
      productsSection.style.display = "none";
      suppliersSection.style.display = "none";
      loadCheckouts();
    }
    else if(tab.textContent.includes("Products")) {
      warehouseSection.style.display = "none";
      restockSection.style.display = "none";
      checkoutSection.style.display = "none";
      productsSection.style.display = "block";
      suppliersSection.style.display = "none";
      loadProducts();
    }
    else if(tab.textContent.includes("Suppliers")) {
      warehouseSection.style.display = "none";
      restockSection.style.display = "none";
      checkoutSection.style.display = "none";
      productsSection.style.display = "none";
      suppliersSection.style.display = "block";
      loadSuppliers();
    }
  });
});



// ============================== TOAST ==============================

/**
 * Displays a temporary toast notification on the screen.
 * @param {string} message - Text to display.
 * @param {number} [duration=2500] - Time before toast hides.
 */
function showToast(message, duration = 2500) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.style.display = "block";
  setTimeout(() => (toast.style.display = "none"), duration);
}



// ============================== VALIDATE DATA  ==============================

/**
 * Checks whether a warehouse has enough capacity to store additional items.
 * @param {number|string} warehouseId
 * @param {number|string} additionalAmount
 * @returns {Promise<boolean>} True if capacity allows, false if exceeded.
 */
function checkWarehouseCapacity(warehouseId, additionalAmount) {
  return Promise.all([
    fetch(`/inventory/warehouse/${warehouseId}`, {credentials: "include"}).then(res => res.json()),
    fetch(`/warehouses/${warehouseId}`, {credentials: "include"}).then(res => res.json())
  ])
  .then(([inventoryItems, warehouse]) => {
    const currentTotal = inventoryItems.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    );

    const cap = Number(warehouse.capacity) || 0;
    const projected = currentTotal + Number(additionalAmount);

    return projected <= cap;
  })
  .catch(err => {
    console.error("Error checking warehouse capacity:", err);
    return false;
  });
}

/**
 * Checks whether a warehouse has enough stock for a specific product.
 * @param {number|string} warehouseId
 * @param {number|string} productId
 * @param {number|string} requiredAmount
 * @returns {Promise<boolean>} True if enough stock is available.
 */
function checkIfInStock(warehouseId, productId, requiredAmount) {
  return fetch(`/inventory/warehouse/${warehouseId}`, {credentials: "include"})
    .then(res => res.json())
    .then(inventoryItems => {
      const item = inventoryItems.find(i => i.product.productId == productId);
      const available = item ? item.quantity : 0;
      return available >= requiredAmount;
    })
    .catch(err => {
      console.error("Error checking stock:", err);
      return false;
    });
}

/**
 * Validates email format and length rules.
 * @param {string} email
 * @returns {boolean} True if valid email.
 */
function validateEmail(email) {
  if (!email || email.length > 254 || email.includes(" ")) return false;
  const parts = email.split("@");
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (!local || !domain || local.length > 64 || domain.length > 255) return false;
  if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) return false;
  const labels = domain.split(".");
  if (labels.length < 2 || domain.endsWith(".")) return false;
  if (labels.some(label => label.length === 0 || label.length > 63)) return false;

  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.toLowerCase());
}

/**
 * Validates a phone number by removing formatting and ensuring
 * the resulting digit count is between 10 and 15.
 * @param {string} phone
 * @returns {boolean}
 */
function validatePhone(phone) {
  if (!phone) return false;
  if (/[a-zA-Z]/.test(phone)) return false;
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

/**
 * Formats a 10-digit phone number as "###-###-####".
 * Leaves non-10-digit values unchanged.
 * @param {string} phone
 * @returns {string}
 */
function formatPhone(phone) {
  if (!phone) return "";

  const digits = phone.replace(/\D/g, "");

  if (digits.length === 10) {
    return `${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6)}`;
  }

  return phone;
}

const URL = "http://localhost:8080";




// ============================== LOAD TOTAL INVENTORY QUANTITY ==============================
async function loadTotalInventoryQuantityAndValue() {
    try {
      const response = await fetch(`/inventory`);
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
async function loadLowStockCount() {
  try {
    const response = await fetch("/inventory/below-minimum");
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
async function checkLogin() {
  try {
    const response = await fetch("/users/current-user");
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
async function logout() {
  await fetch("/users/logout", { method: "POST" });
  window.location.href = "/Login";
}

// ============================== INITIAL LOAD ==============================
checkLogin();
loadRestockOrders();
loadLowStockCount();
loadTotalInventoryQuantityAndValue();
loadWarehouses();

// ============================== DASHBOARD DROPDOWN (top right) ==============================
const dropdown = document.getElementById("userDropdown");
const menu = document.getElementById("dropdownMenu");
dropdown.addEventListener("click", () => menu.classList.toggle("show"));
window.addEventListener("click", (e) => {
  if (!dropdown.contains(e.target)) menu.classList.remove("show");
});

// ============================== TAB SWITCHING ==============================
const tabs = document.querySelectorAll(".tab");
const restockSection = document.getElementById("restockSection");
const warehouseSection = document.getElementById("warehouseSection");
const checkoutSection = document.getElementById("checkoutSection");
const productsSection = document.getElementById("productsSection");

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
function showToast(message, duration = 2500) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.style.display = "block";
  setTimeout(() => (toast.style.display = "none"), duration);
}


// ============================== VALIDATE DATA  ==============================
function checkWarehouseCapacity(warehouseId, additionalAmount) {
  return Promise.all([
    fetch(`/inventory/warehouse/${warehouseId}`).then(res => res.json()),
    fetch(`/warehouses/${warehouseId}`).then(res => res.json())
  ])
  .then(([inventoryItems, warehouse]) => {
    const currentTotal = inventoryItems.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    );

    const cap = Number(warehouse.capacity) || 0;
    const projected = currentTotal + Number(additionalAmount);

    return projected <= cap; // true = fits, false = over capacity
  })
  .catch(err => {
    console.error("Error checking warehouse capacity:", err);
    return false;
  });
}

function checkIfInStock(warehouseId, productId, requiredAmount) {
  return fetch(`/inventory/warehouse/${warehouseId}`)
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

function validatePhone(phone) {
  if (!phone) return false;
  // Reject alphabet characters
  if (/[a-zA-Z]/.test(phone)) return false;
  // Remove formatting
  const digits = phone.replace(/\D/g, "");
  // Only allow 10–15 digits total
  return digits.length >= 10 && digits.length <= 15;
}


function formatPhone(phone) {
  if (!phone) return "";

  // remove non-digits
  const digits = phone.replace(/\D/g, "");

  // only format if exactly 10 digits
  if (digits.length === 10) {
    return `${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6)}`;
  }

  return phone; // leave it unchanged otherwise
}


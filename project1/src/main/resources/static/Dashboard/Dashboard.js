const URL = "http://localhost:8080";

// ============================== LOAD RESTOCK ORDERS ==============================
async function loadRestockOrders() {
  try {
    const response = await fetch("/restocks");
    const restocks = await response.json();
    const body = document.getElementById("restockTableBody");
    body.innerHTML = "";

    if (!restocks.length) {
      body.innerHTML = `<tr><td colspan="5" style="text-align:center;">No restock orders found.</td></tr>`;
      return;
    }
    const reversedRestocks = [...restocks].reverse();

    reversedRestocks.forEach(order => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${order.restockId}</td>
        <td>${order.product?.productName || "Unknown Item"}</td>
        <td>${order.amount}</td>
        <td>${order.warehouse?.name || "Unknown Warehouse"}</td>
        <td>${new Date(order.restockDate).toLocaleDateString()}</td>
        <td>${order.orderedBy || "N/A"}</td>
      `;
      body.appendChild(row);
    });

  } catch (error) {
    console.error("Error loading restock orders:", error);
    document.getElementById("restockTableBody").innerHTML =
      `<tr><td colspan="5" style="text-align:center;color:red;">Error loading data</td></tr>`;
  }
}

// ============================== LOAD WAREHOUSES ==============================
async function loadWarehouses() {
  try {
    const response = await fetch("/warehouses");
    const warehouses = await response.json();
    const body = document.getElementById("warehouseTableBody");
    let warehousesNearCapacity = 0;
    body.innerHTML = "";

    if (!warehouses.length) {
      body.innerHTML = `<tr><td colspan="4" style="text-align:center;">No warehouses found.</td></tr>`;
      return;
    }

    warehouses.forEach(w => {
      const row = document.createElement("tr");
      row.setAttribute("onclick", `openWarehouseInventoryModal(${w.warehouseId}, '${w.name}')`);
      row.classList.add("clickable-row");
      row.innerHTML = `
      <td>${w.name}</td>
      <td>${w.location}</td>
      <td>${Number(w.totalSupply).toLocaleString("en-US")}</td>
      <td>${w.capacity ? Number(w.capacity).toLocaleString("en-US") : "N/A"}</td>
      <td>
        <button class="btn" style="padding:6px 12px; width:100px; height:30px;" 
          onclick="event.stopPropagation(); openEditWarehouseModal(${w.warehouseId}, '${w.name}', '${w.location}', ${w.capacity})">
          Edit
        </button>
      </td>
    `;

    if (loadWarehousesNearCapacity(w.totalSupply, w.capacity)) {
      row.style.border = "2px solid orange";
      warehousesNearCapacity++;
    }
    document.getElementById("warehousesNearCapacityCount").innerHTML = 
    `
    <h3>Warehouses Near Capacity ⚠️</h3>
    <span class="card-value">${warehousesNearCapacity}</span>`;
      body.appendChild(row);
    });
    // we need to do a filter when it loads to apply any existing search query

  } catch (err) {
    console.error("Error loading warehouses:", err);
    document.getElementById("warehouseTableBody").innerHTML =
      `<tr><td colspan="4" style="text-align:center;color:red;">Error loading data</td></tr>`;
  }
}

function loadWarehousesNearCapacity(totalSupply, capacity){
  const warningThreshold = 0.9; // 90% capacity
  return totalSupply / capacity >= warningThreshold;
}

// ============================== LOAD PRODUCTS ==============================
async function loadProducts() {
    try {
    const response = await fetch("/products");
    const products = await response.json();
    const body = document.getElementById("productsTableBody");
    body.innerHTML = "";

    if (!products.length) {
      body.innerHTML = `<tr><td colspan="5" style="text-align:center;">No products found.</td></tr>`;
      return;
    }

    products.forEach(async p => {
      const supplierInfo = p.supplier
        ? `${p.supplier.name} (${p.supplier.contactEmail || "No email"})`
        : "Unknown Supplier";
      const totalQuantity = await getTotalProductQuantity(p.productId);
      const row = document.createElement("tr");
      row.setAttribute("onclick", `openEditProductModal(${p.productId}, '${p.productName}', '${p.category}', ${p.price}, '${p.supplier?.supplierId || null}', ${totalQuantity})`);
      row.classList.add("clickable-row");

      row.innerHTML = `
        <td>${p.productId * 12345}</td>
        <td>${p.productName}</td>
        <td>$${p.price}</td>
        <td>${p.category}</td>
        <td>${supplierInfo}</td>
        <td>${totalQuantity}</td>  
  </td>
      `;
      body.appendChild(row);
    });

  } catch (err) {
    console.error("Error loading warehouses:", err);
    document.getElementById("warehouseTableBody").innerHTML =
      `<tr><td colspan="4" style="text-align:center;color:red;">Error loading data</td></tr>`;
  }
}

// ============================== LOAD SUPPLIERS ==============================`
async function loadSuppliers() {
    try {
    const response = await fetch("/suppliers");
    const suppliers = await response.json();
    const body = document.getElementById("suppliersTableBody");
    body.innerHTML = "";

    if (!suppliers.length) {
      body.innerHTML = `<tr><td colspan="4" style="text-align:center;">No suppliers found.</td></tr>`;
      return;
    }

    suppliers.forEach(async p => {
      const row = document.createElement("tr");
      const cleanedPhone = formatPhone(p.phone);
      row.setAttribute("onclick", `openEditSupplierModal(${p.supplierId}, '${p.name}', '${p.contactEmail}', '${cleanedPhone}', '${p.address}')`);
      row.classList.add("clickable-row");
      row.innerHTML = `
        <td>${p.name}</td>
        <td>${p.contactEmail}</td>
        <td>${cleanedPhone}</td>
        <td>${p.address}</td>
      `;
      body.appendChild(row);
    });

  } catch (err) {
    console.error("Error loading warehouses:", err);
    document.getElementById("warehouseTableBody").innerHTML =
      `<tr><td colspan="4" style="text-align:center;color:red;">Error loading data</td></tr>`;
  }
}

// ============================== EDIT SUPPLIER ==============================
function openEditSupplierModal(id, name, email, phone, address) {
  document.getElementById("deleteSupplierBtn").onclick = () => {
    openDeleteSupplierModal(id);
  };
  document.getElementById("confirmDeleteSupplierBtn").onclick = async () => {
    confirmDeleteSupplier(id);};

  document.getElementById("editSupplierModal").style.display = "flex";
  document.getElementById("editSupplierName").value = name;
  document.getElementById("editSupplierEmail").value = email;
  document.getElementById("editSupplierPhone").value = phone;
  document.getElementById("editSupplierAddress").value = address;
  document.getElementById("submitEditSupplierBtn").onclick = async () => {
    const updatedName = document.getElementById("editSupplierName").value.trim();
    const updatedEmail = document.getElementById("editSupplierEmail").value.trim();
    const updatedPhone = document.getElementById("editSupplierPhone").value.trim();
    const updatedAddress = document.getElementById("editSupplierAddress").value.trim();
    if (!updatedName || !updatedEmail || !updatedPhone || !updatedAddress) {
      showToast("Please fill out all required fields. ⚠️");
      return;
    }
    if(!validateEmail(updatedEmail)){
      showToast("Please enter a valid email address. ⚠️");
      return;
    }
    if(!validatePhone(updatedPhone)){
      showToast("Please enter a valid phone number. ⚠️");
      return;
    }
    try {
      const response = await fetch(`/suppliers/edit_supplier/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: updatedName,
          contactEmail: updatedEmail,
          phone: updatedPhone,
          address: updatedAddress
        })
      });
      if (response.ok) {
        showToast("Supplier updated successfully!");
        closeEditSupplierModal();
        loadSuppliers();
      } else {
        showToast("Failed to update supplier.");
      }
    } catch (err) {
      console.error("Error updating supplier:", err);
      showToast("Error updating supplier.");
    }
  };
}
function closeEditSupplierModal() {
  document.getElementById("editSupplierModal").style.display = "none";
  document.getElementById("editSupplierForm").reset();
}

function openDeleteSupplierModal(supplierId) {
  document.getElementById("deleteSupplierModal").style.display = "flex";
}
function closeDeleteSupplierModal() {
  document.getElementById("deleteSupplierModal").style.display = "none";
}

async function confirmDeleteSupplier(supplierId) {
  try {
    const response = await fetch(`/suppliers/delete/${supplierId}`, {
      method: "DELETE"
    });
    if (response.ok) {
      showToast("Supplier deleted successfully!");
      closeDeleteSupplierModal();
      loadSuppliers();
      closeEditSupplierModal();
    } else {
      showToast("Failed to delete supplier.");
    }
  } catch (err) {
    console.error("Error deleting supplier:", err);
    showToast("Error deleting supplier.");
  }
}
// ============================== CREATE SUPPLIER SECTION ==============================
function openCreateSupplierModal() {
  document.getElementById("createSupplierModal").style.display = "flex";
}
function closeCreateSupplierModal() {
  document.getElementById("supplierForm").reset();
  document.getElementById("createSupplierModal").style.display = "none";
}
async function submitNewSupplier(){
  const name = document.getElementById("supplierNameInput").value.trim();
  const contactEmail = document.getElementById("supplierEmailInput").value.trim();
  const phone = document.getElementById("supplierPhoneInput").value.trim();
  const address = document.getElementById("supplierAddressInput").value.trim();
  if (!name || !contactEmail || !phone || !address) {
    showToast("Please fill out all required fields. ⚠️");
    return;
  }
  if(!validateEmail(contactEmail)){
    showToast("Please enter a valid email address. ⚠️");
    return;
  }
  if(!validatePhone(phone)){
    showToast("Please enter a valid phone number. ⚠️");
    return;
  }
  try {
    const response = await fetch("/suppliers/create_supplier", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, contactEmail, phone, address })
    });
    if (response.ok) {
      showToast("Supplier created successfully!");
      closeCreateSupplierModal();
      loadSuppliers();      
    } else {
      showToast("Failed to create supplier.");
    }
  } catch (err) {
    console.error("Error creating supplier:", err);
    showToast("Error creating supplier.");
  }
}
document.getElementById("submitSupplierBtn").addEventListener("click", submitNewSupplier);

// ============================== CREATE PRODUCT SECTION ==============================
function openCreateProductModal() {
  document.getElementById("createProductModal").style.display = "flex";
  loadSupplierNames(null, "createProductSupplierSelect");
}
function closeCreateProductModal() {
  document.getElementById("createProductForm").reset();
  document.getElementById("createProductModal").style.display = "none";
}

async function submitNewProduct() {
  const name = document.getElementById("productNameInput").value.trim();
  const category = document.getElementById("productCategoryInput").value.trim();
  const price = parseFloat(document.getElementById("productPriceInput").value);
  const supplierId = document.getElementById("createProductSupplierSelect").value || null;
  if (!name || !category || !price) {
    showToast("Please fill out all fields. ⚠️");
    return;
  }
  try {
    const response = await fetch("/products/create_product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        productName: name, 
        category: category, 
        price: price, 
        supplierId: supplierId})
    });
    console.log(response.status);
    if (response.ok) {
      showToast("Product created successfully!");
      closeCreateProductModal();
      loadProducts();
      loadWarehouses();
      loadTotalInventoryQuantityAndValue();
    } 
    else if(response.status === 409){
      showToast("Product with this name already exists.", 3000);
    }
    else {
      showToast("Failed to create product.", 3000);
    }
  } catch (err) {
    console.error("Error creating product:", err);
    showToast("Error creating product.", 3000);
  }
}
async function loadSupplierNames(selectedSupplierId, selectElementId) {
  try {
    const response = await fetch("/suppliers");
    const suppliers = await response.json();

    const supplierSelect = document.getElementById(selectElementId);

    // Clear old options
    supplierSelect.innerHTML = `
      <option value="">-- Select Supplier --</option>
    `;

    suppliers.forEach(supplier => {
      const option = document.createElement("option");
      option.value = supplier.supplierId;
      option.textContent = supplier.name;

      if (supplier.supplierId == selectedSupplierId) {
        option.selected = true;
      }

      supplierSelect.appendChild(option);
    });

  } catch (err) {
    console.error("Error loading suppliers:", err);
  }
}

document.getElementById("submitProductBtn").addEventListener("click", submitNewProduct);

// ============================== EDIT PRODUCT SECTION ==============================
function openEditProductModal(id, name, category, price, supplierId, totalQuantity) {
  loadSupplierNames(supplierId, "editProductSupplierSelect");
  document.getElementById("editProductModal").style.display = "flex";
  document.getElementById("editProductName").value = name;
  document.getElementById("editProductCategory").value = category;
  document.getElementById("editProductPrice").value = price;
  document.getElementById("editProductTotalQuantity").value = totalQuantity;

  document.getElementById("submitEditProductBtn").onclick = async () => {
    const updatedName = document.getElementById("editProductName").value.trim();
    const updatedCategory = document.getElementById("editProductCategory").value.trim();
    const updatedPrice = parseFloat(document.getElementById("editProductPrice").value);
    const updatedSupplierId = document.getElementById("editProductSupplierSelect").value || null;
    
    if (!updatedName || !updatedCategory || isNaN(updatedPrice) || updatedSupplierId === null) {
      showToast("Please fill out all fields. ⚠️");
      return;
    }
    try {
      const response = await fetch(`/products/edit_product/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          productName: updatedName, 
          category: updatedCategory, 
          price: updatedPrice, 
          supplierId: updatedSupplierId ? parseInt(updatedSupplierId) : null
        })
      });
      
      if (response.ok) {
        showToast("Product updated successfully!");
        closeEditProductModal();
        loadProducts();
        loadWarehouses();
        loadTotalInventoryQuantityAndValue();
      } else {
        showToast("Failed to update product.", 3000);
      }
    } catch (err) {
      console.error("Error updating product:", err);
      showToast("Error updating product.", 3000);
    }
  }
  document.getElementById("deleteProductBtn").onclick = () => {
  openDeleteProductModal(id);
};
}
function closeEditProductModal() {
  document.getElementById("editProductModal").style.display = "none";
  document.getElementById("editProductForm").reset();
}

// ============================== DELETE PRODUCT SECTION ==============================
function openDeleteProductModal(productId) {
  document.getElementById("deleteProductModal").style.display = "flex";
  document.getElementById("confirmDeleteProductBtn").addEventListener("click", () => {
  confirmDeleteProduct(productId);
  });
}
function closeDeleteProductModal() {
  document.getElementById("deleteProductModal").style.display = "none";
}
async function confirmDeleteProduct(productId) {
  try {
    const response = await fetch(`/products/delete/${productId}`, {
      method: "DELETE"
    });

    if (response.ok) {
      showToast("Product deleted successfully!");
      closeEditProductModal();
      closeDeleteProductModal();
      loadProducts();
      loadTotalInventoryQuantityAndValue();
      loadWarehouses();
    } else {
      showToast("Failed to delete product.", 3000);
    }
  } catch (err) {
    console.error("Error deleting product:", err);
    showToast("Error deleting product.", 3000);
  }
}

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
// ============================== LOAD TOTAL INVENTORY VALUE ==============================

// ============================== GET TOTAL PRODUCT QUANTITY  ==============================
async function getTotalProductQuantity(productId) { 
    try {
        const response = await fetch(`/inventory/product/${productId}`);
        const inventoryItems = await response.json();
        let totalQuantity = 0;
        inventoryItems.forEach(item => {
            totalQuantity += item.quantity || 0;
        });
        return totalQuantity;
    } catch (err) {
        console.error("Error fetching total product quantity:", err);
        return 0;
    }
}

// ============================== EDIT WAREHOUSE SECTION ==============================
let editingWarehouseId = null;

function openEditWarehouseModal(id, name, location, capacity) {
  editingWarehouseId = id;

  document.getElementById("editWarehouseName").value = name;
  document.getElementById("editWarehouseLocation").value = location;
  document.getElementById("editWarehouseCapacity").value = capacity;

  document.getElementById("editWarehouseModal").style.display = "flex";
}

function closeEditWarehouseModal() {
  document.getElementById("editWarehouseModal").style.display = "none";
  document.getElementById("editWarehouseForm").reset();
}

document.getElementById("editWarehouseModal").addEventListener("click", (e) => {
  if (e.target.id === "editWarehouseModal") {
    closeEditWarehouseModal();
  }
});

document.getElementById("submitEditWarehouseBtn").addEventListener("click", async () => {
  const name = document.getElementById("editWarehouseName").value.trim();
  const location = document.getElementById("editWarehouseLocation").value.trim();
  const capacity = Number(document.getElementById("editWarehouseCapacity").value);

  if (!name || !location || isNaN(capacity)) {
    showToast("Please fill out all fields. ⚠️");
    return;
  }

  try {
    const response = await fetch(`/warehouses/edit_warehouse/${editingWarehouseId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, location, capacity })
    });

    if (response.ok) {
      showToast("Warehouse updated successfully!");
      closeEditWarehouseModal();
      loadWarehouses();
      loadTotalInventoryQuantityAndValue();
    } else {
      showToast("Failed to update warehouse.", 3000);
    }
  } catch (err) {
    console.error("Error updating warehouse:", err);
    showToast("Error updating warehouse.", 3000);
  }
});

// ============================== LOAD CHECKOUTS ==============================
async function loadCheckouts() {
  try {
    const response = await fetch("/checkouts");
    const checkouts = await response.json();
    const body = document.getElementById("checkoutTableBody");
    body.innerHTML = "";

    if (!checkouts.length) {
      body.innerHTML = `<tr><td colspan="5" style="text-align:center;">No checkouts found.</td></tr>`;
      return;
    }

    checkouts.forEach(co => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${co.checkoutId}</td>
        <td>${co.product?.productName || "Unknown Item"}</td>
        <td>${co.amount}</td>
        <td>${co.warehouse?.name || "Unknown Warehouse"}</td>
        <td>${new Date(co.checkoutDate).toLocaleDateString()}</td>
        <td>${co.userEmail || "N/A"}</td>
      `;
      body.appendChild(row);
    });

  } catch (err) {
    console.error("Error loading checkouts:", err);
    document.getElementById("checkoutTableBody").innerHTML =
      `<tr><td colspan="5" style="text-align:center;color:red;">Error loading data</td></tr>`;
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

// ============================== DROPDOWN ==============================
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

// ============================== RESTOCK MODAL ==============================
async function openRestockModal() {
  const modal = document.getElementById("restockModal");
  const modalContent = document.getElementById("restockModalContent");
  modal.style.display = "flex";

  const products = await (await fetch("/products")).json();
  const warehouses = await (await fetch("/warehouses")).json();

  modalContent.innerHTML = `
    <button id="closeRestockModalBtn" class="close-btn" aria-label="Close">&times;</button>

    <h2>Select Warehouse</h2>
      <select id="restockWarehouseSelect" class="select-dd" style="margin-top:10px;">
      <option value="">-- Choose a warehouse --</option>
      ${warehouses.map(w => `<option value="${w.warehouseId}">${w.name}</option>`).join("")}
    </select>

    <h2 style="margin-top:20px;">Select Product</h2>
    <select id="restockProductSelect" class="select-dd" style="margin-top:10px;">
      <option value="">-- Choose a product --</option>
    </select>

    <div id="restockProductDetails" style="margin-top:20px;color:#ddd;font-size:0.9rem;"></div>

    <div id="restockAmountContainer" style="margin-top:20px; display:none;">
      <label style="display:block;">Amount to Restock:</label>
      <input type="number" id="restockAmount" min="1"
        style="width:120px;padding:6px;background:#2a2a2a;color:#fff;border:1px solid #444;border-radius:4px;">
    </div>

    <div style="text-align:right;margin-top:25px;">
      <button id="submitRestockBtn" class="btn" disabled>Submit Restock</button>
    </div>
  `;

  // Close button
  document.getElementById("closeRestockModalBtn").addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Fields
  const warehouseSelect = document.getElementById("restockWarehouseSelect");
  const productSelect = document.getElementById("restockProductSelect");
  const amountInput = document.getElementById("restockAmount");
  const amountContainer = document.getElementById("restockAmountContainer");
  const detailsDiv = document.getElementById("restockProductDetails");
  const submitBtn = document.getElementById("submitRestockBtn");

  // Enable submit only when valid
  function updateSubmitState() {
    const warehouseId = warehouseSelect.value;
    const productId = productSelect.value;
    const amount = parseInt(amountInput.value || 0);

    submitBtn.disabled = !warehouseId || !productId || amount <= 0;
  }

  warehouseSelect.addEventListener("change", updateSubmitState);
  amountInput.addEventListener("input", updateSubmitState);

  warehouseSelect.addEventListener("change", async () => {
  const warehouseId = warehouseSelect.value;

  productSelect.innerHTML = `<option value="">-- Choose a product --</option>`;
  detailsDiv.innerHTML = "";
  amountContainer.style.display = "none";
  submitBtn.disabled = true;

  if (!warehouseId) return;

  // Load ALL products instead of only products in this warehouse
  const allProducts = await (await fetch(`/products`)).json();

  allProducts.forEach(p => {
    productSelect.innerHTML += `<option value="${p.productId}">${p.productName}</option>`;
  });
  });

  // When product is selected → show details + amount input
  productSelect.addEventListener("change", async (e) => {
    const productId = e.target.value;

    detailsDiv.innerHTML = "";
    amountContainer.style.display = "none";
    submitBtn.disabled = true;

    if (!productId) return;

    const product = await (await fetch(`/products/${productId}`)).json();

    const supplier = product.supplier
      ? `${product.supplier.name} (${product.supplier.contactEmail || "No email"})`
      : "Unknown Supplier";

    detailsDiv.innerHTML = `
      <table style="width:100%; border-collapse:collapse; color:#ddd; font-size:0.9rem;">
        <tbody>
          <tr style="border-bottom:1px solid #333;">
            <td style="padding:8px 6px; width:140px; font-weight:600;">Product SKU</td>
            <td style="padding:8px 6px;">${product.productId * 12345}</td>
          </tr>
          <tr style="border-bottom:1px solid #333;">
            <td style="padding:8px 6px; width:140px; font-weight:600;">Product Name</td>
            <td style="padding:8px 6px;">${product.productName}</td>
          </tr>

          <tr style="border-bottom:1px solid #333;">
            <td style="padding:8px 6px; font-weight:600;">Category</td>
            <td style="padding:8px 6px;">${product.category}</td>
          </tr>

          <tr style="border-bottom:1px solid #333;">
            <td style="padding:8px 6px; font-weight:600;">Price</td>
            <td style="padding:8px 6px;">$${(+product.price).toFixed(2)}</td>
          </tr>

          <tr>
            <td style="padding:8px 6px; font-weight:600;">Supplier</td>
            <td style="padding:8px 6px;">${supplier}</td>
          </tr>
        </tbody>
      </table>
    `;

    amountContainer.style.display = "block";
    updateSubmitState();
  });

  // Submit restock order
  submitBtn.addEventListener("click", async () => {
    const warehouseId = warehouseSelect.value;
    const productId = productSelect.value;
    const amount = parseInt(amountInput.value, 10);

    if (!warehouseId || !productId || amount <= 0) return;

    try {
      const canFit = await checkWarehouseCapacity(warehouseId, amount);
      if (!canFit) {
        showToast("This change will place the warehouse over capacity!", 5000);
        return;
      }

      await fetch("/restocks/create_restock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          warehouseId,
          productId,
          amount,
          orderedBy: currentUserEmail
        })
      });

      showToast("Restock created successfully!");
      loadTotalInventoryQuantityAndValue();
      closeRestockModal();
      loadRestockOrders();
      loadWarehouses();
    } catch (err) {
      console.error("Restock error:", err);
      showToast("Error creating restock order.", 3000);
    }
  });
}

function closeRestockModal() {
  document.getElementById("restockModal").style.display = "none";
}


// ============================== TOAST ==============================
function showToast(message, duration = 2500) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.style.display = "block";
  setTimeout(() => (toast.style.display = "none"), duration);
}

// ============================== OPEN CREATE WAREHOUSE MODAL ==============================
function openCreateWarehouseModal() {
  document.getElementById("createWarehouseModal").style.display = "flex";
}

// ============================== CLOSE CREATE WAREHOUSE MODAL ==============================
document.getElementById("closeWarehouseModalBtn").addEventListener("click", () => {
  document.getElementById("createWarehouseForm").reset();
  document.getElementById("createWarehouseModal").style.display = "none";
});

document.getElementById("createWarehouseModal").addEventListener("click", (e) => {
  if (e.target.id === "createWarehouseModal") {
    document.getElementById("createWarehouseModal").style.display = "none";
  }
});

// ============================== SUBMIT NEW WAREHOUSE ==============================
document.getElementById("submitWarehouseBtn").addEventListener("click", async () => {
  const name = document.getElementById("warehouseNameInput").value.trim();
  const location = document.getElementById("warehouseLocationInput").value.trim();
  const capacity = Number(document.getElementById("warehouseCapacityInput").value);

  if (!name || !location || isNaN(capacity)) {
    showToast("Please fill out all fields. ⚠️");
    return;
  }

  try {
    const response = await fetch("/warehouses/create_warehouse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, location, capacity })
    });

    if (response.ok) {
      showToast("Warehouse created successfully!");
      document.getElementById("createWarehouseModal").style.display = "none";
      loadWarehouses();
    } else {
      showToast("Failed to create warehouse.");
    }

  } catch (err) {
    console.error(err);
    showToast("Error creating warehouse.");
  }
});

// ============================== DELETE WAREHOUSE SECTION ==============================
function openDeleteWarehouseModal() {
    document.getElementById("deleteWarehouseModal").style.display = "flex";
    loadDeleteWarehouseList();
}
// ============================== LOAD DELETE WAREHOUSE LIST ==============================
async function loadDeleteWarehouseList() {
    const list = document.getElementById("deleteWarehouseList");
    list.innerHTML = "Loading...";

    try {
        const response = await fetch("/warehouses");
        const warehouses = await response.json();

        if (!warehouses.length) {
            list.innerHTML = "<p>No warehouses available.</p>";
            return;
        }

        list.innerHTML = `
            <table style="width:100%; border-collapse:collapse; color:#ddd; font-size:0.9rem;">
                <thead>
                    <tr style="border-bottom:1px solid #333; text-align:left;">
                        <th style="padding:8px;">Select</th>
                        <th style="padding:8px;">Warehouse Name</th>
                        <th style="padding:8px;">Location</th>
                        <th style="padding:8px;">Total Stock</th>
                        <th style="padding:8px;">Capacity</th>
                    </tr>
                </thead>

                <tbody>
                    ${warehouses.map(w => `
                        <tr style="border-bottom:1px solid #2a2a2a;">
                            <td style="padding:8px; width:60px;">
                                <input type="checkbox" 
                                      name="deleteWarehouse" 
                                      value="${w.warehouseId}">
                            </td>

                            <td style="padding:8px;">${w.name}</td>
                            <td style="padding:8px;">${w.location}</td>

                            <td style="padding:8px;">
                                ${w.totalSupply ?? "0"}
                            </td>

                            <td style="padding:8px;">
                                ${w.capacity ?? "N/A"}
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        `;

        // Enable button when something is checked
        document.querySelectorAll("input[name='deleteWarehouse']").forEach(cb => {
            cb.addEventListener("change", () => {
                document.getElementById("submitDeleteWarehouseBtn").disabled =
                    document.querySelectorAll("input[name='deleteWarehouse']:checked").length === 0;
            });
        });

    } catch (err) {
        console.error("Error loading delete warehouse list:", err);
        list.innerHTML = "<p>Error loading warehouses.</p>";
    }
}
// ============================== WAREHOUSE INVENTORY SECTION ==============================
function openWarehouseInventoryModal(warehouseId, warehouseName) {
  document.getElementById("WarehouseInventoryModal").style.display = "flex";
  loadInventoryForWarehouse(warehouseId, warehouseName);
}
function closeWarehouseInventoryModal() {
    document.getElementById("WarehouseInventoryModal").style.display = "none";
}

async function loadInventoryForWarehouse(warehouseId, warehouseName) {
    try {
    document.getElementById("warehouseInventoryTitle").textContent =
    `${warehouseName} Inventory`;
    const response = await fetch(`/inventory/warehouse/${warehouseId}`);
    const inventory = await response.json();
    const body = document.getElementById("warehouseInventoryTableBody");
    body.innerHTML = "";

    if (!inventory.length) {
      body.innerHTML = `<tr><td colspan="6" style="text-align:center;">No inventory found.</td></tr>`;
      return;
    }
    inventory.forEach(i => {
      const row = document.createElement("tr");
      row.setAttribute("onclick", `openEditInventoryLocationModal('${i.product.productName}', ${i.inventoryId}, ${warehouseId}, '${warehouseName}', '${i.warehouseLocation || ""}', ${i.minimumStock})`);
      row.classList.add("clickable-row");
      const cleanedProductName = i.product.productName.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      // check if inventory is below minimum stock and add orange border if so
      if (i.quantity < i.minimumStock) {
        row.style.border = "2px solid orange";
      }
      row.innerHTML = `
        <td>${i.product.productId * 12345}</td>
        <td>${i.product.productName}</td>
        <td>${i.quantity}</td>
        <td>$${i.product.price}</td>
        <td>${i.product.category || "N/A"}</td>
        <td>${i.product.supplier ? i.product.supplier.name + " (" + i.product.supplier.contactEmail + ")" : "Unknown Supplier"}</td>
        <td>Shelf# ${i.warehouseLocation || "0"}</td>
        <td>${i.minimumStock}</td>
        <td><button class="btn"onclick="event.stopPropagation(); openTransferInventoryModal(${i.inventoryId}, ${warehouseId}, ${i.product.productId}, '${cleanedProductName}', ${i.minimumStock})">Transfer</button></td>        
        <td><button class="btn" style="background-color: Red; padding:6px 12px;"onclick="event.stopPropagation(); openDeleteInventoryItemModal(${i.inventoryId})">Delete</button></td>      `;
      body.appendChild(row);
    });
  } catch (err) {
    console.error("Error loading inventory:", err);
    document.getElementById("warehouseInventoryTableBody").innerHTML =
      `<tr><td colspan="6" style="text-align:center;color:red;">Error loading data</td></tr>`;
  }
}

// ============================== EDIT INVENTORY IN WAREHOUSE ==============================
let editingInventoryId = null;
let currentWarehouseId = null;
let currentWarehouseName = null;
function openEditInventoryLocationModal(productName, inventoryId, warehouseId, warehouseName, warehouseLocation, minStock) {
  editingInventoryId = inventoryId;
  currentWarehouseId = warehouseId;
  currentWarehouseName = warehouseName;
  document.getElementById("editInventoryLocationModal").style.display = "flex";
  document.getElementById("editInventoryLocationInput").value = warehouseLocation || "";
  document.getElementById("editInventoryMinStockInput").value = minStock || 0;
  document.getElementById("editInventoryItemName").textContent = productName;

}

function closeEditInventoryAndMinStockLocationModal() {
    document.getElementById("editInventoryLocationModal").style.display = "none";
}

document.getElementById("confirmEditInventoryBtn").addEventListener("click", async () => {
  const newLocation = document.getElementById("editInventoryLocationInput").value.trim();
  const minimumStock = Number(document.getElementById("editInventoryMinStockInput").value);

  if (isNaN(minimumStock) || minimumStock < 0) {
    showToast("Please enter a valid minimum stock value. ⚠️");
    return;
  }
  if (!newLocation) {
    showToast("Please enter a valid warehouse location. ⚠️");
    return;
  }
  try {
    const response = await fetch(`/inventory/update_locationAndMinStock/${editingInventoryId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        warehouseLocation: Number(newLocation),
        minimumStock: minimumStock
      })
    });

    if (response.ok) {
      showToast("Inventory location updated successfully!");
      closeEditInventoryAndMinStockLocationModal();
      loadWarehouses();
      loadInventoryForWarehouse(currentWarehouseId, currentWarehouseName);
    } else {
      showToast("Failed to update inventory location.", 3000);
    }
  } catch (err) {
    console.error("Error updating inventory location:", err);
    showToast("Error updating inventory location.", 3000);
  }
});


// ============================== TRANSFER INVENTORY SECTION ==============================
let inventoryToTransfer = null;
let fromWarehouseId = null;
let transferProductId = null;
async function openTransferInventoryModal(inventoryId, fromWarehouse, productId, productName) {
    inventoryToTransfer = inventoryId; // store for confirm step
    fromWarehouseId = fromWarehouse;
    transferProductId = productId;

    document.getElementById("transferInventoryModal").style.display = "flex";
    document.getElementById("transferInventoryTitle").textContent =
    `Transfer Item: ${productName}`;
    // Load all warehouses for the dropdown
    const wRes = await fetch("/warehouses");
    const warehouses = await wRes.json();
    
    // Populate dropdown
    const select = document.getElementById("transferToWarehouseSelect");
    select.innerHTML = `
        <option value="">-- Choose A Warehouse --</option>`;
      for (const w of warehouses) {
    const invRes = await fetch(`/inventory/warehouse/${w.warehouseId}`);
    const items = await invRes.json();

    // find the item for this product
    const record = items.find(i => i.product.productId === productId);
    const qty = record ? record.quantity : 0;

    select.innerHTML += `
      <option value="${w.warehouseId}">
        ${w.name} — ${qty} In Stock
      </option>
    `;
  }
}

function closeTransferInventoryModal() {
    document.getElementById("transferInventoryModal").style.display = "none";
    document.getElementById("transferAmountInput").value = "";
}

async function confirmTransferInventory() {

    const amount = Number(document.getElementById("transferAmountInput").value);
    const newWarehouseId = document.getElementById("transferToWarehouseSelect").value;

    if (!amount || amount <= 0) {
        showToast("Please enter a valid amount to transfer. ⚠️");
        return;
    }

    if (!newWarehouseId) {
        showToast("Select a warehouse to transfer to. ⚠️");
        return;
    }

    try {
      if(await checkWarehouseCapacity(newWarehouseId, amount) === false){
              showToast("This change will place a selected warehouse(s) over capacity!", 5000);
              closeTransferInventoryModal();
              loadWarehouses();
              return;
            }
      const inStock = await checkIfInStock(fromWarehouseId, transferProductId, amount);
      if (inStock === false){
          showToast("Insufficient stock to transfer the requested amount.", 3000);
          return;
      }
        await fetch(`/inventory/transfer/${inventoryToTransfer}/${newWarehouseId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: amount })
        });
        closeTransferInventoryModal();
        loadLowStockCount();
        loadWarehouses();
        loadTotalInventoryQuantityAndValue();
        showToast("Inventory transferred successfully!");
    } catch (err) {
        console.error("Error transferring inventory:", err);
        showToast("Error transferring inventory.", 3000);
    }
}

async function confirmDeleteInventoryItem(inventoryId) {
    try {
        await fetch(`/inventory/delete/${inventoryId}`, {
            method: "DELETE"
        });
        showToast("Inventory item deleted successfully!");
        document.getElementById("WarehouseInventoryModal").style.display = "none";
        loadLowStockCount();
        loadTotalInventoryQuantityAndValue();
        loadWarehouses();
    } catch (err) {
        console.error("Error deleting inventory item:", err);
        showToast("Error deleting inventory item.", 3000);
    }
}
function openDeleteInventoryItemModal(inventoryId) {
    inventoryIdToDelete = inventoryId;
    document.getElementById("deleteInventoryItemModal").style.display = "flex";
    document.getElementById("confirmDeleteInventoryItemBtn").onclick = () => {closeDeleteInventoryItemModal(); confirmDeleteInventoryItem(inventoryIdToDelete);};
}
function closeDeleteInventoryItemModal() {
    document.getElementById("deleteInventoryItemModal").style.display = "none";
}


// ============================== SUBMIT DELETE WAREHOUSES ==============================
document.getElementById("submitDeleteWarehouseBtn").addEventListener("click", () => {
    const selected = document.querySelectorAll("input[name='deleteWarehouse']:checked");

    if (selected.length === 0) {
        showToast("Please select at least one warehouse to delete. ⚠️");
        return;
    }

    document.getElementById("confirmOverlay").style.display = "block";
    document.getElementById("confirmDeleteBox").style.display = "block";
});

document.getElementById("confirmNoBtn").addEventListener("click", () => {
    document.getElementById("confirmOverlay").style.display = "none";
    document.getElementById("confirmDeleteBox").style.display = "none";
});

document.getElementById("confirmYesBtn").addEventListener("click", async () => {
    const selectedWarehouses = Array.from(
        document.querySelectorAll("input[name='deleteWarehouse']:checked")
    ).map(cb => cb.value);

    try {
        for (const wId of selectedWarehouses) {
            await fetch(`/warehouses/delete_warehouse/${wId}`, { method: "DELETE" });
        }
        loadTotalInventoryQuantityAndValue();
        showToast("Selected warehouse(s) deleted successfully!");
        document.getElementById("confirmOverlay").style.display = "none";
        document.getElementById("confirmDeleteBox").style.display = "none";
        document.getElementById("deleteWarehouseModal").style.display = "none";
        loadWarehouses();
        
    } catch (err) {
        console.error("Delete error:", err);
        showToast("Error deleting warehouse(s).", 3000);
    }
});




// ============================== CLOSE DELETE WAREHOUSE MODAL ==============================
function closeDeleteWarehouseModal() {
    document.getElementById("deleteWarehouseModal").style.display = "none";
}


// ============================== CHECKOUT MODAL SECTION ==============================
async function openCheckoutModal() {
  const modal = document.getElementById("checkoutModal");
  const modalContent = document.getElementById("checkoutModalContent");
  modal.style.display = "flex";

  const products = await (await fetch("/products")).json();
  const warehouses = await (await fetch("/warehouses")).json();

  // Build modal UI
  modalContent.innerHTML = `
    <button id="closeCheckoutModalBtn" class="close-btn" aria-label="Close">&times;</button>

    <h2>Select Warehouse</h2>
      <select id="checkoutWarehouseSelect" class="select-dd" style="margin-top:10px;">
      <option value="">-- Choose a warehouse --</option>
      ${warehouses.map(w => `<option value="${w.warehouseId}">${w.name}</option>`).join("")}
    </select>

    <h2 style="margin-top:20px;">Select Product</h2>
    <select id="checkoutProductSelect" class="select-dd" style="margin-top:10px;">
      <option value="">-- Choose a product --</option>
    </select>

    <div id="checkoutProductDetails" style="margin-top:20px;color:#ddd;font-size:0.9rem;"></div>

    <div id="amountContainer" style="margin-top:20px; display:none;">
      <label style="display:block;">Amount to Checkout:</label>
      <input type="number" id="checkoutAmount" min="1"
        style="width:120px;padding:6px;background:#2a2a2a;color:#fff;border:1px solid #444;border-radius:4px;">
    </div>

    <div style="text-align:right;margin-top:25px;">
      <button id="submitCheckoutBtn" class="btn" disabled>Submit Checkout</button>
    </div>
  `;

  document.getElementById("closeCheckoutModalBtn").addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Field references
  const warehouseSelect = document.getElementById("checkoutWarehouseSelect");
  const productSelect = document.getElementById("checkoutProductSelect");
  const amountInput = document.getElementById("checkoutAmount");
  const amountContainer = document.getElementById("amountContainer");
  const detailsDiv = document.getElementById("checkoutProductDetails");
  const submitBtn = document.getElementById("submitCheckoutBtn");

  // Enable submit button when all inputs are valid
  function updateSubmitState() {
    const warehouseId = warehouseSelect.value;
    const productId = productSelect.value;
    const amount = parseInt(amountInput.value || 0);

    submitBtn.disabled = false;
    if (!warehouseId || !productId) {
      submitBtn.disabled = true;
    }
  }

  warehouseSelect.addEventListener("change", updateSubmitState);
  amountInput.addEventListener("input", updateSubmitState);

  warehouseSelect.addEventListener("change", async () => {
    const warehouseId = warehouseSelect.value;

    // Reset product UI
    productSelect.innerHTML = `<option value="">-- Choose a product --</option>`;
    detailsDiv.innerHTML = "";
    amountContainer.style.display = "none";
    submitBtn.disabled = true;

    if (!warehouseId) return;

    // Fetch products ONLY in this warehouse
    const inventory = await (await fetch(`/inventory/warehouse/${warehouseId}`)).json();

    inventory.forEach(item => {
      const p = item.product;
      const quantity = item.quantity || 0;
      productSelect.innerHTML += `<option value="${p.productId}">${p.productName} — ${quantity} In Stock</option>`;
    });
  });

  // When the user selects a product
  productSelect.addEventListener("change", async (e) => {
    const productId = e.target.value;
    amountContainer.style.display = "none";
    detailsDiv.innerHTML = "";
    submitBtn.disabled = true;

    if (!productId) return;

    const product = await (await fetch(`/products/${productId}`)).json();

    const supplier = product.supplier
      ? `${product.supplier.name} (${product.supplier.contactEmail || "No email"})`
      : "Unknown Supplier";

    // Build details UI (same style as restock modal)
    detailsDiv.innerHTML = `
      <table style="width:100%; border-collapse:collapse; color:#ddd; font-size:0.9rem;">
        <tbody>
          <tr style="border-bottom:1px solid #333;">
            <td style="padding:8px 6px; width:140px; font-weight:600;">Product SKU</td>
            <td style="padding:8px 6px;">${product.productId * 12345}</td>
          </tr>
          <tr style="border-bottom:1px solid #333;">
            <td style="padding:8px 6px; width:140px; font-weight:600;">Product Name</td>
            <td style="padding:8px 6px;">${product.productName}</td>
          </tr>

          <tr style="border-bottom:1px solid #333;">
            <td style="padding:8px 6px; font-weight:600;">Category</td>
            <td style="padding:8px 6px;">${product.category}</td>
          </tr>

          <tr style="border-bottom:1px solid #333;">
            <td style="padding:8px 6px; font-weight:600;">Price</td>
            <td style="padding:8px 6px;">$${(+product.price).toFixed(2)}</td>
          </tr>

          <tr>
            <td style="padding:8px 6px; font-weight:600;">Supplier</td>
            <td style="padding:8px 6px;">${supplier}</td>
          </tr>

        </tbody>
      </table>
    `;

    amountContainer.style.display = "block";
    updateSubmitState();
  });

  // Submit checkout
  submitBtn.addEventListener("click", submitCheckout);
}


// ============================== CLOSE CHECKOUT MODAL ==============================
function closeCheckoutModal() {
  document.getElementById("checkoutModal").style.display = "none";
}

// submit checkout function
async function submitCheckout() {
  const warehouseId = document.getElementById("checkoutWarehouseSelect").value;
  const productId = document.getElementById("checkoutProductSelect").value;
  const amount = parseInt(document.getElementById("checkoutAmount").value, 10);
  const email = currentUserEmail;

  try {
    if(isNaN(amount) || amount <= 0){
      showToast("Please enter a valid amount. ⚠️", 3000);
      return;
    }
    const inStock = await checkIfInStock(warehouseId, productId, amount);
    if (!inStock) {
      showToast("Not enough stock available. ⚠️", 3000);
      return;
    }
    const response = await fetch(URL + "/checkouts/create_checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        warehouseId,
        productId,
        amount,
        email
      })
    });
    if (response.ok) {
      await reduceInventory(warehouseId, productId, amount);
      showToast("Checkout successfull!");
      loadLowStockCount();
      loadTotalInventoryQuantityAndValue();
      document.getElementById("checkoutModal").style.display = "none";
      loadCheckouts();
    } else {
      showToast("Checkout failed.", 3000);
    }
  } catch (err) {
    console.error("Checkout Error:", err);
    showToast("Error creating checkout.", 3000);
  }
}

async function reduceInventory(warehouseId, productId, amount) {
  try {
    const response = await fetch("/inventory/reduce", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        warehouseId,
        productId,
        amount
      })
    });

    if (response.ok) {
      showToast("Inventory updated successfully!");
      loadWarehouses();
      loadTotalInventoryQuantityAndValue();
    } else {
      showToast("Failed to update inventory.");
    }

  } catch (err) {
    console.error("Error updating inventory:", err);
    showToast("Error updating inventory.", 3000);
  }
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



// ============================== SEARCH FILTERING RESTOCKS SECTION ==============================
// global search
document.getElementById("searchInputRestocks")
  .addEventListener("input", applyRestockFilters);

// column searches
document.getElementById("searchRestockId")
  .addEventListener("input", applyRestockFilters);
document.getElementById("searchRestockItem")
  .addEventListener("input", applyRestockFilters);
document.getElementById("searchRestockWarehouse")
  .addEventListener("input", applyRestockFilters);
document.getElementById("searchRestockDate")
  .addEventListener("input", applyRestockFilters);
document.getElementById("searchRestockBy")
  .addEventListener("input", applyRestockFilters);

function applyRestockFilters() {

  const globalQuery    = document.getElementById("searchInputRestocks").value.trim().toLowerCase();
  const idQuery        = document.getElementById("searchRestockId").value.trim().toLowerCase();
  const itemQuery      = document.getElementById("searchRestockItem").value.trim().toLowerCase();
  const warehouseQuery = document.getElementById("searchRestockWarehouse").value.trim().toLowerCase();
  const dateQuery      = document.getElementById("searchRestockDate").value.trim().toLowerCase();
  const byQuery        = document.getElementById("searchRestockBy").value.trim().toLowerCase();

  const rows = document.querySelectorAll("#restockTableBody tr");

  rows.forEach(row => {
    const cells = row.querySelectorAll("td");
    if (cells.length < 6) return;

    const restockId     = cells[0].innerText.toLowerCase();
    const item          = cells[1].innerText.toLowerCase();
    const warehouseName = cells[3].innerText.toLowerCase();
    const date          = cells[4].innerText.toLowerCase();
    const orderedBy     = cells[5].innerText.toLowerCase();

    const matches =
      // global
      (globalQuery === "" ||
        restockId.includes(globalQuery) ||
        item.includes(globalQuery) ||
        warehouseName.includes(globalQuery) ||
        date.includes(globalQuery) ||
        orderedBy.includes(globalQuery)) &&

      // column filters
      (idQuery        === "" || restockId.includes(idQuery)) &&
      (itemQuery      === "" || item.includes(itemQuery)) &&
      (warehouseQuery === "" || warehouseName.includes(warehouseQuery)) &&
      (dateQuery      === "" || date.includes(dateQuery)) &&
      (byQuery        === "" || orderedBy.includes(byQuery));

    row.style.display = matches ? "" : "none";
  });
}


// ============================== SORTING RESTOCKS SECTION ==============================

let restockSortDirection = {};
function sortRestocks(colIndex) {
  const tbody = document.getElementById("restockTableBody");
  const rows = Array.from(tbody.querySelectorAll("tr"));

  restockSortDirection[colIndex] = !restockSortDirection[colIndex];
  const asc = restockSortDirection[colIndex];

  const sorted = rows.sort((rowA, rowB) => {
    const a = rowA.children[colIndex].innerText.trim();
    const b = rowB.children[colIndex].innerText.trim();

    // Restock ID (numeric)
    if (colIndex === 0) {
      const numA = parseInt(a, 10);
      const numB = parseInt(b, 10);
      return asc ? numA - numB : numB - numA;
    }

    // Restock Date (MM/DD/YYYY)
    if (colIndex === 4) {
      const [mA, dA, yA] = a.split("/");
      const [mB, dB, yB] = b.split("/");
      const dateA = new Date(yA, mA - 1, dA);
      const dateB = new Date(yB, mB - 1, dB);
      return asc ? dateA - dateB : dateB - dateA;
    }

    // Default: text (Item Restocked, Ordered By)
    const aa = a.toLowerCase();
    const bb = b.toLowerCase();
    return asc ? aa.localeCompare(bb) : bb.localeCompare(aa);
  });

  sorted.forEach(row => tbody.appendChild(row));
}

// ============================== SEARCH FILTERING CHECKOUTS SECTION ==============================

// global search
document.getElementById("searchInputCheckouts")
  .addEventListener("input", applyCheckoutFilters);

// column searches
document.getElementById("searchCheckoutId")
  .addEventListener("input", applyCheckoutFilters);
document.getElementById("searchCheckoutItem")
  .addEventListener("input", applyCheckoutFilters);
document.getElementById("searchCheckoutWarehouse")
  .addEventListener("input", applyCheckoutFilters);
document.getElementById("searchCheckoutDate")
  .addEventListener("input", applyCheckoutFilters);
document.getElementById("searchCheckoutBy")
  .addEventListener("input", applyCheckoutFilters);

function applyCheckoutFilters() {
  const globalQuery   = document.getElementById("searchInputCheckouts").value.trim().toLowerCase();
  const idQuery       = document.getElementById("searchCheckoutId").value.trim().toLowerCase();
  const itemQuery     = document.getElementById("searchCheckoutItem").value.trim().toLowerCase();
  const warehouseQuery= document.getElementById("searchCheckoutWarehouse").value.trim().toLowerCase();
  const dateQuery     = document.getElementById("searchCheckoutDate").value.trim().toLowerCase();
  const byQuery       = document.getElementById("searchCheckoutBy").value.trim().toLowerCase();

  const rows = document.querySelectorAll("#checkoutTableBody tr");

rows.forEach(row => {
  const cells = row.querySelectorAll("td");
  if (cells.length < 6) return;

  const checkoutId   = cells[0].innerText.toLowerCase();
  const item         = cells[1].innerText.toLowerCase();
  const warehouse    = cells[3].innerText.toLowerCase();
  const checkoutDate = cells[4].innerText.toLowerCase();
  const checkedOutBy = cells[5].innerText.toLowerCase();   // FIXED

  const matches =
    (globalQuery   === "" || checkoutId.includes(globalQuery) || item.includes(globalQuery) || warehouse.includes(globalQuery) || checkedOutBy.includes(globalQuery)) &&
    (idQuery       === "" || checkoutId.includes(idQuery)) &&
    (itemQuery     === "" || item.includes(itemQuery)) &&
    (warehouseQuery=== "" || warehouse.includes(warehouseQuery)) &&
    (dateQuery     === "" || checkoutDate.includes(dateQuery)) &&
    (byQuery       === "" || checkedOutBy.includes(byQuery));

  row.style.display = matches ? "" : "none";
});

}


// ============================== SORTING CHECKOUTS SECTION ==============================

let checkoutSortDirection = {};
function sortCheckouts(colIndex) {
  const tbody = document.getElementById("checkoutTableBody");
  const rows = Array.from(tbody.querySelectorAll("tr"));

  checkoutSortDirection[colIndex] = !checkoutSortDirection[colIndex];
  const asc = checkoutSortDirection[colIndex];

  const sorted = rows.sort((rowA, rowB) => {
    const a = rowA.children[colIndex].innerText.trim();
    const b = rowB.children[colIndex].innerText.trim();

    // Checkout ID (numeric)
    if (colIndex === 0) {
      const numA = parseInt(a, 10);
      const numB = parseInt(b, 10);
      return asc ? numA - numB : numB - numA;
    }

    // Checkout Date (MM/DD/YYYY)
    if (colIndex === 4) {
      const [mA, dA, yA] = a.split("/");
      const [mB, dB, yB] = b.split("/");
      const dateA = new Date(yA, mA - 1, dA);
      const dateB = new Date(yB, mB - 1, dB);
      return asc ? dateA - dateB : dateB - dateA;
    }

    // Default: text (Item Checked Out, Checked Out By)
    const aa = a.toLowerCase();
    const bb = b.toLowerCase();
    return asc ? aa.localeCompare(bb) : bb.localeCompare(aa);
  });

  sorted.forEach(row => tbody.appendChild(row));
}

// ============================== SEARCH FILTERING WAREHOUSES SECTION ==============================
// global search
document.getElementById("searchInputWarehouses")
  .addEventListener("input", applyWarehouseFilters);

// column searches
document.getElementById("searchWarehouseName")
  .addEventListener("input", applyWarehouseFilters);
document.getElementById("searchWarehouseLocation")
  .addEventListener("input", applyWarehouseFilters);
document.getElementById("searchWarehouseTotalSupply")
  .addEventListener("input", applyWarehouseFilters);
document.getElementById("searchWarehouseCapacity")
  .addEventListener("input", applyWarehouseFilters);

function applyWarehouseFilters() {

  const globalQuery    = document.getElementById("searchInputWarehouses").value.trim().toLowerCase();
  const nameQuery      = document.getElementById("searchWarehouseName").value.trim().toLowerCase();
  const locationQuery  = document.getElementById("searchWarehouseLocation").value.trim().toLowerCase();
  const supplyQuery    = document.getElementById("searchWarehouseTotalSupply").value.trim().toLowerCase();
  const capacityQuery  = document.getElementById("searchWarehouseCapacity").value.trim().toLowerCase();

  const rows = document.querySelectorAll("#warehouseTableBody tr");

  rows.forEach(row => {
    const cells = row.querySelectorAll("td");
    if (cells.length < 4) return;

    const warehouseName = cells[0].innerText.toLowerCase();
    const location      = cells[1].innerText.toLowerCase();
    const totalSupply   = cells[2].innerText.toLowerCase();
    const capacity      = cells[3].innerText.toLowerCase();

    const matches =
      (globalQuery === "" ||
        warehouseName.includes(globalQuery) ||
        location.includes(globalQuery) ||
        totalSupply.includes(globalQuery) ||
        capacity.includes(globalQuery)
      ) &&
      (nameQuery     === "" || warehouseName.includes(nameQuery)) &&
      (locationQuery === "" || location.includes(locationQuery)) &&
      (supplyQuery   === "" || totalSupply.includes(supplyQuery)) &&
      (capacityQuery === "" || capacity.includes(capacityQuery));

    row.style.display = matches ? "" : "none";
  });
}

// ============================== SORTING WAREHOUSES SECTION ==============================

let warehouseSortDirection = {};
function sortWarehouses(colIndex) {
  const tbody = document.getElementById("warehouseTableBody");
  const rows = Array.from(tbody.querySelectorAll("tr"));

  // toggle asc/desc
  warehouseSortDirection[colIndex] = !warehouseSortDirection[colIndex];
  const asc = warehouseSortDirection[colIndex];

  const sorted = rows.sort((rowA, rowB) => {
    const a = rowA.children[colIndex].innerText.trim();
    const b = rowB.children[colIndex].innerText.trim();

    // Total Stock and Capacity (numeric)
    if (colIndex === 2 || colIndex === 3) {
      // Remove commas before parsing
      const numA = parseInt(a.replace(/,/g, ""), 10);
      const numB = parseInt(b.replace(/,/g, ""), 10);
      return asc ? numA - numB : numB - numA;
    }
    // Default: text (Warehouse Name, Location)
    const aa = a.toLowerCase();
    const bb = b.toLowerCase();
    return asc ? aa.localeCompare(bb) : bb.localeCompare(aa);
  });

  sorted.forEach(row => tbody.appendChild(row));
}

// ============================== SEARCH FILTERING PRODUCTS SECTION ==============================
// global search
document.getElementById("searchInputProducts")
  .addEventListener("input", applyProductsFilters);

// column searches
document.getElementById("searchProductSKU")
  .addEventListener("input", applyProductsFilters);
document.getElementById("searchProductName")
  .addEventListener("input", applyProductsFilters);
document.getElementById("searchProductCategory")
  .addEventListener("input", applyProductsFilters);
document.getElementById("searchProductSupplier")
  .addEventListener("input", applyProductsFilters);


function applyProductsFilters() {
  const globalQuery   = document.getElementById("searchInputProducts").value.trim().toLowerCase();
  const idQuery       = document.getElementById("searchProductSKU").value.trim().toLowerCase();
  const itemQuery     = document.getElementById("searchProductName").value.trim().toLowerCase();
  const warehouseQuery= document.getElementById("searchProductCategory").value.trim().toLowerCase();
  const dateQuery     = document.getElementById("searchProductSupplier").value.trim().toLowerCase();

  const rows = document.querySelectorAll("#productsTableBody tr");

rows.forEach(row => {
  const cells = row.querySelectorAll("td");
  if (cells.length < 5) return;

  // Columns:
  // 0 → SKU
  // 1 → Item name
  // 2 → Quantity (ignored)
  // 3 → Category
  // 4 → Supplier

  const productSKU      = cells[0].innerText.toLowerCase();
  const productName     = cells[1].innerText.toLowerCase();
  const productCategory = cells[3].innerText.toLowerCase();
  const productSupplier = cells[4].innerText.toLowerCase();

  const matches =
    // global
    (globalQuery === "" ||
      productSKU.includes(globalQuery) ||
      productName.includes(globalQuery) ||
      productCategory.includes(globalQuery) ||
      productSupplier.includes(globalQuery)) &&
    // column filters
    (idQuery === "" || productSKU.includes(idQuery)) &&
    (itemQuery === "" || productName.includes(itemQuery)) &&
    (warehouseQuery === "" || productCategory.includes(warehouseQuery)) &&
    (dateQuery === "" || productSupplier.includes(dateQuery));

  row.style.display = matches ? "" : "none";
});
}

// ============================== SORTING PRODUCTS SECTION ==============================

let productSortDirection = {};
function sortProducts(colIndex) {
  const tbody = document.getElementById("productsTableBody");
  const rows = Array.from(tbody.querySelectorAll("tr"));

  // toggle asc/desc
  productSortDirection[colIndex] = !productSortDirection[colIndex];
  const asc = productSortDirection[colIndex];

  const sorted = rows.sort((rowA, rowB) => {
    const a = rowA.children[colIndex].innerText.trim();
    const b = rowB.children[colIndex].innerText.trim();

    // Total Stock and Capacity (numeric)
    if (colIndex === 0 || colIndex === 5) {
      // Remove commas before parsing
      const numA = parseInt(a.replace(/,/g, ""), 10);
      const numB = parseInt(b.replace(/,/g, ""), 10);
      return asc ? numA - numB : numB - numA;
    }
    // Price column. we need to ignore the $ sign
    if(colIndex === 2){
      const priceA = parseFloat(a.replace(/[^0-9.]/g, ""));
      const priceB = parseFloat(b.replace(/[^0-9.]/g, ""));
      return asc ? priceA - priceB : priceB - priceA;
    }

    // Default: text
    const aa = a.toLowerCase();
    const bb = b.toLowerCase();
    return asc ? aa.localeCompare(bb) : bb.localeCompare(aa);
  });

  sorted.forEach(row => tbody.appendChild(row));
}

// ============================== FILTERING SUPPLIERS SECTION ==============================
// global search
document.getElementById("searchInputSuppliers")
  .addEventListener("input", applySupplierFilters);

// column searches
document.getElementById("searchSupplierName")
  .addEventListener("input", applySupplierFilters);
document.getElementById("searchSupplierEmail")
  .addEventListener("input", applySupplierFilters);
document.getElementById("searchSupplierPhone")
  .addEventListener("input", applySupplierFilters);
document.getElementById("searchSupplierAddress")
  .addEventListener("input", applySupplierFilters);


function applySupplierFilters() {

  const globalQuery    = document.getElementById("searchInputSuppliers").value.trim().toLowerCase();
  const idQuery        = document.getElementById("searchSupplierName").value.trim().toLowerCase();
  const itemQuery      = document.getElementById("searchSupplierEmail").value.trim().toLowerCase();
  const warehouseQuery = document.getElementById("searchSupplierPhone").value.trim().toLowerCase();
  const dateQuery      = document.getElementById("searchSupplierAddress").value.trim().toLowerCase();

  const rows = document.querySelectorAll("#suppliersTableBody tr");

  rows.forEach(row => {
    const cells = row.querySelectorAll("td");
    if (cells.length < 4) return;

    const supplierName     = cells[0].innerText.toLowerCase();
    const supplierEmail    = cells[1].innerText.toLowerCase();
    const supplierPhone    = cells[2].innerText.toLowerCase();
    const supplierAddress  = cells[3].innerText.toLowerCase();

    const matches =
      // global
      (globalQuery === "" ||
        supplierName.includes(globalQuery) ||
        supplierEmail.includes(globalQuery) ||
        supplierPhone.includes(globalQuery) ||
        supplierAddress.includes(globalQuery)) &&

      // column filters
      (idQuery        === "" || supplierName.includes(idQuery)) &&
      (itemQuery      === "" || supplierEmail.includes(itemQuery)) &&
      (warehouseQuery === "" || supplierPhone.includes(warehouseQuery)) &&
      (dateQuery      === "" || supplierAddress.includes(dateQuery));

    row.style.display = matches ? "" : "none";
  });
}

// ============================== SORTING SUPPLIERS SECTION ==============================

let supplierSortDirection = {};
function sortSuppliers(colIndex) {
  const tbody = document.getElementById("suppliersTableBody");
  const rows = Array.from(tbody.querySelectorAll("tr"));

  // toggle asc/desc
  supplierSortDirection[colIndex] = !supplierSortDirection[colIndex];
  const asc = supplierSortDirection[colIndex];

  const sorted = rows.sort((rowA, rowB) => {
    const a = rowA.children[colIndex].innerText.trim().toLowerCase();
    const b = rowB.children[colIndex].innerText.trim().toLowerCase();

    return asc ? a.localeCompare(b) : b.localeCompare(a);
  });

  sorted.forEach(row => tbody.appendChild(row));
}

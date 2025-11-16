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
        <td>${w.totalSupply}</td>
        <td>${w.capacity || "N/A"}</td>
        <td><button class="btn" style="padding:6px 12px;" onclick="openEditWarehouseModal(${w.warehouseId}, '${w.name}', '${w.location}', ${w.capacity})">Edit</button>
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

// ============================== CREATE PRODUCT SECTION ==============================
function openCreateProductModal() {
  document.getElementById("createProductModal").style.display = "flex";
  loadSupplierNames(null, "createProductSupplierSelect");
}
function closeCreateProductModal() {
  document.getElementById("createProductModal").style.display = "none";
}

async function submitNewProduct() {
  const name = document.getElementById("productNameInput").value.trim();
  const category = document.getElementById("productCategoryInput").value.trim();
  const price = parseFloat(document.getElementById("productPriceInput").value);
  const supplierId = document.getElementById("createProductSupplierSelect").value || null;
  if (!name || !category || !price) {
    showToast("Please fill out all fields.");
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
    if (response.ok) {
      showToast("Product created successfully!");
      closeCreateProductModal();
      loadProducts();
    } else {
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
    
    if (!updatedName || !updatedCategory || isNaN(updatedPrice)) {
      showToast("Please fill out all fields.");
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
      loadTotalInventoryQuantity();
    } else {
      showToast("Failed to delete product.", 3000);
    }
  } catch (err) {
    console.error("Error deleting product:", err);
    showToast("Error deleting product.", 3000);
  }
}

// ============================== LOAD TOTAL INVENTORY QUANTITY ==============================
async function loadTotalInventoryQuantity() {
    try {
      const response = await fetch(`/inventory`);
      const inventoryItems = await response.json();
      let totalQuantity = 0;
      inventoryItems.forEach(item => {
        totalQuantity += item.quantity || 0;
      });
      document.getElementById("totalInventoryQuantity").innerHTML = `
      <span class="card-value">
      <h3>Overall supply inventory</h3>
      ${totalQuantity}</span>`;
    
    } catch (err) {
      console.error("Error loading total inventory quantity:", err);
    }
}

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
    showToast("Please fill out all fields.");
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
loadTotalInventoryQuantity();

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
      loadWarehouses();
    } else if(tab.textContent.includes("Restock Orders")) {
      warehouseSection.style.display = "none";
      restockSection.style.display = "block";
      checkoutSection.style.display = "none";
      productsSection.style.display = "none";
      loadRestockOrders();
    }
    else if(tab.textContent.includes("Checkouts")) {
      warehouseSection.style.display = "none";
      restockSection.style.display = "none";
      checkoutSection.style.display = "block";
      productsSection.style.display = "none";
      loadCheckouts();
    }
    else if(tab.textContent.includes("Products")) {
      warehouseSection.style.display = "none";
      restockSection.style.display = "none";
      checkoutSection.style.display = "none";
      productsSection.style.display = "block";
      loadProducts();
    }
  });
});

// ============================== OPEN RESTOCK MODAL ==============================
async function openRestockModal() {
  const modal = document.getElementById("restockModal");
  const modalContent = document.getElementById("restockModalContent");
  modal.style.display = "flex";

  try {
    const res = await fetch("/warehouses");
    const warehouses = await res.json();

    modalContent.innerHTML = `
      <button id="closeModalBtn" class="close-btn" aria-label="Close">&times;</button>
      <h2>Select Warehouses</h2>
      <div style="margin-top:15px; overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; color:#ddd; font-size:0.9rem;">
          <thead>
            <tr style="background-color:#2a2a2a;">
              <th style="padding:8px 10px; text-align:left;">Select</th>
              <th style="padding:8px 10px; text-align:left;">Warehouse Name</th>
              <th style="padding:8px 10px; text-align:left;">Location</th>
              <th style="padding:8px 10px; text-align:right;">Total Stock</th>
              <th style="padding:8px 10px; text-align:right;">Capacity</th>
            </tr>
          </thead>
          <tbody id="warehouseList">
            ${warehouses.map(w => `
              <tr style="border-bottom:1px solid #333;">
                <td style="padding:8px 10px;"><input type="checkbox" name="warehouse" value="${w.warehouseId}"></td>
                <td style="padding:8px 10px;">${w.name || "N/A"}</td>
                <td style="padding:8px 10px;">${w.location}</td>
                <td style="padding:8px 10px; text-align:right;">${w.totalSupply}</td>
                <td style="padding:8px 10px; text-align:right;">${w.capacity}</td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
      <div style="text-align:right;margin-top:20px;">
        <button id="nextStepBtn" class="btn" disabled>Next →</button>
      </div>
    `;

    document.getElementById("closeModalBtn").addEventListener("click", () => {
      document.getElementById("restockModal").style.display = "none";
    });

    const list = document.getElementById("warehouseList");
    const nextBtn = document.getElementById("nextStepBtn");

    list.querySelectorAll("input[type='checkbox']").forEach(cb => {
      cb.addEventListener("change", () => {
        const anySelected = Array.from(list.querySelectorAll("input:checked")).length > 0;
        nextBtn.disabled = !anySelected;
      });
    });

    nextBtn.addEventListener("click", () => loadProductSelection());
  } catch (err) {
    console.error("Error loading warehouses:", err);
    modalContent.innerHTML = `<p style="color:red;">Error loading warehouses.</p>`;
  }
}

// ============================== STEP 2: SELECT PRODUCT ==============================
async function loadProductSelection() {
  const modalContent = document.getElementById("restockModalContent");
  const selectedWarehouses = Array.from(document.querySelectorAll("input[name='warehouse']:checked"))
    .map(cb => cb.value);

  try {
    const products = await (await fetch("/products")).json();

    modalContent.innerHTML = `
      <button id="backBtn" class="btn" style="background-color:#555;">← Back</button>
      <h2 style="display:inline-block; margin-left:10px;">Select Product</h2>
      <button class="close-btn" onclick="closeRestockModal()" aria-label="Close">&times;</button>
      <select id="productSelect" style="margin-top:10px;width:100%;padding:8px;">
        <option value="">-- Choose A Product --</option>
        ${products.map(p => `<option value="${p.productId}">${p.productName}</option>`).join("")}
      </select>

      <div id="productDetails" style="margin-top:15px;color:#ddd;font-size:0.9rem;"></div>

      <div style="text-align:right;margin-top:20px;">
        <button id="submitRestockBtn" class="btn" disabled>Submit</button>
      </div>
    `;

    document.getElementById("backBtn").addEventListener("click", openRestockModal);

    const productSelect = document.getElementById("productSelect");
    const detailsDiv = document.getElementById("productDetails");
    const submitBtn = document.getElementById("submitRestockBtn");

    productSelect.addEventListener("change", async (e) => {
      const productId = e.target.value;
      detailsDiv.innerHTML = "";
      submitBtn.disabled = true;
      if (!productId) return;

      try {
        const res = await fetch(`/products/${productId}`);
        const product = await res.json();

        const supplier = product.supplier
          ? `${product.supplier.name} (${product.supplier.contactEmail || "No email"})`
          : "Unknown Supplier";

        detailsDiv.innerHTML = `
          <table style="width:100%; margin-top:15px; border-collapse:collapse; color:#ddd; font-size:0.9rem;">
          <tbody>

            <tr style="border-bottom:1px solid #333;">
              <td style="padding:8px 6px; width:140px; font-weight:600;">Category</td>
              <td style="padding:8px 6px;">${product.category || "N/A"}</td>
            </tr>

            <tr style="border-bottom:1px solid #333;">
              <td style="padding:8px 6px; font-weight:600;">Price per Unit</td>
              <td style="padding:8px 6px;">$${(+product.price).toFixed(2)}</td>
            </tr>

            <tr style="border-bottom:1px solid #333;">
              <td style="padding:8px 6px; font-weight:600;">Supplier</td>
              <td style="padding:8px 6px;">${supplier}</td>
            </tr>

            <tr style="border-bottom:1px solid #333;">
              <td style="padding:8px 6px; font-weight:600;">Amount to Restock</td>
              <td style="padding:8px 6px;">
                <input type="number" id="restockAmount" min="1"
                  style="width:120px;padding:6px;background:#2a2a2a;color:#fff;border:1px solid #444;border-radius:4px;">
              </td>
            </tr>

            <tr>
              <td style="padding:8px 6px; font-weight:600;">Total Cost</td>
              <td style="padding:8px 6px;">
                $<span id="totalCost">0.00</span>
              </td>
            </tr>

          </tbody>
        </table>

        `;

        const price = +product.price;
        const amountInput = document.getElementById("restockAmount");
        const totalCost = document.getElementById("totalCost");

        amountInput.addEventListener("input", () => {
          const amount = parseInt(amountInput.value || 0, 10);
          totalCost.textContent = (price * amount).toFixed(2);
          submitBtn.disabled = amount <= 0;
        });

        submitBtn.onclick = async () => {
          const amount = parseInt(amountInput.value, 10);
          if (isNaN(amount) || amount <= 0) return showToast("Please enter a valid amount.");

          try {
            for (const wId of selectedWarehouses) {
              await fetch("/restocks/create_restock", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  warehouseId: wId,
                  productId: productId,
                  amount: amount,
                  orderedBy: currentUserEmail
                })
              });
            }
            showToast("Restock order(s) created successfully!");
            loadTotalInventoryQuantity();
            closeRestockModal();
            loadRestockOrders();
          } catch (postErr) {
            console.error("Error creating restock:", postErr);
            showToast("Error creating restock order.", 3000);
          }
        };
      } catch (err) {
        console.error("Error loading product:", err);
        detailsDiv.innerHTML = `<p style="color:red;">Error loading product details.</p>`;
      }
    });
  } catch (errOuter) {
    console.error("Error loading products:", errOuter);
    modalContent.innerHTML = `<p style="color:red;">Error loading products.</p>`;
  }
}

// ============================== CLOSE MODAL ==============================
function closeRestockModal(event) {
  if (event && event.target && event.target.id !== "restockModal") {
    return;
  }
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
    showToast("Please fill out all fields.");
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
function closeWarehouseInventoryModal(event) {
    if (event && event.target && event.target.id !== "WarehouseInventoryModal") {
        return;
    }
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
      const cleanedProductName = i.product.productName.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      row.innerHTML = `
        <td>${i.product.productName}</td>
        <td>${i.quantity}</td>
        <td>$${i.product.price}</td>
        <td>${i.product.category || "N/A"}</td>
        <td>${i.product.supplier ? i.product.supplier.name + " (" + i.product.supplier.contactEmail + ")" : "Unknown Supplier"}</td>
        <td>${i.minimumStock}</td>
        <td><button class="btn" style="padding:6px 12px;" onclick="openTransferInventoryModal(${i.inventoryId}, '${cleanedProductName}')">Transfer</button></td>
        <td><button class="btn" style="background-color: Red; padding:6px 12px;" onclick="openDeleteInventoryItemModal(${i.inventoryId})">Delete</button></td>
      `;
      body.appendChild(row);
    });
  } catch (err) {
    console.error("Error loading inventory:", err);
    document.getElementById("warehouseInventoryTableBody").innerHTML =
      `<tr><td colspan="6" style="text-align:center;color:red;">Error loading data</td></tr>`;
  }
}


// ============================== TRANSFER INVENTORY SECTION ==============================
async function openTransferInventoryModal(inventoryId, productName) {
    inventoryToTransfer = inventoryId; // store for confirm step
    document.getElementById("transferInventoryModal").style.display = "flex";
    document.getElementById("transferInventoryTitle").textContent =
    `Transfer Item: ${productName}`;
    // Load all warehouses for the dropdown
    const wRes = await fetch("/warehouses");
    const warehouses = await wRes.json();

    // Populate dropdown
    const select = document.getElementById("transferToWarehouseSelect");
    select.innerHTML = `
        <option value="">-- Choose A Warehouse --</option>
        ${warehouses.map(w => `<option value="${w.warehouseId}">${w.name}</option>`).join("")}
    `;
}


function closeTransferInventoryModal(event) {
    if (event && event.target && event.target.id !== "transferInventoryModal") {
        return;
    }
    document.getElementById("transferInventoryModal").style.display = "none";
    document.getElementById("WarehouseInventoryModal").style.display = "none";
}

async function confirmTransferInventory() {

    const amount = Number(document.getElementById("transferAmountInput").value);
    const newWarehouseId = document.getElementById("transferToWarehouseSelect").value;

    if (!amount || amount <= 0) {
        showToast("Please enter a valid amount to transfer.");
        return;
    }

    if (!newWarehouseId) {
        showToast("Select a warehouse to transfer to.");
        return;
    }

    try {
        await fetch(`/inventory/transfer/${inventoryToTransfer}/${newWarehouseId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: amount })
        });
        closeTransferInventoryModal();
        loadLowStockCount();
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
        loadTotalInventoryQuantity();
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
function closeDeleteInventoryItemModal(event) {
    if (event && event.target && event.target.id !== "deleteInventoryItemModal") {
        return;
    }
    document.getElementById("deleteInventoryItemModal").style.display = "none";
}


// ============================== SUBMIT DELETE WAREHOUSES ==============================
document.getElementById("submitDeleteWarehouseBtn").addEventListener("click", () => {
    const selected = document.querySelectorAll("input[name='deleteWarehouse']:checked");

    if (selected.length === 0) {
        showToast("Please select at least one warehouse to delete.");
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
        loadTotalInventoryQuantity();
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
function closeDeleteWarehouseModal(event) {
    if (event && event.target && event.target.id !== "deleteWarehouseModal") {
        return;
    }
    document.getElementById("deleteWarehouseModal").style.display = "none";
}

// ============================== CHECKOUT MODAL SECTION ==============================
async function openCheckoutModal() {
  const modal = document.getElementById("checkoutModal");
  const modalContent = document.getElementById("checkoutModalContent");
  modal.style.display = "flex";

        const res = await fetch("/products");
        const products = await res.json();
        const wRes = await fetch("/warehouses");
        const warehouses = await wRes.json();

        modalContent.innerHTML = `
          <button id="closeCheckoutModalBtn" class="close-btn" aria-label="Close">&times;</button>
          
          <h2>Select Warehouse</h2>
          <select id="checkoutWarehouseSelect" style="margin-top:10px;width:100%;padding:8px;">
              <option value="">-- Choose a warehouse --</option>
              ${warehouses.map(w => `<option value="${w.warehouseId}">${w.name}</option>`).join("")}
          </select>

          <h2 style="margin-top:20px;">Select Product to Checkout</h2>
          <select id="checkoutProductSelect" style="margin-top:10px;width:100%;padding:8px;">
              <option value="">-- Choose a product --</option>
              ${products.map(p => `<option value="${p.productId}">${p.productName}</option>`).join("")}
          </select>

          <div id="checkoutProductDetails" style="margin-top:15px;color:#ddd;font-size:0.9rem;"></div>

          <div style="text-align:right;margin-top:20px;">
              <button id="submitCheckoutBtn" class="btn" disabled onClick="checkoutItem(${p.productId})">Submit Checkout</button>
          </div>
          `;

          
        document.getElementById("closeCheckoutModalBtn").addEventListener("click", () => {
            document.getElementById("checkoutModal").style.display = "none";
        });
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
    <select id="checkoutWarehouseSelect" style="margin-top:10px;width:100%;padding:8px;">
      <option value="">-- Choose a warehouse --</option>
      ${warehouses.map(w => `<option value="${w.warehouseId}">${w.name}</option>`).join("")}
    </select>

    <h2 style="margin-top:20px;">Select Product</h2>
    <select id="checkoutProductSelect" style="margin-top:10px;width:100%;padding:8px;">
      <option value="">-- Choose a product --</option>
      ${products.map(p => `<option value="${p.productId}">${p.productName}</option>`).join("")}
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

    submitBtn.disabled = !(warehouseId && productId && amount > 0);
  }

  warehouseSelect.addEventListener("change", updateSubmitState);
  amountInput.addEventListener("input", updateSubmitState);

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
function closeCheckoutModal(event) {
  if (event && event.target && event.target.id !== "checkoutModal") {
    return;
  }
  document.getElementById("checkoutModal").style.display = "none";
}

// submit checkout function
async function submitCheckout() {
  const warehouseId = document.getElementById("checkoutWarehouseSelect").value;
  const productId = document.getElementById("checkoutProductSelect").value;
  const amount = parseInt(document.getElementById("checkoutAmount").value, 10);
  const email = currentUserEmail;

  try {
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
      loadTotalInventoryQuantity();
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
    } else {
      showToast("Failed to update inventory.");
    }

  } catch (err) {
    console.error("Error updating inventory:", err);
    showToast("Error updating inventory.", 3000);
  }
}



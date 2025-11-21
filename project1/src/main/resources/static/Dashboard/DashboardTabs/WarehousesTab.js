// ============================== LOAD WAREHOUSES ==============================

/**
 * Loads all warehouses from the server, updates the warehouse table,
 * highlights warehouses near capacity, and updates the dashboard count.
 * @async
 * @returns {Promise<void>}
 */
async function loadWarehouses() {
  try {
    const response = await fetch("/warehouses", {credentials: "include"});
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

      document.getElementById("warehousesNearCapacityCount").innerHTML = `
      <h3>Warehouses Near Capacity ⚠️</h3>
      <span class="card-value">${warehousesNearCapacity}</span>`;

      body.appendChild(row);
    });

  } catch (err) {
    console.error("Error loading warehouses:", err);
    document.getElementById("warehouseTableBody").innerHTML =
      `<tr><td colspan="4" style="text-align:center;color:red;">Error loading data</td></tr>`;
  }
}

/**
 * Determines whether a warehouse is near capacity.
 * @param {number} totalSupply - Current supply stored.
 * @param {number} capacity - Maximum warehouse capacity.
 * @returns {boolean} True if warehouse is at or above 90% capacity.
 */
function loadWarehousesNearCapacity(totalSupply, capacity){
  const warningThreshold = 0.9;
  return totalSupply / capacity >= warningThreshold;
}

// ============================== EDIT WAREHOUSE SECTION ==============================

let editingWarehouseId = null;

/**
 * Opens the edit warehouse modal and pre-fills its fields.
 * @param {number} id
 * @param {string} name
 * @param {string} location
 * @param {number} capacity
 * @returns {void}
 */
function openEditWarehouseModal(id, name, location, capacity) {
  editingWarehouseId = id;

  document.getElementById("editWarehouseName").value = name;
  document.getElementById("editWarehouseLocation").value = location;
  document.getElementById("editWarehouseCapacity").value = capacity;

  document.getElementById("editWarehouseModal").style.display = "flex";
}

/**
 * Closes the edit warehouse modal and resets the form.
 * @returns {void}
 */
function closeEditWarehouseModal() {
  document.getElementById("editWarehouseModal").style.display = "none";
  document.getElementById("editWarehouseForm").reset();
}

/**
 * Submits the warehouse edits to the server.
 * @async
 * @returns {Promise<void>}
 */
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
      credentials: "include",
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



// ============================== DELETE WAREHOUSES SECTION ==============================

/**
 * Opens the delete warehouse modal.
 * @returns {void}
 */
function openDeleteWarehouseModal() {
  document.getElementById("deleteWarehouseModal").style.display = "flex";
  loadDeleteWarehouseList();
}

/**
 * Closes the delete warehouse modal.
 * @returns {void}
 */
function closeDeleteWarehouseModal() {
  document.getElementById("deleteWarehouseModal").style.display = "none";
}

/**
 * Loads the list of warehouses into the delete modal with checkboxes.
 * @async
 * @returns {Promise<void>}
 */
async function loadDeleteWarehouseList() {
  const list = document.getElementById("deleteWarehouseList");
  list.innerHTML = "Loading...";

  try {
    const response = await fetch("/warehouses", {credentials: "include"});
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
                <input type="checkbox" name="deleteWarehouse" value="${w.warehouseId}">
              </td>
              <td style="padding:8px;">${w.name}</td>
              <td style="padding:8px;">${w.location}</td>
              <td style="padding:8px;">${w.totalSupply ?? "0"}</td>
              <td style="padding:8px;">${w.capacity ?? "N/A"}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;

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



// ============================== DELETE CONFIRMATION ==============================

/**
 * Confirms selection of warehouses to delete and opens the confirmation box.
 * @returns {void}
 */
document.getElementById("submitDeleteWarehouseBtn").addEventListener("click", () => {
  const selected = document.querySelectorAll("input[name='deleteWarehouse']:checked");

  if (selected.length === 0) {
    showToast("Please select at least one warehouse to delete. ⚠️");
    return;
  }

  document.getElementById("confirmOverlay").style.display = "block";
  document.getElementById("confirmDeleteBox").style.display = "block";
});

/**
 * Cancels deletion confirmation modal.
 * @returns {void}
 */
document.getElementById("confirmNoBtn").addEventListener("click", () => {
  document.getElementById("confirmOverlay").style.display = "none";
  document.getElementById("confirmDeleteBox").style.display = "none";
});

/**
 * Deletes selected warehouses from the server.
 * @async
 * @returns {Promise<void>}
 */
document.getElementById("confirmYesBtn").addEventListener("click", async () => {
  const selectedWarehouses = Array.from(
    document.querySelectorAll("input[name='deleteWarehouse']:checked")
  ).map(cb => cb.value);

  try {
    for (const wId of selectedWarehouses) {
      await fetch(`/warehouses/delete_warehouse/${wId}`, { method: "DELETE", credentials: "include" });
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



// ============================== CREATE WAREHOUSE ==============================

/**
 * Opens the create warehouse modal.
 * @returns {void}
 */
function openCreateWarehouseModal() {
  document.getElementById("createWarehouseModal").style.display = "flex";
}

document.getElementById("closeWarehouseModalBtn").addEventListener("click", () => {
  document.getElementById("createWarehouseForm").reset();
  document.getElementById("createWarehouseModal").style.display = "none";
});

document.getElementById("createWarehouseModal").addEventListener("click", (e) => {
  if (e.target.id === "createWarehouseModal") {
    document.getElementById("createWarehouseModal").style.display = "none";
  }
});

/**
 * Handles submission of new warehouse creation.
 * @async
 * @returns {Promise<void>}
 */
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
      credentials: "include",
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



// ============================== WAREHOUSE INVENTORY MODAL ==============================

/**
 * Opens the warehouse inventory modal.
 * @param {number} warehouseId
 * @param {string} warehouseName
 * @returns {void}
 */
function openWarehouseInventoryModal(warehouseId, warehouseName) {
  document.getElementById("WarehouseInventoryModal").style.display = "flex";
  loadInventoryForWarehouse(warehouseId, warehouseName);
}

/**
 * Closes the warehouse inventory modal.
 * @returns {void}
 */
function closeWarehouseInventoryModal() {
  document.getElementById("WarehouseInventoryModal").style.display = "none";
}

/**
 * Loads inventory items belonging to the warehouse and populates the inventory modal table.
 * Highlights items below minimum stock.
 * @async
 * @param {number} warehouseId
 * @param {string} warehouseName
 * @returns {Promise<void>}
 */
async function loadInventoryForWarehouse(warehouseId, warehouseName) {
  try {
    document.getElementById("warehouseInventoryTitle").textContent =
      `${warehouseName} Inventory`;

    const response = await fetch(`/inventory/warehouse/${warehouseId}`, {credentials: "include"});
    const inventory = await response.json();
    const body = document.getElementById("warehouseInventoryTableBody");
    body.innerHTML = "";

    if (!inventory.length) {
      body.innerHTML = `<tr><td colspan="6" style="text-align:center;">No inventory found.</td></tr>`;
      return;
    }

    inventory.forEach(i => {
      const row = document.createElement("tr");
      row.setAttribute(
        "onclick",
        `openEditInventoryLocationModal('${i.product.productName}', ${i.inventoryId}, ${warehouseId}, '${warehouseName}', '${i.warehouseLocation || ""}', ${i.minimumStock})`
      );
      row.classList.add("clickable-row");

      const cleanedProductName = i.product.productName
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

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
        <td style="min-width: 100px;">Section ${i.warehouseLocation || "0"}</td>
        <td>${i.minimumStock}</td>
        <td><button class="btn" onclick="event.stopPropagation(); openTransferInventoryModal(${i.inventoryId}, ${warehouseId}, ${i.product.productId}, '${cleanedProductName}', ${i.minimumStock})">Transfer</button></td>
        <td><button class="btn" style="background-color: Red; padding:6px 12px;" onclick="event.stopPropagation(); openDeleteInventoryItemModal(${i.inventoryId})">Delete</button></td>
      `;
      body.appendChild(row);
    });
  } catch (err) {
    console.error("Error loading inventory:", err);
    document.getElementById("warehouseInventoryTableBody").innerHTML =
      `<tr><td colspan="6" style="text-align:center;color:red;">Error loading data</td></tr>`;
  }
}



// ============================== EDIT INVENTORY LOCATION AND MIN STOCK ==============================

let editingInventoryId = null;
let currentWarehouseId = null;
let currentWarehouseName = null;

/**
 * Opens the edit modal for updating inventory shelf location and minimum stock.
 * @param {string} productName
 * @param {number} inventoryId
 * @param {number} warehouseId
 * @param {string} warehouseName
 * @param {string|number} warehouseLocation
 * @param {number} minStock
 * @returns {void}
 */
function openEditInventoryLocationModal(productName, inventoryId, warehouseId, warehouseName, warehouseLocation, minStock) {
  editingInventoryId = inventoryId;
  currentWarehouseId = warehouseId;
  currentWarehouseName = warehouseName;

  document.getElementById("editInventoryLocationModal").style.display = "flex";
  document.getElementById("editInventoryLocationInput").value = warehouseLocation || "";
  document.getElementById("editInventoryMinStockInput").value = minStock || 0;
  document.getElementById("editInventoryItemName").textContent = productName;
}

/**
 * Closes the inventory edit modal.
 * @returns {void}
 */
function closeEditInventoryAndMinStockLocationModal() {
  document.getElementById("editInventoryLocationModal").style.display = "none";
}

/**
 * Submits updated location and minimum stock for the selected inventory item.
 * @async
 * @returns {Promise<void>}
 */
document.getElementById("confirmEditInventoryBtn").addEventListener("click", async (event) => {
  event.preventDefault();
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
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        warehouseLocation: Number(newLocation),
        minimumStock: minimumStock
      })
    });

    if (response.ok) {
      showToast("Inventory location and minimum stock updated successfully!");
      closeEditInventoryAndMinStockLocationModal();
      loadLowStockCount();
      loadInventoryForWarehouse(currentWarehouseId, currentWarehouseName);
    } else {
      showToast("Failed to update inventory location.", 3000);
    }
  } catch (err) {
    console.error("Error updating inventory location:", err);
    showToast("Error updating inventory location.", 3000);
  }
});


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


// ============================== TRANSFER INVENTORY SECTION ==============================

let inventoryToTransfer = null;
let fromWarehouseId = null;
let transferProductId = null;

/**
 * Opens the transfer inventory modal and loads warehouse list with current stock info.
 * @async
 * @param {number} inventoryId
 * @param {number} fromWarehouse
 * @param {number} productId
 * @param {string} productName
 * @returns {Promise<void>}
 */
async function openTransferInventoryModal(inventoryId, fromWarehouse, productId, productName) {
  inventoryToTransfer = inventoryId;
  fromWarehouseId = fromWarehouse;
  transferProductId = productId;

  document.getElementById("transferInventoryModal").style.display = "flex";
  document.getElementById("transferInventoryTitle").textContent =
    `Transfer Item: ${productName}`;

  const wRes = await fetch("/warehouses", {credentials: "include"});
  const warehouses = await wRes.json();

  const select = document.getElementById("transferToWarehouseSelect");
  select.innerHTML = `<option value="">-- Choose A Warehouse --</option>`;

  for (const w of warehouses) {
    const invRes = await fetch(`/inventory/warehouse/${w.warehouseId}`, {credentials: "include"});
    const items = await invRes.json();

    const record = items.find(i => i.product.productId === productId);
    const qty = record ? record.quantity : 0;

    select.innerHTML += `
      <option value="${w.warehouseId}">
        ${w.name} — ${qty} In Stock
      </option>
    `;
  }
}

/**
 * Closes the transfer inventory modal.
 * @returns {void}
 */
function closeTransferInventoryModal() {
  document.getElementById("transferInventoryModal").style.display = "none";
  document.getElementById("transferAmountInput").value = "";
}

/**
 * Validates and completes an inventory transfer between warehouses.
 * @async
 * @returns {Promise<void>}
 */
async function confirmTransferInventory() {

  const amount = Number(document.getElementById("transferAmountInput").value);
  const newWarehouseId = document.getElementById("transferToWarehouseSelect").value;

  if (!amount || amount <= 0) {
    showToast("Please enter a valid amount. ⚠️");
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
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: amount })
    });

    closeTransferInventoryModal();
    loadLowStockCount();
    loadWarehouses();
    loadTotalInventoryQuantityAndValue();
    showToast("Inventory transferred successfully!");
    loadInventoryForWarehouse(fromWarehouseId, currentWarehouseName);
  } catch (err) {
    console.error("Error transferring inventory:", err);
    showToast("Error transferring inventory.", 3000);
  }
}



// ============================== DELETE INVENTORY ITEM ==============================

let inventoryIdToDelete = null;

/**
 * Opens the modal to confirm deletion of an inventory item.
 * @param {number} inventoryId
 * @returns {void}
 */
function openDeleteInventoryItemModal(inventoryId) {
  inventoryIdToDelete = inventoryId;
  document.getElementById("deleteInventoryItemModal").style.display = "flex";
  document.getElementById("confirmDeleteInventoryItemBtn").onclick = () => {
    closeDeleteInventoryItemModal();
    confirmDeleteInventoryItem(inventoryIdToDelete);
  };
}

/**
 * Closes the delete inventory item modal.
 * @returns {void}
 */
function closeDeleteInventoryItemModal() {
  document.getElementById("deleteInventoryItemModal").style.display = "none";
}

/**
 * Sends a DELETE request for an inventory item and refreshes warehouse/inventory displays.
 * @async
 * @param {number} inventoryId
 * @returns {Promise<void>}
 */
async function confirmDeleteInventoryItem(inventoryId) {
  try {
    await fetch(`/inventory/delete/${inventoryId}`, {
      method: "DELETE",
      credentials: "include"
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


// ============================== FILTERING WAREHOUSES SECTION ==============================

document.getElementById("searchInputWarehouses")
  .addEventListener("input", applyWarehouseFilters);
document.getElementById("searchWarehouseName")
  .addEventListener("input", applyWarehouseFilters);
document.getElementById("searchWarehouseLocation")
  .addEventListener("input", applyWarehouseFilters);
document.getElementById("searchWarehouseTotalSupply")
  .addEventListener("input", applyWarehouseFilters);
document.getElementById("searchWarehouseCapacity")
  .addEventListener("input", applyWarehouseFilters);
/**
 * Applies filtering to the warehouse table based on global and column search inputs.
 * @returns {void}
 */
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

/**
 * Sorts warehouse table rows by the selected column.
 * Handles text and numeric sorting.
 * @param {number} colIndex - Column index clicked.
 * @returns {void}
 */
function sortWarehouses(colIndex) {
  const tbody = document.getElementById("warehouseTableBody");
  const rows = Array.from(tbody.querySelectorAll("tr"));

  warehouseSortDirection[colIndex] = !warehouseSortDirection[colIndex];
  const asc = warehouseSortDirection[colIndex];

  const sorted = rows.sort((rowA, rowB) => {
    const a = rowA.children[colIndex].innerText.trim();
    const b = rowB.children[colIndex].innerText.trim();

    // numeric: total supply or capacity
    if (colIndex === 2 || colIndex === 3) {
      const numA = parseInt(a.replace(/,/g, ""), 10);
      const numB = parseInt(b.replace(/,/g, ""), 10);
      return asc ? numA - numB : numB - numA;
    }

    const aa = a.toLowerCase();
    const bb = b.toLowerCase();
    return asc ? aa.localeCompare(bb) : bb.localeCompare(aa);
  });

  sorted.forEach(row => tbody.appendChild(row));
}
// ============================== LOAD RESTOCK ORDERS ==============================

/**
 * Loads all restock orders from the server, reverses them so the newest appear first,
 * and populates the restock table. Handles empty states and error states.
 * @async
 * @returns {Promise<void>}
 */
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



// ============================== RESTOCK MODAL ==============================

/**
 * Opens and renders the Restock modal.  
 * Loads warehouses & products, attaches event handlers, handles input validation,
 * and processes the creation of a new restock order.
 * @async
 * @returns {Promise<void>}
 */
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

  /**
   * Enables or disables the submit button depending on valid selections.
   */
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

    // Load ALL products
    const allProducts = await (await fetch(`/products`)).json();

    allProducts.forEach(p => {
      productSelect.innerHTML += `<option value="${p.productId}">${p.productName}</option>`;
    });
  });

  // Product selected → load details
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

  // Submit button — create restock
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

/**
 * Closes the restock modal.
 */
function closeRestockModal() {
  document.getElementById("restockModal").style.display = "none";
}



// ============================== SEARCH FILTERING RESTOCKS SECTION ==============================

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

/**
 * Applies search filters to the restock table based on
 * global filter and individual column filters.
 * @returns {void}
 */
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

/**
 * Sorts restock orders in the table by the selected column.
 * Handles numeric sorting, date sorting, and text sorting.
 * @param {number} colIndex - Index of column clicked.
 * @returns {void}
 */
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

    // Default: text
    const aa = a.toLowerCase();
    const bb = b.toLowerCase();
    return asc ? aa.localeCompare(bb) : bb.localeCompare(aa);
  });

  sorted.forEach(row => tbody.appendChild(row));
}

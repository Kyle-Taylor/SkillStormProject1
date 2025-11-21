// ============================== LOAD CHECKOUTS ==============================

/**
 * Loads all checkout records from the backend and renders them in the table.
 * @async
 * @returns {Promise<void>}
 */
async function loadCheckouts() {
  try {
    const response = await fetch("/checkouts", {credentials: "include"});
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



// ============================== CHECKOUT MODAL SECTION ==============================

/**
 * Opens the checkout modal, loads warehouses & products, and initializes event listeners.
 * Dynamically builds UI inside the modal.
 * @async
 * @returns {Promise<void>}
 */
async function openCheckoutModal() {
  const modal = document.getElementById("checkoutModal");
  const modalContent = document.getElementById("checkoutModalContent");
  modal.style.display = "flex";

  const products = await (await fetch("/products", { credentials: "include" })).json();
  const warehouses = await (await fetch("/warehouses", { credentials: "include" })).json();

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

  const warehouseSelect = document.getElementById("checkoutWarehouseSelect");
  const productSelect = document.getElementById("checkoutProductSelect");
  const amountInput = document.getElementById("checkoutAmount");
  const amountContainer = document.getElementById("amountContainer");
  const detailsDiv = document.getElementById("checkoutProductDetails");
  const submitBtn = document.getElementById("submitCheckoutBtn");

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

    productSelect.innerHTML = `<option value="">-- Choose a product --</option>`;
    detailsDiv.innerHTML = "";
    amountContainer.style.display = "none";
    submitBtn.disabled = true;

    if (!warehouseId) return;

    const inventory = await (await fetch(`/inventory/warehouse/${warehouseId}`, { credentials: "include" })).json();

    inventory.forEach(item => {
      const p = item.product;
      const quantity = item.quantity || 0;
      productSelect.innerHTML += `<option value="${p.productId}">${p.productName} — ${quantity} In Stock</option>`;
    });
  });

  productSelect.addEventListener("change", async (e) => {
    const productId = e.target.value;
    amountContainer.style.display = "none";
    detailsDiv.innerHTML = "";
    submitBtn.disabled = true;

    if (!productId) return;

    const product = await (await fetch(`/products/${productId}`, { credentials: "include" })).json();

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

  submitBtn.addEventListener("click", submitCheckout);
}



// ============================== CLOSE CHECKOUT MODAL ==============================

/**
 * Closes the checkout modal.
 * @returns {void}
 */
function closeCheckoutModal() {
  document.getElementById("checkoutModal").style.display = "none";
}



// ============================== SUBMIT CHECKOUT ==============================

/**
 * Submits a checkout request and updates the UI if successful.
 * @async
 * @returns {Promise<void>}
 */
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
      credentials: "include",
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



/**
 * Reduces inventory quantity after a checkout.
 * Backend updates the record and returns 200 on success.
 * @async
 * @param {number} warehouseId
 * @param {number} productId
 * @param {number} amount
 * @returns {Promise<void>}
 */
async function reduceInventory(warehouseId, productId, amount) {
  try {
    const response = await fetch("/inventory/reduce", {
      method: "PUT",
      credentials: "include",
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



// ============================== SEARCH FILTERING CHECKOUTS SECTION ==============================

/**
 * Event listeners for global + column-based filtering.
 */
document.getElementById("searchInputCheckouts")
  .addEventListener("input", applyCheckoutFilters);
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

/**
 * Filters checkout table rows based on global or column filters.
 * @returns {void}
 */
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
    const checkedOutBy = cells[5].innerText.toLowerCase();

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

/**
 * Sorts checkout table rows by column:
 * - column 0: checkoutId (numeric)
 * - column 4: date (converted to Date object)
 * - others: text-based sorting
 * @param {number} colIndex
 * @returns {void}
 */
function sortCheckouts(colIndex) {
  const tbody = document.getElementById("checkoutTableBody");
  const rows = Array.from(tbody.querySelectorAll("tr"));

  checkoutSortDirection[colIndex] = !checkoutSortDirection[colIndex];
  const asc = checkoutSortDirection[colIndex];

  const sorted = rows.sort((rowA, rowB) => {
    const a = rowA.children[colIndex].innerText.trim();
    const b = rowB.children[colIndex].innerText.trim();

    if (colIndex === 0) {
      const numA = parseInt(a, 10);
      const numB = parseInt(b, 10);
      return asc ? numA - numB : numB - numA;
    }

    if (colIndex === 4) {
      const [mA, dA, yA] = a.split("/");
      const [mB, dB, yB] = b.split("/");
      const dateA = new Date(yA, mA - 1, dA);
      const dateB = new Date(yB, mB - 1, dB);
      return asc ? dateA - dateB : dateB - dateA;
    }

    const aa = a.toLowerCase();
    const bb = b.toLowerCase();
    return asc ? aa.localeCompare(bb) : bb.localeCompare(aa);
  });

  sorted.forEach(row => tbody.appendChild(row));
}

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
      row.innerHTML = `
        <td>${w.name}</td>
        <td>${w.location}</td>
        <td>${w.totalSupply}</td>
        <td>${w.capacity || "N/A"}</td>
      `;
      body.appendChild(row);
    });
  } catch (err) {
    console.error("Error loading warehouses:", err);
    document.getElementById("warehouseTableBody").innerHTML =
      `<tr><td colspan="4" style="text-align:center;color:red;">Error loading data</td></tr>`;
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

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    if (tab.textContent.includes("Warehouses")) {
      restockSection.style.display = "none";
      warehouseSection.style.display = "block";
      loadWarehouses();
    } else {
      warehouseSection.style.display = "none";
      restockSection.style.display = "block";
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

      <select id="productSelect" style="margin-top:10px;width:100%;padding:8px;">
        <option value="">-- Choose a product --</option>
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
          <p><strong>Category:</strong> ${product.category || "N/A"}</p>
          <p><strong>Price per unit:</strong> $${(+product.price).toFixed(2)}</p>
          <p><strong>Supplier:</strong> ${supplier}</p>
          <label style="display:block;margin-top:10px;">
            <strong>Amount to Restock:</strong>
            <input type="number" id="restockAmount" min="1"
                  style="margin-left:8px;width:100px;padding:5px;background:#2a2a2a;color:#fff;border:none;border-radius:4px;">
          </label>
          <p style="margin-top:8px;">Total Cost: $<span id="totalCost">0.00</span></p>
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
            closeModal();
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
function closeModal(event) {
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

// Allow clicking dark backdrop to close modal
document.getElementById("restockModal").addEventListener("click", (e) => closeModal(e));

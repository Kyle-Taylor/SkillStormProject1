// ============================== LOAD SUPPLIERS ==============================

/**
 * Loads all suppliers, formats phone numbers, and populates the Suppliers table.
 * @async
 * @returns {Promise<void>}
 */
async function loadSuppliers() {
    try {
    const response = await fetch("/suppliers", {credentials: "include"});
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

/**
 * Opens the Edit Supplier modal and populates it with supplier data.
 * Sets up event handlers for update and delete actions.
 * @param {number} id
 * @param {string} name
 * @param {string} email
 * @param {string} phone
 * @param {string} address
 * @returns {void}
 */
function openEditSupplierModal(id, name, email, phone, address) {
  document.getElementById("deleteSupplierBtn").onclick = () => {
    openDeleteSupplierModal(id);
  };
  document.getElementById("confirmDeleteSupplierBtn").onclick = async () => {confirmDeleteSupplier(id);};

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
        credentials: "include",
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

/**
 * Closes and resets the Edit Supplier modal.
 * @returns {void}
 */
function closeEditSupplierModal() {
  document.getElementById("editSupplierModal").style.display = "none";
  document.getElementById("editSupplierForm").reset();
}

/**
 * Opens the delete confirmation modal for a supplier.
 * @param {number} supplierId
 * @returns {void}
 */
function openDeleteSupplierModal(supplierId) {
  document.getElementById("deleteSupplierModal").style.display = "flex";
}

/**
 * Closes the supplier delete modal.
 * @returns {void}
 */
function closeDeleteSupplierModal() {
  document.getElementById("deleteSupplierModal").style.display = "none";
}

/**
 * Deletes a supplier by ID and updates the UI.
 * @async
 * @param {number} supplierId
 * @returns {Promise<void>}
 */
async function confirmDeleteSupplier(supplierId) {
  try {
    const response = await fetch(`/suppliers/delete/${supplierId}`, {
      method: "DELETE",
      credentials: "include"
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

/**
 * Opens the Create Supplier modal.
 * @returns {void}
 */
function openCreateSupplierModal() {
  document.getElementById("createSupplierModal").style.display = "flex";
}

/**
 * Closes the Create Supplier modal and resets the form.
 * @returns {void}
 */
function closeCreateSupplierModal() {
  document.getElementById("supplierForm").reset();
  document.getElementById("createSupplierModal").style.display = "none";
}

/**
 * Submits a new supplier to the backend.
 * Performs validation and updates UI on success.
 * @async
 * @returns {Promise<void>}
 */
async function submitNewSupplier() {
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
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, contactEmail, phone, address })
    });

    if (response.ok) {
      showToast("Supplier created successfully!");
      closeCreateSupplierModal();
      loadSuppliers();
    } 
    else if(response.status === 409){
      showToast("Supplier with this email already exists.", 3000);
    }
    else {
      showToast("Failed to create supplier.");
    }
  } catch (err) {
    console.error("Error creating supplier:", err);
    showToast("Error creating supplier.");
  }
}

document.getElementById("submitSupplierBtn").addEventListener("click", submitNewSupplier);



// ============================== FILTERING SUPPLIERS SECTION ==============================

/**
 * Global search & column search event listeners.
 */
document.getElementById("searchInputSuppliers")
  .addEventListener("input", applySupplierFilters);
document.getElementById("searchSupplierName")
  .addEventListener("input", applySupplierFilters);
document.getElementById("searchSupplierEmail")
  .addEventListener("input", applySupplierFilters);
document.getElementById("searchSupplierPhone")
  .addEventListener("input", applySupplierFilters);
document.getElementById("searchSupplierAddress")
  .addEventListener("input", applySupplierFilters);

/**
 * Applies global & column filters to supplier rows.
 * @returns {void}
 */
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
      (globalQuery === "" ||
        supplierName.includes(globalQuery) ||
        supplierEmail.includes(globalQuery) ||
        supplierPhone.includes(globalQuery) ||
        supplierAddress.includes(globalQuery)) &&

      (idQuery        === "" || supplierName.includes(idQuery)) &&
      (itemQuery      === "" || supplierEmail.includes(itemQuery)) &&
      (warehouseQuery === "" || supplierPhone.includes(warehouseQuery)) &&
      (dateQuery      === "" || supplierAddress.includes(dateQuery));

    row.style.display = matches ? "" : "none";
  });
}



// ============================== SORTING SUPPLIERS SECTION ==============================

let supplierSortDirection = {};

/**
 * Sorts suppliers table alphabetically by chosen column.
 * @param {number} colIndex
 * @returns {void}
 */
function sortSuppliers(colIndex) {
  const tbody = document.getElementById("suppliersTableBody");
  const rows = Array.from(tbody.querySelectorAll("tr"));

  supplierSortDirection[colIndex] = !supplierSortDirection[colIndex];
  const asc = supplierSortDirection[colIndex];

  const sorted = rows.sort((rowA, rowB) => {
    const a = rowA.children[colIndex].innerText.trim().toLowerCase();
    const b = rowB.children[colIndex].innerText.trim().toLowerCase();

    return asc ? a.localeCompare(b) : b.localeCompare(a);
  });

  sorted.forEach(row => tbody.appendChild(row));
}

// ============================== LOAD PRODUCTS ==============================

/**
 * Loads all products, retrieves total inventory quantity for each,
 * builds table rows, and renders them in the Products table.
 * @async
 * @returns {Promise<void>}
 */
async function loadProducts() {
    try {
    const response = await fetch("/products", {credentials: "include"});
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


// ============================== CREATE PRODUCT SECTION ==============================

/**
 * Opens the Create Product modal and preloads supplier names.
 * @returns {void}
 */
function openCreateProductModal() {
  document.getElementById("createProductModal").style.display = "flex";
  loadSupplierNames(null, "createProductSupplierSelect");
}

/**
 * Closes the Create Product modal and resets the form.
 * @returns {void}
 */
function closeCreateProductModal() {
  document.getElementById("createProductForm").reset();
  document.getElementById("createProductModal").style.display = "none";
}

/**
 * Submits a new product to the backend.
 * Performs validation and updates UI on success.
 * @async
 * @returns {Promise<void>}
 */
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
      credentials: "include",
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

/**
 * Loads suppliers into a select dropdown.
 * @async
 * @param {number|null} selectedSupplierId
 * @param {string} selectElementId
 * @returns {Promise<void>}
 */
async function loadSupplierNames(selectedSupplierId, selectElementId) {
  try {
    const response = await fetch("/suppliers", {credentials: "include"});
    const suppliers = await response.json();

    const supplierSelect = document.getElementById(selectElementId);

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

/**
 * Opens edit modal for a specific product and preloads its data.
 * Sets up update and delete event handlers.
 * @param {number} id
 * @param {string} name
 * @param {string} category
 * @param {number} price
 * @param {number|null} supplierId
 * @param {number} totalQuantity
 * @returns {void}
 */
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
        credentials: "include",
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
  };

  document.getElementById("deleteProductBtn").onclick = () => {
    openDeleteProductModal(id);
  };
}

/**
 * Closes the edit product modal and resets the form.
 * @returns {void}
 */
function closeEditProductModal() {
  document.getElementById("editProductModal").style.display = "none";
  document.getElementById("editProductForm").reset();
}


// ============================== DELETE PRODUCT SECTION ==============================

/**
 * Opens the delete confirmation modal for a product.
 * @param {number} productId
 * @returns {void}
 */
function openDeleteProductModal(productId) {
  document.getElementById("deleteProductModal").style.display = "flex";
  document.getElementById("confirmDeleteProductBtn").addEventListener("click", () => {
    confirmDeleteProduct(productId);
  });
}

/**
 * Closes delete-product modal.
 * @returns {void}
 */
function closeDeleteProductModal() {
  document.getElementById("deleteProductModal").style.display = "none";
}

/**
 * Performs DELETE request to remove product.
 * Updates UI on success.
 * @async
 * @param {number} productId
 * @returns {Promise<void>}
 */
async function confirmDeleteProduct(productId) {
  try {
    const response = await fetch(`/products/delete/${productId}`, {
      method: "DELETE",
      credentials: "include"
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


// ============================== GET TOTAL PRODUCT QUANTITY  ==============================

/**
 * Fetches the total inventory quantity for a specific product.
 * @async
 * @param {number} productId
 * @returns {Promise<number>} total quantity
 */
async function getTotalProductQuantity(productId) { 
    try {
        const response = await fetch(`/inventory/product/${productId}`, {credentials: "include"});
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

/**
 * Applies global and column-based filters to the products table.
 * @returns {void}
 */
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

  const productSKU      = cells[0].innerText.toLowerCase();
  const productName     = cells[1].innerText.toLowerCase();
  const productCategory = cells[3].innerText.toLowerCase();
  const productSupplier = cells[4].innerText.toLowerCase();

  const matches =
    (globalQuery === "" ||
      productSKU.includes(globalQuery) ||
      productName.includes(globalQuery) ||
      productCategory.includes(globalQuery) ||
      productSupplier.includes(globalQuery)) &&
    (idQuery === "" || productSKU.includes(idQuery)) &&
    (itemQuery === "" || productName.includes(itemQuery)) &&
    (warehouseQuery === "" || productCategory.includes(warehouseQuery)) &&
    (dateQuery === "" || productSupplier.includes(dateQuery));

  row.style.display = matches ? "" : "none";
});
}


// ============================== SORTING PRODUCTS SECTION ==============================

let productSortDirection = {};

/**
 * Sorts the products table by a selected column.
 * Handles numeric, price, and text sorting.
 * @param {number} colIndex
 * @returns {void}
 */
function sortProducts(colIndex) {
  const tbody = document.getElementById("productsTableBody");
  const rows = Array.from(tbody.querySelectorAll("tr"));

  productSortDirection[colIndex] = !productSortDirection[colIndex];
  const asc = productSortDirection[colIndex];

  const sorted = rows.sort((rowA, rowB) => {
    const a = rowA.children[colIndex].innerText.trim();
    const b = rowB.children[colIndex].innerText.trim();

    // SKU or Total Stock (numeric)
    if (colIndex === 0 || colIndex === 5) {
      const numA = parseInt(a.replace(/,/g, ""), 10);
      const numB = parseInt(b.replace(/,/g, ""), 10);
      return asc ? numA - numB : numB - numA;
    }

    // Price column
    if(colIndex === 2){
      const priceA = parseFloat(a.replace(/[^0-9.]/g, ""));
      const priceB = parseFloat(b.replace(/[^0-9.]/g, ""));
      return asc ? priceA - priceB : priceB - priceA;
    }

    // Default: text sorting
    const aa = a.toLowerCase();
    const bb = b.toLowerCase();
    return asc ? aa.localeCompare(bb) : bb.localeCompare(aa);
  });

  sorted.forEach(row => tbody.appendChild(row));
}

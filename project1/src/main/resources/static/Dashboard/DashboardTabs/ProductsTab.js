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

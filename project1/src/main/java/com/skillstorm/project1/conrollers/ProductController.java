package com.skillstorm.project1.conrollers;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.skillstorm.project1.models.Product;
import com.skillstorm.project1.models.Supplier;
import com.skillstorm.project1.services.ProductService;
import com.skillstorm.project1.services.SupplierService;

@RestController
@RequestMapping("/products")
@CrossOrigin(origins = "http://localhost:8080", allowCredentials = "true")
public class ProductController {

    /** Service used for product operations. */
    private final ProductService productService;

    /** Service used for supplier lookups and assignments. */
    private final SupplierService supplierService;

    /**
     * Constructor-based injection for ProductService and SupplierService.
     *
     * @param productService  service handling product logic
     * @param supplierService service handling supplier logic
     */
    public ProductController(ProductService productService, SupplierService supplierService){
        this.productService = productService;
        this.supplierService = supplierService;
    }

    /**
     * Retrieves all products stored in the database.
     *
     * @return ResponseEntity containing a list of all products or an error response
     */
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        try {
            return new ResponseEntity<>(productService.getAllProducts(), HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
            .header("Error: ", "Sorry! We have an internal Error! Please check back later.")
            .build();
        }
    }

    /**
     * Retrieves a specific product by its ID.
     *
     * @param id ID of the target product
     * @return ResponseEntity containing the product or an error response
     */
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        try {
            Product product = productService.getProductById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with ID " + id));
            return new ResponseEntity<>(product, HttpStatus.OK);
        }
        catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .header("Error: ", e.getMessage())
            .build();
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError()
            .header("Error: ", "Sorry! We have an internal Error! Please check back later.")
            .build();
        }
    }

    /**
     * Creates a new product using the provided request payload.
     *
     * @param payload incoming JSON map containing product values
     * @return ResponseEntity containing the created product or an error response
     */
    @PostMapping("/create_product")
    public ResponseEntity<Product> createProduct(@RequestBody Map<String, Object> payload) {
        try {
            String productName = payload.get("productName").toString();
            double price = Double.parseDouble(payload.get("price").toString());
            String category = payload.get("category").toString();

            Long supplierId = null;
            if (payload.get("supplierId") != null && !payload.get("supplierId").toString().isEmpty()) {
                supplierId = Long.valueOf(payload.get("supplierId").toString());
            }

            Product product = new Product();
            product.setProductName(productName);
            product.setPrice(price);
            product.setCategory(category);

            if (supplierId != null) {
                Supplier supplier = supplierService.getSupplierById(supplierId);
                product.setSupplier(supplier);
            } else {
                product.setSupplier(null);
            }

            Product created = productService.createProduct(product);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        }
        catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .header("Error", "Product name already exists")
                    .build();
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError()
            .header("Error: ", "Sorry! We have an internal Error! Please check back later.")
            .build();
        }
    }

    /**
     * Updates an existing product by replacing it with the provided Product object.
     *
     * @param id      ID of the product to update
     * @param updated product object containing updated values
     * @return ResponseEntity containing the updated product or an error response
     */
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product updated) {
        try {
            return new ResponseEntity<>(productService.updateProduct(id, updated), HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
            .header("Error: ", "Sorry! We have an internal Error! Please check back later.")
            .build();
        }
    }

    /**
     * Deletes a product by its ID.
     *
     * @param id ID of the product to delete
     * @return ResponseEntity indicating the outcome of the delete request
     */
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        try {
            productService.deleteProduct(id);
            return ResponseEntity.noContent().build();
        }
        catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
            .header("Error: ", "Product not found with ID " + id)
            .build();
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError()
            .header("Error: ", "Sorry! We have an internal Error! Please check back later.")
            .build();
        }
    }

    /**
     * Updates product fields using a payload map instead of a full Product object.
     *
     * @param id      ID of the product to modify
     * @param payload incoming JSON containing updated product fields
     * @return ResponseEntity with updated product or an error response
     */
    @PutMapping("/edit_product/{id}")
    public ResponseEntity<Product> editProduct(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            Product updated = productService.editProduct(
                id,
                payload.get("productName").toString(),
                payload.get("category").toString(),
                Double.parseDouble(payload.get("price").toString()),
                Long.valueOf(payload.get("supplierId").toString())
            );

            return new ResponseEntity<>(updated, HttpStatus.OK);
        }
        catch (NumberFormatException e) {
            return ResponseEntity.internalServerError().build();
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError()
            .header("Error: ", "Sorry! We have an internal Error! Please check back later.")
            .build();
        }
    }
}

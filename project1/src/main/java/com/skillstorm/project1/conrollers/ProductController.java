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
@CrossOrigin(origins = "*")
public class ProductController {

    //injection for productService
    private final ProductService productService;
    private final SupplierService supplierService;
    public ProductController(ProductService productService, SupplierService supplierService){
        this.productService = productService;
        this.supplierService = supplierService;
    }

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        try {
            return new ResponseEntity<>(productService.getAllProducts(),HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
            .header("Error: ", "Sorry! We have an internal Error! Please check back later.")
            .build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        try {
            Product product = productService.getProductById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with ID " + id));
        return new ResponseEntity<>(product, HttpStatus.OK);
        } 
        catch (IllegalArgumentException e){
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

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {

        try {
            productService.deleteProduct(id);
            return ResponseEntity.noContent().build();
        } 
        catch (IllegalArgumentException e){
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

    //put request to edit product
    @PutMapping("/edit_product/{id}")
    public ResponseEntity<Product> editProduct(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            Product updated = productService.editProduct(id,
                payload.get("productName").toString(),
                payload.get("category").toString(),
                Double.parseDouble(payload.get("price").toString()),
                Long.valueOf(payload.get("supplierId").toString())
            );
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (NumberFormatException e) {
            return ResponseEntity.internalServerError().build();
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError()
            .header("Error: ", "Sorry! We have an internal Error! Please check back later.")
            .build();
        }
    }
}

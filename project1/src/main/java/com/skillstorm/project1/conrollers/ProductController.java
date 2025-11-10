package com.skillstorm.project1.conrollers;

import java.util.List;

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
import com.skillstorm.project1.services.ProductService;

@RestController
@RequestMapping("/products")
@CrossOrigin(origins = "*")
public class ProductController {

    //injection for productService
    private final ProductService productService;
    public ProductController(ProductService productService){
        this.productService = productService;
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

    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        try {
            return new ResponseEntity<>(productService.createProduct(product),HttpStatus.OK);
        } 
        catch (IllegalArgumentException e){
            return ResponseEntity.badRequest()
            .header("Error: ", e.getMessage())
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

    @DeleteMapping("/{id}")
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
}

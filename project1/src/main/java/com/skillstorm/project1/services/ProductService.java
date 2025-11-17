package com.skillstorm.project1.services;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.skillstorm.project1.models.Product;
import com.skillstorm.project1.models.Supplier;
import com.skillstorm.project1.repositories.ProductRepository;
import com.skillstorm.project1.repositories.SupplierRepository;

import jakarta.transaction.Transactional;

@Service
public class ProductService {

    //injection for productRepository and supplierRepository
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    public ProductService(ProductRepository productRepository, SupplierRepository supplierRepository){
        this.productRepository = productRepository;
        this.supplierRepository = supplierRepository;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAllByOrderByProductNameAsc();
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public Product createProduct(Product product) {
        if (productRepository.existsByProductName(product.getProductName())) {
            throw new IllegalStateException("DUPLICATE_PRODUCT_NAME");
    }
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product details) {
        return productRepository.findById(id)
                .map(existing -> {
                    existing.setProductName(details.getProductName());
                    existing.setPrice(details.getPrice());
                    existing.setCategory(details.getCategory());
                    return productRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Product not found with id " + id));
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    // EDIT PRODUCT METHOD
    @Transactional
    public Product editProduct(Long productId, String productName, String category, double price, Long supplierId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with ID " + productId));
        product.setProductName(productName);
        product.setCategory(category);
        product.setPrice(price);
        
        if (supplierId != null) {
        Supplier s = supplierRepository.findById(supplierId).orElseThrow();
        product.setSupplier(s);
    } else {
        product.setSupplier(null);
    }
    return productRepository.save(product);
    }
}

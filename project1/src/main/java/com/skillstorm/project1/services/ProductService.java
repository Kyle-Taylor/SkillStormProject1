package com.skillstorm.project1.services;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.skillstorm.project1.models.Product;
import com.skillstorm.project1.repositories.ProductRepository;

@Service
public class ProductService {

    //injection for productRepository
    private final ProductRepository productRepository;
    public ProductService(ProductRepository productRepository){
        this.productRepository = productRepository;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAllByOrderByProductNameAsc();
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public Product createProduct(Product product) {
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
}

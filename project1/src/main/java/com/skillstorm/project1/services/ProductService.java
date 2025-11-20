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

    // injection for productRepository and supplierRepository
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;

    /**
     * Constructs a new ProductService with required repositories.
     *
     * @param productRepository  repository for product data access
     * @param supplierRepository repository for supplier data access
     */
    public ProductService(ProductRepository productRepository, SupplierRepository supplierRepository){
        this.productRepository = productRepository;
        this.supplierRepository = supplierRepository;
    }

    /**
     * Retrieves all products sorted alphabetically by name.
     *
     * @return list of products ordered by name
     */
    public List<Product> getAllProducts() {
        return productRepository.findAllByOrderByProductNameAsc();
    }

    /**
     * Retrieves a product by its ID.
     *
     * @param id the product ID
     * @return an {@link Optional} containing the product if found
     */
    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    /**
     * Creates a new product, preventing duplicates by name.
     *
     * @param product the product to create
     * @return the saved product
     * @throws IllegalStateException if a product with the same name already exists
     */
    public Product createProduct(Product product) {
        if (productRepository.existsByProductName(product.getProductName())) {
            throw new IllegalStateException("DUPLICATE_PRODUCT_NAME");
        }
        return productRepository.save(product);
    }

    /**
     * Updates an existing product's fields.
     *
     * @param id product ID to update
     * @param details object containing new product values
     * @return the updated product
     * @throws RuntimeException if the product does not exist
     */
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

    /**
     * Deletes a product by its ID.
     *
     * @param id the product ID
     */
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    /**
     * Updates a product with new name, category, price, and supplier.
     * <p>
     * If supplierId is {@code null}, the product will have no supplier.
     * </p>
     *
     * @param productId  ID of the product to edit
     * @param productName new product name
     * @param category new category
     * @param price new price
     * @param supplierId optional supplier ID
     * @return the updated product
     * @throws IllegalArgumentException if the product does not exist
     */
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

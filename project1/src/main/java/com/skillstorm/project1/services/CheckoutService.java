package com.skillstorm.project1.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.skillstorm.project1.models.Checkout;
import com.skillstorm.project1.models.Product;
import com.skillstorm.project1.models.Warehouse;
import com.skillstorm.project1.repositories.CheckoutRepository;
import com.skillstorm.project1.repositories.ProductRepository;
import com.skillstorm.project1.repositories.WarehouseRepository;

import jakarta.transaction.Transactional;

@Service
public class CheckoutService {

    private final CheckoutRepository checkoutRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;

    /**
     * Constructs a new {@code CheckoutService} with the required repositories.
     *
     * @param checkoutRepository  repository for {@link Checkout} data access
     * @param warehouseRepository repository for {@link Warehouse} data access
     * @param productRepository   repository for {@link Product} data access
     */
    public CheckoutService(CheckoutRepository checkoutRepository, WarehouseRepository warehouseRepository, ProductRepository productRepository) {
        this.checkoutRepository = checkoutRepository;
        this.warehouseRepository = warehouseRepository;
        this.productRepository = productRepository;
    }

    /**
     * Retrieves all checkout records ordered by checkout date (descending).
     *
     * @return a list of {@link Checkout} entries sorted by most recent first
     */
    public List<Checkout> findAllCheckouts() {
        return checkoutRepository.findAllByOrderByCheckoutDateDesc();
    }
    
    /**
     * Creates a new checkout record for a given warehouse, product, and amount.
     * <p>
     * This method is transactional to ensure that all operations succeed
     * together or roll back on failure.
     * </p>
     *
     * @param warehouseId the ID of the warehouse where the checkout occurs
     * @param productId   the ID of the product being checked out
     * @param amount      quantity of the product being removed
     * @param userEmail   email of the user performing the checkout
     * @return the saved {@link Checkout} entity
     * @throws RuntimeException if the referenced warehouse or product is not found
     */
    @Transactional
    public Checkout createCheckout(Long warehouseId, Long productId, int amount, String userEmail) {

        Warehouse warehouse = warehouseRepository.findById(warehouseId)
            .orElseThrow(() -> new RuntimeException("Warehouse not found"));

        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));

        Checkout checkout = new Checkout();
        checkout.setWarehouse(warehouse);
        checkout.setProduct(product);
        checkout.setAmount(amount);
        checkout.setUserEmail(userEmail);

        return checkoutRepository.save(checkout);
    }
}

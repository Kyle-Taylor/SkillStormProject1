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

    public CheckoutService(CheckoutRepository checkoutRepository, WarehouseRepository warehouseRepository, ProductRepository productRepository) {
        this.checkoutRepository = checkoutRepository;
        this.warehouseRepository = warehouseRepository;
        this.productRepository = productRepository;
    }
    // FindAllCheckouts
    public List<Checkout> findAllCheckouts() {
        return checkoutRepository.findAll();
    }
    
    // creating a checkout
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
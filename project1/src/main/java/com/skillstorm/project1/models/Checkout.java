package com.skillstorm.project1.models;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "checkouts")
public class Checkout {

    /**
     * Primary key for the checkout record.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long checkoutId;

    /**
     * Warehouse where the product is checked out from.
     * Cannot be null.
     */
    @ManyToOne
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    /**
     * Product that was checked out.
     * Cannot be null.
     */
    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    /**
     * Quantity of the product being checked out.
     */
    @Column(nullable = false)
    private int amount;

    /**
     * Timestamp for when the checkout occurred.
     * Defaults to the current system time.
     */
    private LocalDateTime checkoutDate = LocalDateTime.now();

    /**
     * Email of the user who performed the checkout.
     */
    @Column(name = "user_email")
    private String userEmail;

    /**
     * Default no-args constructor required by JPA.
     */
    public Checkout() {}

    /**
     * Convenience constructor for creating a checkout record.
     *
     * @param warehouse warehouse the product was taken from
     * @param product product being checked out
     * @param amount quantity checked out
     * @param userEmail email of the user performing the checkout
     */
    public Checkout(Warehouse warehouse, Product product, int amount, String userEmail) {
        this.warehouse = warehouse;
        this.product = product;
        this.amount = amount;
        this.userEmail = userEmail;
    }

    // Getters and Setters

    public Long getCheckoutId() { return checkoutId; }
    public void setCheckoutId(Long checkoutId) { this.checkoutId = checkoutId; }

    public Warehouse getWarehouse() { return warehouse; }
    public void setWarehouse(Warehouse warehouse) { this.warehouse = warehouse; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public int getAmount() { return amount; }
    public void setAmount(int amount) { this.amount = amount; }

    public LocalDateTime getCheckoutDate() { return checkoutDate; }
    public void setCheckoutDate(LocalDateTime checkoutDate) { this.checkoutDate = checkoutDate; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
}

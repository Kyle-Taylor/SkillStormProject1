package com.skillstorm.project1.models;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Represents a restock order placed for a warehouse.
 * Stores metadata such as warehouse, product, supplier,
 * the amount ordered, the date of the order, and the user
 * responsible for placing it.
 */
@Entity
@Table(name = "restock_orders")
public class RestockOrder {

    /**
     * Primary key for the restock order.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long restockId;

    /**
     * Optional external reference identifier.
     * Must be unique if provided.
     */
    @Column(unique = true)
    private Long restockRef;

    /**
     * Warehouse where the product will be restocked.
     */
    @ManyToOne
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    /**
     * Product being restocked.
     */
    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnoreProperties({"inventoryItems", "restockOrders", "supplier"})
    private Product product;

    /**
     * Supplier providing the restocked product.
     * Can be null depending on the product configuration.
     */
    @ManyToOne
    @JoinColumn(name = "supplier_id", nullable = true)
    private Supplier supplier;

    /**
     * Amount of product ordered.
     */
    @Column(nullable = false)
    private int amount;

    /**
     * Timestamp when the restock order was created.
     * Defaults to the current date/time.
     */
    private LocalDateTime restockDate = LocalDateTime.now();

    /**
     * Username or email of the user who placed the order.
     */
    @Column(name = "ordered_by")
    private String orderedBy;

    /**
     * Default constructor.
     */
    public RestockOrder() {}

    /**
     * Creates a new RestockOrder with required attributes.
     *
     * @param warehouse   Warehouse receiving the restock
     * @param product     Product being restocked
     * @param supplier    Supplier sending the product
     * @param amount      Quantity ordered
     * @param orderedBy   User who placed the restock order
     */
    public RestockOrder(Warehouse warehouse, Product product, Supplier supplier, int amount, String orderedBy) {
        this.warehouse = warehouse;
        this.product = product;
        this.supplier = supplier;
        this.amount = amount;
        this.orderedBy = orderedBy;
    }

    public Long getRestockId() { return restockId; }
    public void setRestockId(Long restockId) { this.restockId = restockId; }

    public Long getRestockRef() { return restockRef; }
    public void setRestockRef(Long restockRef) { this.restockRef = restockRef; }

    public Warehouse getWarehouse() { return warehouse; }
    public void setWarehouse(Warehouse warehouse) { this.warehouse = warehouse; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public Supplier getSupplier() { return supplier; }
    public void setSupplier(Supplier supplier) { this.supplier = supplier; }

    public int getAmount() { return amount; }
    public void setAmount(int amount) { this.amount = amount; }

    public LocalDateTime getRestockDate() { return restockDate; }
    public void setRestockDate(LocalDateTime restockDate) { this.restockDate = restockDate; }

    public String getOrderedBy() { return orderedBy; }
    public void setOrderedBy(String orderedBy) { this.orderedBy = orderedBy; }
}

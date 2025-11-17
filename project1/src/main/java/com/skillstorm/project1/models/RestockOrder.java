package com.skillstorm.project1.models;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "restock_orders")
public class RestockOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long restockId;

    @Column(unique = true)
    private Long restockRef;

    @ManyToOne
    @JoinColumn(name = "warehouse_id", nullable = false)
    @JsonIgnore
    private Warehouse warehouse;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnoreProperties({"inventoryItems", "restockOrders", "supplier"})
    private Product product;

    @ManyToOne
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @Column(nullable = false)
    private int amount;

    private LocalDateTime restockDate = LocalDateTime.now();

    @Column(name = "ordered_by")
    private String orderedBy;

    // Constructors
    public RestockOrder() {}

    public RestockOrder(Warehouse warehouse, Product product, Supplier supplier, int amount, String orderedBy) {
        this.warehouse = warehouse;
        this.product = product;
        this.supplier = supplier;
        this.amount = amount;
        this.orderedBy = orderedBy;
    }

    // Getters and Setters
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

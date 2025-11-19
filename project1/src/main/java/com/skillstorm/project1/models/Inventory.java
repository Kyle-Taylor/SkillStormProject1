package com.skillstorm.project1.models;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "inventory", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"warehouse_id", "product_id"})
})
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long inventoryId;

    @ManyToOne
    @JoinColumn(name = "warehouse_id", nullable = false)
    @JsonIgnore
    private Warehouse warehouse;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private int quantity;

    @Column(name="minimum_stock", nullable = false)
    private int minimumStock = 0;

    @Column(name="warehouse_location")
    private int warehouseLocation;
    
    private LocalDateTime lastUpdated = LocalDateTime.now();

    // Constructors
    public Inventory() {}

    public Inventory(Warehouse warehouse, Product product, int quantity, int minimumStock, int warehouseLocation) {
        this.warehouse = warehouse;
        this.product = product;
        this.quantity = quantity;
        this.minimumStock = minimumStock;
        this.warehouseLocation = warehouseLocation;
    }

    // Getters and Setters
    public Long getInventoryId() { return inventoryId; }
    public void setInventoryId(Long inventoryId) { this.inventoryId = inventoryId; }

    public Warehouse getWarehouse() { return warehouse; }
    public void setWarehouse(Warehouse warehouse) { this.warehouse = warehouse; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public int getMinimumStock() {return minimumStock;}
    public void setMinimumStock(int minimumStock) {this.minimumStock = minimumStock;}
    
    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }

    public int getWarehouseLocation() {return warehouseLocation;}
    public void setWarehouseLocation(int warehouseLocation) {this.warehouseLocation = warehouseLocation;}
}

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

/**
 * Represents an inventory record that tracks how much of a specific product
 * is stored inside a specific warehouse. Each warehouse-product pair must be unique.
 */
@Entity
@Table(name = "inventory", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"warehouse_id", "product_id"})
})
public class Inventory {

    /** Primary key for the inventory record. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long inventoryId;

    /** Warehouse where the product is stored. */
    @ManyToOne
    @JoinColumn(name = "warehouse_id", nullable = false)
    @JsonIgnore
    private Warehouse warehouse;

    /** Product stored in this warehouse. */
    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    /** Current quantity of the product in this warehouse. */
    @Column(nullable = false)
    private int quantity;

    /** Minimum amount required before restock warnings appear. */
    @Column(name="minimum_stock", nullable = false)
    private int minimumStock = 0;

    /** The bay / shelf / location number inside the warehouse. */
    @Column(name="warehouse_location")
    private int warehouseLocation;

    /** Last time this record was modified. */
    private LocalDateTime lastUpdated = LocalDateTime.now();

    /**
     * Default constructor.
     */
    public Inventory() {}

    /**
     * Full constructor for creating an inventory record.
     *
     * @param warehouse the warehouse where the product is stored
     * @param product the product stored
     * @param quantity current stock level
     * @param minimumStock the minimum acceptable stock
     * @param warehouseLocation storage location inside the warehouse
     */
    public Inventory(Warehouse warehouse, Product product, int quantity, int minimumStock, int warehouseLocation) {
        this.warehouse = warehouse;
        this.product = product;
        this.quantity = quantity;
        this.minimumStock = minimumStock;
        this.warehouseLocation = warehouseLocation;
    }

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

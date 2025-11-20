package com.skillstorm.project1.models;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

/**
 * Represents a warehouse location that stores inventory.
 * Each warehouse has a name, location, and capacity limit.
 * 
 * A warehouse can contain multiple {@link Inventory} records.
 */
@Entity
@Table(name = "warehouses")
public class Warehouse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long warehouseId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private int capacity;

    /**
     * Inventory items stored in this warehouse.
     * Cascade ALL ensures the inventory rows are removed when a warehouse is deleted.
     */
    @OneToMany(mappedBy = "warehouse", cascade = CascadeType.ALL)
    private List<Inventory> inventoryItems;

    /**
     * Default constructor.
     */
    public Warehouse() {}

    /**
     * Creates a new Warehouse instance.
     *
     * @param name     Warehouse name
     * @param location Warehouse location
     * @param capacity Max storage capacity
     */
    public Warehouse(String name, String location, int capacity) {
        this.name = name;
        this.location = location;
        this.capacity = capacity;
    }

    // Getters and Setters

    public Long getWarehouseId() { return warehouseId; }
    public void setWarehouseId(Long warehouseId) { this.warehouseId = warehouseId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }

    public List<Inventory> getInventoryItems() { return inventoryItems; }
    public void setInventoryItems(List<Inventory> inventoryItems) { this.inventoryItems = inventoryItems; }

}

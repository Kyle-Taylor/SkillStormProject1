package com.skillstorm.project1.services;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.skillstorm.project1.models.Inventory;
import com.skillstorm.project1.models.Warehouse;
import com.skillstorm.project1.repositories.InventoryRepository;
import com.skillstorm.project1.repositories.WarehouseRepository;

import jakarta.transaction.Transactional;

@Service
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final InventoryRepository inventoryRepository;

    /**
     * Constructs a new WarehouseService with required repositories.
     *
     * @param warehouseRepository repository for warehouse data access
     * @param inventoryRepository repository for inventory data access
     */
    public WarehouseService(WarehouseRepository warehouseRepository, InventoryRepository inventoryRepository) {
        this.warehouseRepository = warehouseRepository;
        this.inventoryRepository = inventoryRepository;
    }

    /**
     * Retrieves all warehouses along with their total inventory quantities.
     *
     * @return list of maps containing warehouse details and total stock
     */
    public List<Map<String, Object>> findAllWarehousesWithTotals() {
        List<Warehouse> warehouses = warehouseRepository.findAllByOrderByNameAsc();
        List<Inventory> inventory = inventoryRepository.findAll();
        List<Map<String, Object>> results = new ArrayList<>();

        for (Warehouse w : warehouses) {
            int total = inventory.stream()
                    .filter(i -> i.getWarehouse().getWarehouseId().equals(w.getWarehouseId()))
                    .mapToInt(Inventory::getQuantity)
                    .sum();

            Map<String, Object> data = new HashMap<>();
            data.put("warehouseId", w.getWarehouseId());
            data.put("name", w.getName());
            data.put("location", w.getLocation());
            data.put("totalSupply", total);
            data.put("capacity", w.getCapacity());
            results.add(data);
        }

        return results;
    }

    /**
     * Creates a new warehouse.
     *
     * @param name     warehouse name
     * @param location warehouse location
     * @param capacity warehouse capacity
     * @return the saved warehouse
     */
    @Transactional
    public Warehouse createWarehouse(String name, String location, int capacity) {
        Warehouse warehouse = new Warehouse();
        warehouse.setName(name);
        warehouse.setLocation(location);
        warehouse.setCapacity(capacity);
        return warehouseRepository.save(warehouse);
    }

    /**
     * Deletes a warehouse by its ID.
     *
     * @param warehouseId the ID of the warehouse to delete
     * @throws IllegalArgumentException if the warehouse does not exist
     */
    @Transactional
    public void deleteWarehouse(Long warehouseId) {
        if (!warehouseRepository.existsById(warehouseId)) {
            throw new IllegalArgumentException("Invalid warehouse ID");
        }
        warehouseRepository.deleteById(warehouseId);
        warehouseRepository.deleteById(warehouseId);
    }

    /**
     * Updates existing warehouse details.
     *
     * @param warehouseId warehouse ID
     * @param name        new name
     * @param location    new location
     * @param capacity    new capacity
     * @return the updated warehouse
     * @throws IllegalArgumentException if the warehouse does not exist
     */
    @Transactional
    public Warehouse editWarehouse(Long warehouseId, String name, String location, int capacity) {
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new IllegalArgumentException("Warehouse not found with ID " + warehouseId));

        warehouse.setName(name);
        warehouse.setLocation(location);
        warehouse.setCapacity(capacity);

        return warehouseRepository.save(warehouse);
    }

    /**
     * Retrieves a warehouse by its ID.
     *
     * @param warehouseId the warehouse ID
     * @return the warehouse object
     * @throws IllegalArgumentException if not found
     */
    public Warehouse getWarehouseById(Long warehouseId) {
        return warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new IllegalArgumentException("Warehouse not found with ID " + warehouseId));
    }
}

package com.skillstorm.project1.services;

import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
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

    public WarehouseService(WarehouseRepository warehouseRepository, InventoryRepository inventoryRepository) {
        this.warehouseRepository = warehouseRepository;
        this.inventoryRepository = inventoryRepository;
    }


    public List<Map<String, Object>> findAllWarehousesWithTotals() {
    List<Warehouse> warehouses = warehouseRepository.findAllByOrderByNameAsc();
    List<Inventory> inventory = inventoryRepository.findAll();
    List<Map<String, Object>> results = new ArrayList<>();
    NumberFormat numberFormat = NumberFormat.getNumberInstance(Locale.US);

    for (Warehouse w : warehouses) {
        int total = inventory.stream()
                .filter(i -> i.getWarehouse().getWarehouseId().equals(w.getWarehouseId()))
                .mapToInt(Inventory::getQuantity)
                .sum();

        Map<String, Object> data = new HashMap<>();
        data.put("warehouseId", w.getWarehouseId());
        data.put("name", w.getName());
        data.put("location", w.getLocation());
        data.put("totalSupply", numberFormat.format(total));
        data.put("capacity", numberFormat.format(w.getCapacity()));
        results.add(data);
    }

    return results;
}
//CREATE WAREHOUSE METHOD
@Transactional
public Warehouse createWarehouse(String name, String location, int capacity) {
    Warehouse warehouse = new Warehouse();
    warehouse.setName(name);
    warehouse.setLocation(location);
    warehouse.setCapacity(capacity);
    return warehouseRepository.save(warehouse);
}
// DELETE WAREHOUSE METHOD
@Transactional
public void deleteWarehouse(Long warehouseId) {
    if (!warehouseRepository.existsById(warehouseId)) {
        throw new IllegalArgumentException("Invalid warehouse ID");
    }
    // First, delete associated inventory records
    warehouseRepository.deleteById(warehouseId);
    // Then, delete the warehouse
    warehouseRepository.deleteById(warehouseId);
}

// EDIT WAREHOUSE METHOD
@Transactional
public Warehouse editWarehouse(Long warehouseId, String name, String location, int capacity) {
    Warehouse warehouse = warehouseRepository.findById(warehouseId)
            .orElseThrow(() -> new IllegalArgumentException("Warehouse not found with ID " + warehouseId));

    warehouse.setName(name);
    warehouse.setLocation(location);
    warehouse.setCapacity(capacity);

    return warehouseRepository.save(warehouse);
}
}
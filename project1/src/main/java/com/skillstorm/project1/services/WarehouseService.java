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

@Service
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final InventoryRepository inventoryRepository;

    public WarehouseService(WarehouseRepository warehouseRepository, InventoryRepository inventoryRepository) {
        this.warehouseRepository = warehouseRepository;
        this.inventoryRepository = inventoryRepository;
    }


    public List<Map<String, Object>> findAllWarehousesWithTotals() {
    List<Warehouse> warehouses = warehouseRepository.findAll();
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
        data.put("location", w.getLocation());
        data.put("totalSupply", numberFormat.format(total));
        data.put("capacity", numberFormat.format(w.getCapacity()));
        results.add(data);
    }

    return results;
}

}

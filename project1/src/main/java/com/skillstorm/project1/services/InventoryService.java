package com.skillstorm.project1.services;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.skillstorm.project1.models.Inventory;
import com.skillstorm.project1.repositories.InventoryRepository;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    public InventoryService(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }

    public Optional<Inventory> getInventoryById(Long id) {
        return inventoryRepository.findById(id);
    }

    public List<Inventory> getInventoryByWarehouse(Long warehouseId) {
        return inventoryRepository.findByWarehouse_WarehouseId(warehouseId);
    }

    public List<Inventory> getInventoryByProduct(Long productId) {
        return inventoryRepository.findByProduct_ProductId(productId);
    }

    public Inventory getInventoryByWarehouseAndProduct(Long warehouseId, Long productId) {
        return inventoryRepository.findByWarehouse_WarehouseIdAndProduct_ProductId(warehouseId, productId);
    }
    
    public int getTotalStockByWarehouseId(Long warehouseId) {
        return inventoryRepository.findByWarehouse_WarehouseId(warehouseId)
                                .stream()
                                .mapToInt(Inventory::getQuantity)
                                .sum();
    }

    public List<Inventory> findBelowMinimumStock(){
        return inventoryRepository.findByQuantityLessThanMinimumStock();
    }


    public Inventory createInventory(Inventory inventory) {
        return inventoryRepository.save(inventory);
    }

    public Inventory updateInventory(Long id, Inventory updatedInventory) {
        return inventoryRepository.findById(id)
                .map(existing -> {
                    existing.setQuantity(updatedInventory.getQuantity());
                    existing.setWarehouse(updatedInventory.getWarehouse());
                    existing.setProduct(updatedInventory.getProduct());
                    return inventoryRepository.save(existing);
                })
                .orElseThrow(() -> new IllegalArgumentException("Inventory not found with ID " + id));
    }

    public void deleteInventory(Long id) {
        if (!inventoryRepository.existsById(id)) {
            throw new IllegalArgumentException("Inventory record not found with ID " + id);
        }
        inventoryRepository.deleteById(id);
    }
}

package com.skillstorm.project1.services;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.skillstorm.project1.models.Inventory;
import com.skillstorm.project1.models.Warehouse;
import com.skillstorm.project1.repositories.InventoryRepository;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    /**
     * Creates an instance of the service with the required repository.
     *
     * @param inventoryRepository repository for inventory data access
     */
    public InventoryService(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    /**
     * Retrieves all inventory records.
     *
     * @return list of all {@link Inventory} entries
     */
    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }

    /**
     * Retrieves a specific inventory record by its ID.
     *
     * @param id the inventory ID
     * @return an {@link Optional} containing the inventory entry if found
     */
    public Optional<Inventory> getInventoryById(Long id) {
        return inventoryRepository.findById(id);
    }

    /**
     * Retrieves all inventory entries for a specific warehouse,
     * sorted by product name.
     *
     * @param warehouseId the warehouse ID
     * @return list of inventory entries for the warehouse
     */
    public List<Inventory> getInventoryByWarehouse(Long warehouseId) {
        return inventoryRepository.findByWarehouse_WarehouseIdOrderByProduct_ProductNameAsc(warehouseId);
    }

    /**
     * Retrieves all inventory entries for a specific product.
     *
     * @param productId the product ID
     * @return list of inventory entries for the product
     */
    public List<Inventory> getInventoryByProduct(Long productId) {
        return inventoryRepository.findByProduct_ProductId(productId);
    }

    /**
     * Retrieves an inventory entry for the given warehouse and product.
     *
     * @param warehouseId the warehouse ID
     * @param productId the product ID
     * @return the matching inventory entry or {@code null} if none exists
     */
    public Inventory getInventoryByWarehouseAndProduct(Long warehouseId, Long productId) {
        return inventoryRepository.findByWarehouse_WarehouseIdAndProduct_ProductId(warehouseId, productId);
    }
    
    /**
     * Calculates total quantity of all inventory items within a warehouse.
     *
     * @param warehouseId the warehouse ID
     * @return total stock count
     */
    public int getTotalStockByWarehouseId(Long warehouseId) {
        return inventoryRepository.findByWarehouse_WarehouseId(warehouseId)
                                .stream()
                                .mapToInt(Inventory::getQuantity)
                                .sum();
    }

    /**
     * Retrieves all inventory entries where the quantity is below the minimum stock.
     *
     * @return list of low-stock inventory entries
     */
    public List<Inventory> findBelowMinimumStock(){
        return inventoryRepository.findByQuantityLessThanMinimumStock();
    }

    /**
     * Creates a new inventory entry.
     *
     * @param inventory the inventory object to save
     * @return the saved inventory entry
     */
    public Inventory createInventory(Inventory inventory) {
        return inventoryRepository.save(inventory);
    }

    /**
     * Reduces the inventory amount for a specific warehouse/product pair.
     *
     * @param warehouseId the warehouse ID
     * @param productId the product ID
     * @param amount amount to subtract
     * @throws IllegalArgumentException if no matching inventory record exists
     */
    public void reduceInventory(Long warehouseId, Long productId, int amount) {
        Inventory inv = inventoryRepository.findByWarehouse_WarehouseIdAndProduct_ProductId(warehouseId, productId);
        if (inv == null) {
            throw new IllegalArgumentException("Inventory record not found for the given warehouse and product IDs.");
        }

        inv.setQuantity(inv.getQuantity() - amount);
        inventoryRepository.save(inv);
    }

    /**
     * Deletes an inventory entry by its ID.
     *
     * @param id the inventory ID
     * @throws IllegalArgumentException if the inventory ID does not exist
     */
    public void deleteInventory(Long id) {
        if (!inventoryRepository.existsById(id)) {
            throw new IllegalArgumentException("Inventory record not found with ID " + id);
        }
        inventoryRepository.deleteById(id);
    }

    /**
     * Transfers inventory quantity from one warehouse to another.
     *
     * @param source the source inventory record
     * @param targetWarehouse the destination warehouse
     * @param amount amount of stock to transfer
     */
    public void transferInventory(Inventory source, Warehouse targetWarehouse, int amount) {
        // 1. Subtract from source warehouse
        source.setQuantity(source.getQuantity() - amount);
        inventoryRepository.save(source);

        // 2. Check if target warehouse already has this product
        Inventory target = inventoryRepository.findByWarehouseAndProduct(
                targetWarehouse, source.getProduct());

        if (target != null) {
            target.setQuantity(target.getQuantity() + amount);
            inventoryRepository.save(target);
        } else {
            Inventory newInv = new Inventory(
                    targetWarehouse,
                    source.getProduct(),
                    amount,
                    source.getMinimumStock(),
                    source.getWarehouseLocation()
            );
            inventoryRepository.save(newInv);
        }
    }

    /**
     * Updates an inventory entry's warehouse location and minimum stock.
     *
     * @param inventoryId the inventory ID
     * @param newLocation new warehouse location value
     * @param newMinStock new minimum stock value
     * @throws IllegalArgumentException if the inventory entry does not exist
     */
    public void updateInventoryLocationAndMinStock(Long inventoryId, int newLocation, int newMinStock) {
        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new IllegalArgumentException("Inventory record not found with ID " + inventoryId));

        inventory.setWarehouseLocation(newLocation);
        inventory.setMinimumStock(newMinStock);
        inventoryRepository.save(inventory);
    }

}

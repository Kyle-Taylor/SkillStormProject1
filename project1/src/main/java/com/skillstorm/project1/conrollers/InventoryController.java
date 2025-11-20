package com.skillstorm.project1.conrollers;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.skillstorm.project1.models.Inventory;
import com.skillstorm.project1.models.Warehouse;
import com.skillstorm.project1.services.InventoryService;
import com.skillstorm.project1.services.WarehouseService;

@RestController
@RequestMapping("/inventory")
@CrossOrigin(origins = "*")
/**
 * Controller providing REST endpoints for managing inventory records.
 * Handles CRUD operations, filtering, stock checks, and warehouse transfers.
 */
public class InventoryController {

    /** Service layer for inventory business logic. */
    private final InventoryService inventoryService;

    /** Service layer for warehouse operations. */
    private final WarehouseService warehouseService;

    /**
     * Constructor-based dependency injection.
     *
     * @param inventoryService service handling inventory operations
     * @param warehouseService service handling warehouse lookups and updates
     */
    public InventoryController(InventoryService inventoryService, WarehouseService warehouseService) {
        this.inventoryService = inventoryService;
        this.warehouseService = warehouseService;
    }

    // ==============================================
    // GET ALL INVENTORY
    // ==============================================

    /**
     * Retrieves all inventory records in the system.
     *
     * @return list of all {@link Inventory} items
     */
    @GetMapping
    public ResponseEntity<List<Inventory>> findAllInventory() {
        try {
            List<Inventory> inventory = inventoryService.getAllInventory();
            return new ResponseEntity<>(inventory, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .header("Error", "An internal error occurred while retrieving inventory.")
                    .build();
        }
    }

    // ==============================================
    // GET INVENTORY BY ID
    // ==============================================

    /**
     * Retrieves a specific inventory record by its ID.
     *
     * @param id unique ID of the inventory record
     * @return inventory record if found
     */
    @GetMapping("/{id}")
    public ResponseEntity<Inventory> findInventoryById(@PathVariable Long id) {
        try {
            Inventory inventory = inventoryService.getInventoryById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Inventory record not found with ID " + id));
            return new ResponseEntity<>(inventory, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .header("Error", e.getMessage())
                    .build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .header("Error", "Unexpected error retrieving inventory record.")
                    .build();
        }
    }

    // ==============================================
    // GET INVENTORY BY WAREHOUSE
    // ==============================================

    /**
     * Retrieves all inventory records associated with a specific warehouse.
     *
     * @param warehouseId warehouse ID
     * @return list of inventory items stored in that warehouse
     */
    @GetMapping("/warehouse/{warehouseId}")
    public ResponseEntity<List<Inventory>> findByWarehouse(@PathVariable Long warehouseId) {
        try {
            List<Inventory> inventory = inventoryService.getInventoryByWarehouse(warehouseId);
            return new ResponseEntity<>(inventory, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .header("Error", "Error fetching inventory for warehouse ID " + warehouseId)
                    .build();
        }
    }

    // ==============================================
    // GET INVENTORY BY PRODUCT
    // ==============================================

    /**
     * Retrieves all inventory rows that contain a specific product.
     *
     * @param productId product ID
     * @return list of related inventory items
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Inventory>> findByProduct(@PathVariable Long productId) {
        try {
            List<Inventory> inventory = inventoryService.getInventoryByProduct(productId);
            return new ResponseEntity<>(inventory, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .header("Error", "Error fetching inventory for product ID " + productId)
                    .build();
        }
    }

    // ==============================================
    // GET STOCK BELOW MINIMUM
    // ==============================================

    /**
     * Returns all inventory items with quantity lower than their minimum stock level.
     *
     * @return list of low-stock inventory records
     */
    @GetMapping("/below-minimum")
    public ResponseEntity<List<Inventory>> findBelowMinimumStock() {
        try {
            List<Inventory> items = inventoryService.findBelowMinimumStock();
            return new ResponseEntity<>(items, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .header("Error", "Failed to retrieve low-stock items.")
                    .build();
        }
    }

    // ==============================================
    // CREATE INVENTORY
    // ==============================================

    /**
     * Creates a new inventory record.
     *
     * @param inventory inventory object to create
     * @return created inventory row
     */
    @PostMapping
    public ResponseEntity<Inventory> createInventory(@RequestBody Inventory inventory) {
        try {
            Inventory created = inventoryService.createInventory(inventory);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .header("Error", e.getMessage())
                    .build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .header("Error", "Error creating inventory record.")
                    .build();
        }
    }

    // ==============================================
    // REDUCE INVENTORY
    // ==============================================

    /**
     * Reduces inventory quantity for a given warehouse + product combination.
     *
     * @param payload contains warehouseId, productId, and amount
     * @return empty OK response on success
     */
    @PutMapping("/reduce")
    public ResponseEntity<Void> reduceInventory(@RequestBody Map<String, Object> payload) {

        Long warehouseId = Long.valueOf(payload.get("warehouseId").toString());
        Long productId   = Long.valueOf(payload.get("productId").toString());
        int amount       = Integer.parseInt(payload.get("amount").toString());

        inventoryService.reduceInventory(warehouseId, productId, amount);

        return ResponseEntity.ok().build();
    }

    // ==============================================
    // DELETE INVENTORY
    // ==============================================

    /**
     * Deletes an inventory record.
     *
     * @param id inventory ID
     * @return HTTP 204 on success
     */
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteInventory(@PathVariable Long id) {
        try {
            inventoryService.deleteInventory(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .header("Error", e.getMessage())
                    .build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .header("Error", "Error deleting inventory record.")
                    .build();
        }
    }

    // ==============================================
    // TRANSFER INVENTORY
    // ==============================================

    /**
     * Transfers a quantity of inventory from one warehouse record to another warehouse.
     *
     * @param inventoryId ID of inventory record being transferred from
     * @param newWarehouseId destination warehouse ID
     * @param request contains the amount to transfer
     */
    @PutMapping("/transfer/{inventoryId}/{newWarehouseId}")
    public void transferInventory(@PathVariable Long inventoryId,@PathVariable Long newWarehouseId,@RequestBody Map<String, Object> request) {
        int amount = (int) request.get("amount");
        Inventory inventory = inventoryService.getInventoryById(inventoryId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Inventory record not found with ID " + inventoryId));

        if (amount <= 0 || amount > inventory.getQuantity()) {
            throw new IllegalArgumentException("Invalid transfer amount: " + amount);
        }

        Warehouse newWarehouse = warehouseService.getWarehouseById(newWarehouseId);
        inventoryService.transferInventory(inventory, newWarehouse, amount);
    }

    /**
     * Updates warehouse location and minimum stock for an inventory record.
     *
     * @param inventoryId ID of inventory record
     * @param request map containing warehouseLocation and minimumStock values
     * @return HTTP 200 on success
     */
    @PutMapping("/update_locationAndMinStock/{inventoryId}")
    public ResponseEntity<Void> updateInventoryLocation(@PathVariable Long inventoryId, @RequestBody Map<String, Object> request) {
        int newLocation = (int) request.get("warehouseLocation");
        int newMinStock = (int) request.get("minimumStock");
        inventoryService.updateInventoryLocationAndMinStock(inventoryId, newLocation, newMinStock);
        return ResponseEntity.ok().build();
    }

}

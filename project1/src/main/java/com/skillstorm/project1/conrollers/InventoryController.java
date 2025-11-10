package com.skillstorm.project1.conrollers;

import java.util.List;

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
import com.skillstorm.project1.services.InventoryService;

@RestController
@RequestMapping("/inventory")
@CrossOrigin(origins = "*")
public class InventoryController {

    private final InventoryService inventoryService;

    // Constructor-based injection
    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    // ==============================================
    // GET ALL INVENTORY
    // ==============================================
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
    // GET INVENTORY BY WAREHOUSE ****
    // ==============================================
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
    // CREATE INVENTORY RECORD
    // ==============================================
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
    // UPDATE INVENTORY RECORD
    // ==============================================
    @PutMapping("/{id}")
    public ResponseEntity<Inventory> updateInventory(@PathVariable Long id, @RequestBody Inventory updated) {
        try {
            Inventory result = inventoryService.updateInventory(id, updated);
            return new ResponseEntity<>(result, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .header("Error", e.getMessage())
                    .build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .header("Error", "Error updating inventory record.")
                    .build();
        }
    }

    // ==============================================
    // DELETE INVENTORY RECORD
    // ==============================================
    @DeleteMapping("/{id}")
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
}

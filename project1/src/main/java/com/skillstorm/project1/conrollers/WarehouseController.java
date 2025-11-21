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

import com.skillstorm.project1.models.Warehouse;
import com.skillstorm.project1.services.WarehouseService;

@RestController
@RequestMapping("/warehouses")
@CrossOrigin(origins = "http://localhost:8080", allowCredentials = "true")
public class WarehouseController {

    private final WarehouseService warehouseService;

    /**
     * Constructor-based injection for WarehouseService.
     *
     * @param warehouseService service used for warehouse operations
     */
    public WarehouseController(WarehouseService warehouseService) {
        this.warehouseService = warehouseService;
    }

    /**
     * Retrieves all warehouses including their total inventory values.
     *
     * @return list of warehouses wrapped in a ResponseEntity
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> findAllWarehouses() {
        try {
            List<Map<String, Object>> warehouses = warehouseService.findAllWarehousesWithTotals();
            return new ResponseEntity<>(warehouses, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Creates a new warehouse.
     *
     * @param payload JSON containing name, location, and capacity
     * @return created warehouse
     */
    @PostMapping("/create_warehouse")
    public ResponseEntity<Warehouse> createWarehouse(@RequestBody Map<String, Object> payload) {
        try {
            Warehouse created = warehouseService.createWarehouse(
                payload.get("name").toString(),
                payload.get("location").toString(),
                Integer.parseInt(payload.get("capacity").toString())
            );
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (NumberFormatException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Deletes a warehouse by its ID.
     *
     * @param id warehouse ID
     * @return no-content response if successful
     */
    @DeleteMapping("/delete_warehouse/{id}")
    public ResponseEntity<Void> deleteWarehouse(@PathVariable Long id) {
        try {
            warehouseService.deleteWarehouse(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (NumberFormatException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Updates an existing warehouse.
     *
     * @param id warehouse ID
     * @param payload JSON containing updated name, location, and capacity
     * @return updated warehouse
     */
    @PutMapping("/edit_warehouse/{id}")
    public ResponseEntity<Warehouse> editWarehouse(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            Warehouse updated = warehouseService.editWarehouse(
                id,
                payload.get("name").toString(),
                payload.get("location").toString(),
                Integer.parseInt(payload.get("capacity").toString())
            );
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (NumberFormatException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Retrieves a single warehouse by its ID.
     *
     * @param id warehouse ID
     * @return warehouse wrapped in ResponseEntity
     */
    @GetMapping("/{id}")
    public ResponseEntity<Warehouse> getWarehouseById(@PathVariable Long id) {
        try {
            Warehouse warehouse = warehouseService.getWarehouseById(id);
            return new ResponseEntity<>(warehouse, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}

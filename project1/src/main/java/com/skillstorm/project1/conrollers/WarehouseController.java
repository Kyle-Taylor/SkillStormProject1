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
@CrossOrigin(origins = "*")
public class WarehouseController {

    private final WarehouseService warehouseService;

    public WarehouseController(WarehouseService warehouseService) {
        this.warehouseService = warehouseService;
    }

    // ==============================================
    // GET ALL WAREHOUSES
    // ==============================================
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> findAllWarehouses() {
        try {
            List<Map<String, Object>> warehouses = warehouseService.findAllWarehousesWithTotals();
            return new ResponseEntity<>(warehouses, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    // ==============================================
    // CREATE WAREHOUSE
    // ==============================================
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
    
    @DeleteMapping("/delete_warehouse/{id}")
    public ResponseEntity<Void> deleteWarehouse(@PathVariable Long id) {
            try {
                warehouseService.deleteWarehouse(id);
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            } catch (NumberFormatException e) {
                return ResponseEntity.internalServerError().build();
            }
        }

    //put request to edit warehouse
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
}

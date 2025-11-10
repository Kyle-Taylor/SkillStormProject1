package com.skillstorm.project1.conrollers;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

}

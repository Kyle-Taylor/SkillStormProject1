package com.skillstorm.project1.conrollers;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.skillstorm.project1.models.RestockOrder;
import com.skillstorm.project1.services.RestockOrderService;

@RestController
@RequestMapping("/restocks")
@CrossOrigin(origins = "*")
public class RestockOrderController {

    private final RestockOrderService restockService;

    public RestockOrderController(RestockOrderService restockService) {
        this.restockService = restockService;
    }

    // ==========================================
    // GET ALL RESTOCK ORDERS
    // ==========================================
    @GetMapping
    public ResponseEntity<List<RestockOrder>> findAllRestockOrders() {
        try {
            List<RestockOrder> restocks = restockService.findAllRestockOrders();
            return new ResponseEntity<>(restocks, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .header("Error", "An error occurred while fetching restock orders.")
                    .build();
        }
    }

    // ==========================================
    // GET RESTOCK ORDERS BY WAREHOUSE ID
    // ==========================================
    @GetMapping("/warehouse/{warehouseId}")
    public ResponseEntity<List<RestockOrder>> findByWarehouse(@PathVariable Long warehouseId) {
        try {
            List<RestockOrder> restocks = restockService.findByWarehouseId(warehouseId);
            return new ResponseEntity<>(restocks, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .header("Error", "An error occurred while fetching restocks for warehouse ID " + warehouseId)
                    .build();
        }
    }

    @PostMapping("/create_restock")
    public ResponseEntity<RestockOrder> createRestockOrder(@RequestBody Map<String, Object> payload) {
        try {
            Long warehouseId = Long.valueOf(payload.get("warehouseId").toString());
            Long productId = Long.valueOf(payload.get("productId").toString());
            int amount = Integer.parseInt(payload.get("amount").toString());
            String orderedBy = payload.get("orderedBy").toString();

            RestockOrder created = restockService.createRestockOrder(warehouseId, productId, amount, orderedBy);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (NumberFormatException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

}

package com.skillstorm.project1.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.skillstorm.project1.models.RestockOrder;
import com.skillstorm.project1.repositories.RestockOrderRepository;

@Service
public class RestockOrderService {

    private final RestockOrderRepository restockRepository;

    public RestockOrderService(RestockOrderRepository restockRepository) {
        this.restockRepository = restockRepository;
    }

    // Get all restock orders
    public List<RestockOrder> findAllRestockOrders() {
        return restockRepository.findAll();
    }

    // Get restock orders by warehouse ID
    public List<RestockOrder> findByWarehouseId(Long warehouseId) {
        return restockRepository.findAllByWarehouse_WarehouseId(warehouseId);
    }
}

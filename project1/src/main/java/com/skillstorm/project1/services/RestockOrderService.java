package com.skillstorm.project1.services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.skillstorm.project1.models.Inventory;
import com.skillstorm.project1.models.Product;
import com.skillstorm.project1.models.RestockOrder;
import com.skillstorm.project1.models.Warehouse;
import com.skillstorm.project1.repositories.InventoryRepository;
import com.skillstorm.project1.repositories.ProductRepository;
import com.skillstorm.project1.repositories.RestockOrderRepository;
import com.skillstorm.project1.repositories.WarehouseRepository;

import jakarta.transaction.Transactional;

@Service
public class RestockOrderService {

    private final RestockOrderRepository restockRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;

    public RestockOrderService(RestockOrderRepository restockRepository, WarehouseRepository warehouseRepository, 
                               ProductRepository productRepository, InventoryRepository inventoryRepository) {
        this.restockRepository = restockRepository;
        this.warehouseRepository = warehouseRepository;
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
    }

    // Get all restock orders
    public List<RestockOrder> findAllRestockOrders() {
        return restockRepository.findAll();
    }

    // Get restock orders by warehouse ID
    public List<RestockOrder> findByWarehouseId(Long warehouseId) {
        return restockRepository.findAllByWarehouse_WarehouseId(warehouseId);
    }

    @Transactional
    public RestockOrder createRestockOrder(Long warehouseId, Long productId, int amount, String orderedBy) {
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
            .orElseThrow(() -> new IllegalArgumentException("Invalid warehouse ID"));
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new IllegalArgumentException("Invalid product ID"));

        // Find or create the inventory record
        Inventory inventory = inventoryRepository.findByWarehouse_WarehouseIdAndProduct_ProductId(warehouseId, productId);
        if (inventory == null) {
            inventory = new Inventory(warehouse, product, 0, 0);
        }

        // Update quantity and timestamp
        inventory.setQuantity(inventory.getQuantity() + amount);
        inventory.setLastUpdated(LocalDateTime.now());
        inventoryRepository.save(inventory);

        // Create restock order
        RestockOrder order = new RestockOrder(warehouse, product, product.getSupplier(), amount, orderedBy);
        order.setRestockRef(System.currentTimeMillis()); // simple unique ref
        return restockRepository.save(order);
    }

}

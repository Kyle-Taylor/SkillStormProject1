package com.skillstorm.project1.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.skillstorm.project1.models.Inventory;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    // Find all inventory entries belonging to a specific warehouse
    List<Inventory> findByWarehouse_WarehouseId(Long warehouseId);

    // Find all inventory entries for a specific product
    List<Inventory> findByProduct_ProductId(Long productId);

    // Find one specific inventory record by warehouse and product
    Inventory findByWarehouse_WarehouseIdAndProduct_ProductId(Long warehouseId, Long productId);
}

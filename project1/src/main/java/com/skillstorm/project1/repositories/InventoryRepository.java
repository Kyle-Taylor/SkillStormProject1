package com.skillstorm.project1.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.skillstorm.project1.models.Inventory;
import com.skillstorm.project1.models.Product;
import com.skillstorm.project1.models.Warehouse;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    /**
     * Returns all inventory records for the given warehouse.
     *
     * @param warehouseId the ID of the warehouse
     * @return list of inventory records
     */
    List<Inventory> findByWarehouse_WarehouseId(Long warehouseId);

    /**
     * Returns all inventory records for the given warehouse,
     * ordered alphabetically by product name.
     *
     * @param warehouseId the ID of the warehouse
     * @return sorted list of inventory records
     */
    List<Inventory> findByWarehouse_WarehouseIdOrderByProduct_ProductNameAsc(Long warehouseId);

    /**
     * Returns all inventory entries belonging to a specific product.
     *
     * @param productId the ID of the product
     * @return list of inventory records
     */
    List<Inventory> findByProduct_ProductId(Long productId);

    /**
     * Finds a single inventory record for the given warehouse/product combination.
     *
     * @param warehouseId the warehouse ID
     * @param productId   the product ID
     * @return matching inventory record, or null if none exists
     */
    Inventory findByWarehouse_WarehouseIdAndProduct_ProductId(Long warehouseId, Long productId);

    /**
     * Retrieves all inventory entries where the current quantity
     * is below the defined minimum stock level.
     *
     * @return list of low-stock inventory entries
     */
    @Query("SELECT i FROM Inventory i WHERE i.quantity < i.minimumStock")
    List<Inventory> findByQuantityLessThanMinimumStock();

    /**
     * Finds an inventory row that matches both a Warehouse and a Product.
     *
     * @param warehouse the warehouse entity
     * @param product   the product entity
     * @return matching inventory record, or null if none exists
     */
    Inventory findByWarehouseAndProduct(Warehouse warehouse, Product product);

}

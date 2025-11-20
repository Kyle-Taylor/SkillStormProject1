package com.skillstorm.project1.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.skillstorm.project1.models.RestockOrder;

@Repository
public interface RestockOrderRepository extends JpaRepository<RestockOrder, Long> {

    /**
     * Retrieves all restock orders for a specific warehouse.
     *
     * @param warehouseId the warehouse ID to filter by
     * @return list of restock orders assigned to the warehouse
     */
    List<RestockOrder> findAllByWarehouse_WarehouseId(Long warehouseId);
}

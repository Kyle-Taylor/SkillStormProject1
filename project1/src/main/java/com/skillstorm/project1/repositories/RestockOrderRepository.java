package com.skillstorm.project1.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.skillstorm.project1.models.RestockOrder;

@Repository
public interface RestockOrderRepository extends JpaRepository<RestockOrder, Long> {

    // Find all restocks by a specific warehouse
    List<RestockOrder> findAllByWarehouse_WarehouseId(Long warehouseId);
}

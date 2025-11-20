package com.skillstorm.project1.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.skillstorm.project1.models.Warehouse;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, Long>{

    /**
     * Retrieves all warehouses sorted alphabetically by name.
     *
     * @return a list of {@link Warehouse} objects ordered by name ascending
     */
    List<Warehouse> findAllByOrderByNameAsc();
}

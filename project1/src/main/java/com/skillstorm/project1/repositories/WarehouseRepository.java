package com.skillstorm.project1.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.skillstorm.project1.models.Warehouse;

public interface WarehouseRepository extends JpaRepository<Warehouse, Long>{
    List<Warehouse> findAllByOrderByNameAsc();
}

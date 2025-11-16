package com.skillstorm.project1.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.skillstorm.project1.models.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // Custom queries later
    Product findByProductName(String productName);
    List<Product> findAllByOrderByProductNameAsc();
}

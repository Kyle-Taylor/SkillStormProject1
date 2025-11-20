package com.skillstorm.project1.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.skillstorm.project1.models.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    /**
     * Finds a product by its unique name.
     *
     * @param productName the exact product name to search for
     * @return the matching {@link Product}, or null if none exists
     */
    Product findByProductName(String productName);

    /**
     * Retrieves all products sorted alphabetically by product name.
     *
     * @return a list of {@link Product} entities sorted by name (ascending)
     */
    List<Product> findAllByOrderByProductNameAsc();

    /**
     * Checks whether a product exists with the given name.
     *
     * @param productName the name to check
     * @return true if a {@link Product} with that name exists, false otherwise
     */
    boolean existsByProductName(String productName);
}

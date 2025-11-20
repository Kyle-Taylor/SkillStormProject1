package com.skillstorm.project1.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.skillstorm.project1.models.Supplier;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {

    /**
     * Checks whether a supplier already exists with the given name.
     *
     * @param name the supplier name to check
     * @return true if a supplier with the given name exists, false otherwise
     */
    boolean existsByName(String name);
}

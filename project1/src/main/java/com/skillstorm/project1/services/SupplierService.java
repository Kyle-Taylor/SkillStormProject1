package com.skillstorm.project1.services;

import org.springframework.stereotype.Service;

import com.skillstorm.project1.repositories.SupplierRepository;

@Service
public class SupplierService {
    private final SupplierRepository supplierRepository;
    
    public SupplierService(SupplierRepository supplierRepository) {
        this.supplierRepository = supplierRepository;
    }

    // Find supplier by ID
    public com.skillstorm.project1.models.Supplier getSupplierById(Long id) {
        return supplierRepository.findById(id).orElse(null);
    }
    // find all suppliers
    public java.util.List<com.skillstorm.project1.models.Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }
}

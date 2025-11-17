package com.skillstorm.project1.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.skillstorm.project1.models.Supplier;
import com.skillstorm.project1.repositories.SupplierRepository;

import jakarta.transaction.Transactional;

@Service
public class SupplierService {
    private final SupplierRepository supplierRepository;
    
    public SupplierService(SupplierRepository supplierRepository) {
        this.supplierRepository = supplierRepository;
    }

    // Find supplier by ID
    public Supplier getSupplierById(Long id) {
        return supplierRepository.findById(id).orElse(null);
    }
    // find all suppliers
    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }
    // EDIT SUPPLIER METHOD
    @Transactional
    public Supplier editSupplier(Long supplierId, String name, String contactEmail, String phone, String address) {
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new IllegalArgumentException("Supplier not found with ID " + supplierId));
        supplier.setName(name);
        supplier.setContactEmail(contactEmail);
        supplier.setPhone(phone);
        supplier.setAddress(address);
    return supplierRepository.save(supplier);
    }
    // DELETE SUPPLIER METHOD
    @Transactional
    public void deleteSupplier(Long supplierId) {
        supplierRepository.deleteById(supplierId);
    }
    
    // CREATE SUPPLIER METHOD
    public Supplier createSupplier(Supplier supplier) {
        if (supplierRepository.existsByName(supplier.getName())) {
            throw new IllegalStateException("DUPLICATE_SUPPLIER_NAME");
    }
        return supplierRepository.save(supplier);
    }
}

package com.skillstorm.project1.conrollers;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.skillstorm.project1.services.SupplierService;


@RestController
@RequestMapping("/suppliers")
@CrossOrigin(origins = "*")
public class SupplierController {
    // find suppliers by id
    private final SupplierService supplierService;
    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    @GetMapping("/{id}")
    public com.skillstorm.project1.models.Supplier getSupplierById(@PathVariable Long id) {
        try {
            return supplierService.getSupplierById(id);
        } catch (Exception e) {
            return null;
        }
    }

    @GetMapping
    public java.util.List<com.skillstorm.project1.models.Supplier> getAllSuppliers() {
        try {
            return supplierService.getAllSuppliers();
        } catch (Exception e) {
            return null;
        }   
    }
    
}

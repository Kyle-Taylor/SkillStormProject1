package com.skillstorm.project1.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.skillstorm.project1.models.Supplier;
import com.skillstorm.project1.repositories.SupplierRepository;

import jakarta.transaction.Transactional;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;

    /**
     * Constructs a new SupplierService with the required repository.
     *
     * @param supplierRepository repository for supplier data access
     */
    public SupplierService(SupplierRepository supplierRepository) {
        this.supplierRepository = supplierRepository;
    }

    /**
     * Retrieves a supplier by its ID.
     *
     * @param id the supplier ID
     * @return the supplier if found, otherwise {@code null}
     */
    public Supplier getSupplierById(Long id) {
        return supplierRepository.findById(id).orElse(null);
    }

    /**
     * Retrieves all suppliers.
     *
     * @return list of all suppliers
     */
    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }

    /**
     * Updates an existing supplier with new values.
     *
     * @param supplierId    ID of the supplier to edit
     * @param name          new name
     * @param contactEmail  new email
     * @param phone         new phone number
     * @param address       new address
     * @return the updated supplier
     * @throws IllegalArgumentException if the supplier does not exist
     */
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

    /**
     * Deletes a supplier by its ID.
     *
     * @param supplierId the supplier ID
     */
    @Transactional
    public void deleteSupplier(Long supplierId) {
        supplierRepository.deleteById(supplierId);
    }

    /**
     * Creates a new supplier, preventing duplicate names.
     *
     * @param supplier the supplier to create
     * @return the saved supplier
     * @throws IllegalStateException if a supplier with the same name already exists
     */
    public Supplier createSupplier(Supplier supplier) {
        if (supplierRepository.existsByName(supplier.getName())) {
            throw new IllegalStateException("DUPLICATE_SUPPLIER_NAME");
        }
        return supplierRepository.save(supplier);
    }
}

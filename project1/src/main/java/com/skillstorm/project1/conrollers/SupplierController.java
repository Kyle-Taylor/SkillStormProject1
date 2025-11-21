package com.skillstorm.project1.conrollers;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.skillstorm.project1.models.Supplier;
import com.skillstorm.project1.services.SupplierService;

@RestController
@RequestMapping("/suppliers")
@CrossOrigin(origins = "http://localhost:8080", allowCredentials = "true")
public class SupplierController {

    /** 
     * Service used to perform CRUD operations on Supplier entities.
     */
    private final SupplierService supplierService;

    /**
     * Constructor for dependency injection.
     * 
     * @param supplierService the SupplierService to use
     */
    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    /**
     * Retrieves a supplier by its ID.
     *
     * @param id the supplier ID
     * @return the Supplier object, or null if not found or error occurs
     */
    @GetMapping("/{id}")
    public Supplier getSupplierById(@PathVariable Long id) {
        try {
            return supplierService.getSupplierById(id);
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Updates an existing supplier.
     *
     * @param id the supplier ID
     * @param payload a map containing supplier fields to update
     * @return ResponseEntity containing the updated supplier or an error response
     */
    @PutMapping("/edit_supplier/{id}")
    public ResponseEntity<Supplier> editSupplier(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            Supplier updated = supplierService.editSupplier(
                id,
                payload.get("name").toString(),
                payload.get("contactEmail").toString(),
                payload.get("phone").toString(),
                payload.get("address").toString()
            );
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (NumberFormatException e) {
            return ResponseEntity.internalServerError().build();
        }
        catch (Exception e) {
            return ResponseEntity.internalServerError()
            .header("Error: ", "Sorry! We have an internal Error! Please check back later.")
            .build();
        }
    }

    /**
     * Retrieves all suppliers in the system.
     *
     * @return ResponseEntity containing a list of all suppliers or an error response
     */
    @GetMapping()
    public ResponseEntity<List<Supplier>> getAllSuppliers() {
        try {
            return new ResponseEntity<>(supplierService.getAllSuppliers(),HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
            .header("Error: ", "Sorry! We have an internal Error! Please check back later.")
            .build();
        }
    }
    
    /**
     * Deletes a supplier by ID.
     *
     * @param id the supplier ID
     * @return ResponseEntity with no content or an error response
     */
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteSupplier(@PathVariable Long id) {
        try {
            supplierService.deleteSupplier(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
            .header("Error: ", "Sorry! We have an internal Error! Please check back later.")
            .build();
        }
    }
    
    /**
     * Creates a new supplier.
     *
     * @param payload a map containing supplier fields
     * @return ResponseEntity with the created supplier or an error response
     */
    @PostMapping("/create_supplier")
    public ResponseEntity<Supplier> createSupplier(@RequestBody Map<String, Object> payload) {
        try {
            String supplierName = payload.get("name").toString();
            String contactEmail = payload.get("contactEmail").toString();
            String phone = payload.get("phone").toString();
            String address = payload.get("address").toString();

            Supplier supplier = new Supplier();
            supplier.setName(supplierName);
            supplier.setContactEmail(contactEmail);
            supplier.setPhone(phone);
            supplier.setAddress(address);
            
            Supplier created = supplierService.createSupplier(supplier);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        }
        catch (IllegalStateException e) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .header("Error", "Product name already exists")
                        .build();
            }
        catch (Exception e) {
            return ResponseEntity.internalServerError()
            .header("Error: ", "Sorry! We have an internal Error! Please check back later.")
            .build();
    }
    }

}

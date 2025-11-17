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
@CrossOrigin(origins = "*")
public class SupplierController {
    // injection for supplierService
    private final SupplierService supplierService;
    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    // Get supplier by ID
    @GetMapping("/{id}")
    public Supplier getSupplierById(@PathVariable Long id) {
        try {
            return supplierService.getSupplierById(id);
        } catch (Exception e) {
            return null;
        }
    }

    //put request to edit supplier
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

    // Get all suppliers
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
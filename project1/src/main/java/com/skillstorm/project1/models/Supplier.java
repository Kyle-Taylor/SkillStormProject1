package com.skillstorm.project1.models;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

/**
 * Represents a supplier entity in the system.
 * Stores supplier details such as contact info and address.
 * 
 * Mapped to the "suppliers" table.
 */
@Entity
@Table(name = "suppliers")
public class Supplier {

    /**
     * Primary key for the supplier.
     * Auto-generated.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long supplierId;

    /**
     * Supplier business name.
     * Cannot be null.
     */
    @Column(nullable = false)
    private String name;

    /** Supplier contact email address. */
    private String contactEmail;

    /** Supplier phone number. */
    private String phone;

    /** Supplier physical address. */
    private String address;

    /**
     * List of restock orders created through this supplier.
     * Ignored in JSON to prevent recursion.
     */
    @OneToMany(mappedBy = "supplier")
    @JsonIgnore
    private List<RestockOrder> restockOrders;

    /**
     * List of products associated with this supplier.
     * Ignored in JSON to prevent recursion.
     */
    @OneToMany(mappedBy = "supplier")
    @JsonIgnore
    private List<Product> products;

    /** Default constructor. */
    public Supplier() {}

    /**
     * Full constructor for manually creating a supplier.
     */
    public Supplier(String name, String contactEmail, String phone, String address) {
        this.name = name;
        this.contactEmail = contactEmail;
        this.phone = phone;
        this.address = address;
    }

    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public List<RestockOrder> getRestockOrders() { return restockOrders; }
    public void setRestockOrders(List<RestockOrder> restockOrders) { this.restockOrders = restockOrders; }

    public List<Product> getProducts() { return products; }
    public void setProducts(List<Product> products) { this.products = products; }
}

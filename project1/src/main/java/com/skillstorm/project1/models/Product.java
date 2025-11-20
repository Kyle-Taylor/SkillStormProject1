package com.skillstorm.project1.models;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

/**
 * Represents a product stored in the system.
 * Each product can appear in multiple inventory records across warehouses.
 */
@Entity
@Table(name = "products")
public class Product {

    /**
     * Primary key for the product.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productId;

    /**
     * The name of the product.
     * Must be unique across all products.
     */
    @Column(nullable = false, unique = true)
    private String productName;

    /**
     * The price of this product.
     */
    @Column(nullable = false)
    private double price;

    /**
     * Optional category designation for the product.
     */
    private String category;

    /**
     * Many-to-one relationship linking this product to a supplier.
     */
    @ManyToOne
    @JoinColumn(name = "supplier_id", referencedColumnName = "supplierId", nullable = true)
    private Supplier supplier;

    /**
     * Inventory records that reference this product.
     * Ignored during JSON serialization to avoid circular references.
     */
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Inventory> inventory;

    /**
     * Default constructor.
     */
    public Product() {}

    /**
     * Constructs a new product with the given fields.
     *
     * @param productName the product name
     * @param price       the price of the product
     * @param category    the product category
     * @param supplier    the supplier reference
     */
    public Product(String productName, double price, String category, Supplier supplier) {
        this.productName = productName;
        this.price = price;
        this.category = category;
        this.supplier = supplier;
    }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Supplier getSupplier() { return supplier; }
    public void setSupplier(Supplier supplier) { this.supplier = supplier; }

    public List<Inventory> getInventory() { return inventory; }
    public void setInventory(List<Inventory> inventory) { this.inventory = inventory; }
}

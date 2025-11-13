package com.skillstorm.project1.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.skillstorm.project1.models.Checkout;

public interface CheckoutRepository extends JpaRepository<Checkout, Long> {
    
}

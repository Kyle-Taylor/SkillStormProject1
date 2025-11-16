package com.skillstorm.project1.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.skillstorm.project1.models.Checkout;

public interface CheckoutRepository extends JpaRepository<Checkout, Long> {
    List<Checkout> findAllByOrderByCheckoutDateDesc(); 
}

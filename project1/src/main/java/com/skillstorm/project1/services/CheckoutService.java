package com.skillstorm.project1.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.skillstorm.project1.models.Checkout;
import com.skillstorm.project1.repositories.CheckoutRepository;

@Service
public class CheckoutService {

    private final CheckoutRepository checkoutRepository;
    public CheckoutService(CheckoutRepository checkoutRepository) {
        this.checkoutRepository = checkoutRepository;
    }
    // FindAllCheckouts
    public List<Checkout> findAllCheckouts() {
        return checkoutRepository.findAll();
    }
}

package com.skillstorm.project1.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.skillstorm.project1.models.Checkout;

@Repository
public interface CheckoutRepository extends JpaRepository<Checkout, Long> {

    /**
     * Retrieves all checkout records ordered by checkout date in descending order.
     *
     * @return a list of {@link Checkout} entities sorted with the most recent
     *         checkout first
     */
    List<Checkout> findAllByOrderByCheckoutDateDesc();
}

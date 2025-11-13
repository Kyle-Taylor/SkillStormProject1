package com.skillstorm.project1.conrollers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.skillstorm.project1.models.Checkout;
import com.skillstorm.project1.services.CheckoutService;


@RestController
@RequestMapping("/checkouts")
@CrossOrigin(origins = "*")

//injection for checkoutService
public class CheckoutController {

    private final CheckoutService checkoutService;
    public CheckoutController(CheckoutService checkoutService){
        this.checkoutService = checkoutService;
    }

    @GetMapping()
    public ResponseEntity<List<Checkout>> findAllCheckouts() {
        try {
            return ResponseEntity.ok(checkoutService.findAllCheckouts());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
            .header("Error: ", "Sorry! We have an internal Error! Please check back later.")
            .build();
        }
    }
    
}

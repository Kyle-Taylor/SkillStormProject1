package com.skillstorm.project1.conrollers;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.skillstorm.project1.models.Checkout;
import com.skillstorm.project1.services.CheckoutService;

import jakarta.servlet.http.HttpSession;

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

    @PostMapping("/create_checkout")
    public ResponseEntity<Checkout> createCheckout(@RequestBody Map<String, Object> payload,HttpSession session) {
    try {

        Long warehouseId = Long.valueOf(payload.get("warehouseId").toString());
        Long productId   = Long.valueOf(payload.get("productId").toString());
        int amount       = Integer.parseInt(payload.get("amount").toString());
        String email = payload.get("email").toString();

        Checkout created = checkoutService.createCheckout(warehouseId,productId,amount,email);
        return new ResponseEntity<>(created, HttpStatus.CREATED);

    } catch (NumberFormatException e) {
        return ResponseEntity.internalServerError().build();
    }
}

}   


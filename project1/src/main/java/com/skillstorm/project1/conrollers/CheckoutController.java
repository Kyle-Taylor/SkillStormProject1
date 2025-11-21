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

/**
 * Controller responsible for handling all checkout-related API operations.
 * Provides endpoints for retrieving existing checkouts and creating new ones.
 */
@RestController
@RequestMapping("/checkouts")
@CrossOrigin(origins = "http://localhost:8080", allowCredentials = "true")
public class CheckoutController {

    /** Service layer that performs checkout-related business logic. */
    private final CheckoutService checkoutService;

    /**
     * Constructor-based dependency injection for the CheckoutService.
     *
     * @param checkoutService the service used to handle checkout operations
     */
    public CheckoutController(CheckoutService checkoutService){
        this.checkoutService = checkoutService;
    }

    /**
     * Retrieves all checkout records stored in the system.
     *
     * @return ResponseEntity containing a list of all Checkout objects
     *         or an internal server error if something goes wrong
     */
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

    /**
     * Creates a new checkout record based on the provided request body.
     * Expects warehouseId, productId, amount, and the user email performing the checkout.
     *
     * @param payload request JSON data containing warehouseId, productId, amount, and email
     * @param session the HTTP session of the current logged-in user
     * @return ResponseEntity with the created Checkout object and a 201 status,
     *         or an error response if invalid data is provided
     */
    @PostMapping("/create_checkout")
    public ResponseEntity<Checkout> createCheckout(@RequestBody Map<String, Object> payload, HttpSession session) {
        try {

            Long warehouseId = Long.valueOf(payload.get("warehouseId").toString());
            Long productId   = Long.valueOf(payload.get("productId").toString());
            int amount       = Integer.parseInt(payload.get("amount").toString());
            String email     = payload.get("email").toString();

            Checkout created = checkoutService.createCheckout(warehouseId, productId, amount, email);
            return new ResponseEntity<>(created, HttpStatus.CREATED);

        } catch (NumberFormatException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}

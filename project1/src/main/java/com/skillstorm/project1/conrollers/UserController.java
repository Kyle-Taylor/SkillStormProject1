package com.skillstorm.project1.conrollers;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.skillstorm.project1.models.User;
import com.skillstorm.project1.services.UserService;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;
    
    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Get all users (read-only)
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        try {
            List<User> users = userService.getAllUsers();
            return new ResponseEntity<>(users, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .header("Error", "Error retrieving users.")
                    .build();
        }
    }

    @GetMapping("/current-user")
    public ResponseEntity<?> getCurrentUser(HttpSession session) {
        Object user = session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(user);
    }


    @PostMapping("/login")
    public ResponseEntity<Void> loginUser(@RequestBody User loginRequest, HttpSession session) {
        Optional<User> foundUser = userService.findByEmail(loginRequest.getEmail());

        if (foundUser.isPresent() && foundUser.get().getPassword().equals(loginRequest.getPassword())) {
            session.setAttribute("user", foundUser.get());
            return ResponseEntity.ok().build(); 
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .header("Error", "Invalid email or password")
                .build();
    }


    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok().build();
    }



}

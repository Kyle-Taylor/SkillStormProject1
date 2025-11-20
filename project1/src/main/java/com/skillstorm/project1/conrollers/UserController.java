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

    /**
     * Service layer for accessing and modifying user data.
     */
    private final UserService userService;
    
    /**
     * Constructor-based dependency injection for UserService.
     *
     * @param userService the service used for all user-related operations
     */
    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Returns all users in the system.
     * This endpoint is read-only.
     *
     * @return 200 OK with a list of users, or 500 on error
     */
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

    /**
     * Retrieves the currently logged-in user from the session.
     *
     * @param session current HTTP session
     * @return 200 OK with the user, or 401 if no user is logged in
     */
    @GetMapping("/current-user")
    public ResponseEntity<?> getCurrentUser(HttpSession session) {
        Object user = session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(user);
    }

    /**
     * Attempts to authenticate a user with the provided email and password.
     * On success, the authenticated user is stored in the session.
     *
     * @param loginRequest user object containing email and password
     * @param session active HTTP session
     * @return 200 OK on success, or 401 if credentials are invalid
     */
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

    /**
     * Logs out the current user by invalidating the session.
     *
     * @param session active HTTP session
     * @return 200 OK after logout
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok().build();
    }

}

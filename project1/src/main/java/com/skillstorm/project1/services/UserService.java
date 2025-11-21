package com.skillstorm.project1.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.skillstorm.project1.models.User;
import com.skillstorm.project1.repositories.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    /**
     * Constructs a new UserService with the required repository.
     *
     * @param userRepository repository for user data access
     */
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Retrieves all users.
     *
     * @return list of all {@link User} entries
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Finds a user by their email address.
     *
     * @param email the email to search for
     * @return an {@link Optional} containing the user if found
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Creates a new user account.
     * The provided user's password is securely hashed before storage.
     * If an account with the same email already exists, an exception is thrown.
     *
     * @param user the new user being registered
     * @return the saved {@link User} entity after hashing and persistence
     * @throws IllegalArgumentException if a user with the same email already exists
     */
    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        // Securely hash the password before saving
        user.setPassword(encoder.encode(user.getPassword()));

        return userRepository.save(user);
    }

    /**
     * Validates login credentials by comparing the provided raw password
     * with the BCrypt-hashed password stored in the database.
     *
     * @param email    the email used for login
     * @param password the raw (unhashed) password provided by the client
     * @return {@code true} if the credentials match, otherwise {@code false}
     */
    public boolean validateLogin(String email, String password) {
        Optional<User> found = userRepository.findByEmail(email);

        if (found.isEmpty()) {
            return false;
        }

        // Compare raw password with stored hash
        return encoder.matches(password, found.get().getPassword());
    }
}

package com.skillstorm.project1.services;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.skillstorm.project1.models.User;
import com.skillstorm.project1.repositories.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

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
     * Validates login credentials by comparing stored and provided passwords.
     *
     * @param email    the email used for login
     * @param password the provided password
     * @return {@code true} if login is valid, otherwise {@code false}
     */
    public boolean validateLogin(String email, String password) {
        return userRepository.findByEmail(email)
                .map(user -> user.getPassword().equals(password))
                .orElse(false);
    }
}

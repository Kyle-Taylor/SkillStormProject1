package com.skillstorm.project1.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.skillstorm.project1.models.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Finds a user by their email address.
     *
     * @param email the email of the user to look up
     * @return an {@link Optional} containing the matching {@link User} if found,
     *         or an empty Optional if no user exists with that email
     */
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}

package com.skillstorm.project1.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.skillstorm.project1.models.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Login will use email
    Optional<User> findByEmail(String email);
}

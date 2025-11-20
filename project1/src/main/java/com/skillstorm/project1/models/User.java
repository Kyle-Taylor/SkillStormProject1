package com.skillstorm.project1.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Represents an application user stored in the database.
 * Mapped to the "users" table.
 */
@Entity
@Table(name = "users")
public class User {

    /**
     * Primary key for the user.
     * Auto-generated identity value.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    /**
     * User's first name.
     * Cannot be null.
     */
    @Column(name = "first_name", nullable = false)
    private String firstName;

    /**
     * User's last name.
     * Cannot be null.
     */
    @Column(name = "last_name", nullable = false)
    private String lastName;

    /**
     * Email used for login.
     * Must be unique and cannot be null.
     */
    @Column(nullable = false, unique = true)
    private String email;

    /**
     * Hashed or plain-text password (depending on implementation).
     * Cannot be null.
     */
    @Column(nullable = false)
    private String password;

    /**
     * Optional job title/role description.
     */
    @Column(name = "job_title")
    private String jobTitle;

    /**
     * Default constructor.
     */
    public User() {}

    /**
     * Full constructor for creating a user.
     *
     * @param firstName user's first name
     * @param lastName user's last name
     * @param email unique login email
     * @param password user password
     * @param jobTitle optional job title
     */
    public User(String firstName, String lastName, String email, String password, String jobTitle) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.jobTitle = jobTitle;
    }

    
    public Long getUserId() {return userId;}
    public void setUserId(Long userId) {this.userId = userId;}

    public String getFirstName() {return firstName;}
    public void setFirstName(String firstName) {this.firstName = firstName;}

    public String getLastName() {return lastName;}
    public void setLastName(String lastName) {this.lastName = lastName;}

    public String getEmail() {return email;}
    public void setEmail(String email) {this.email = email;}

    public String getPassword() {return password;}
    public void setPassword(String password) {this.password = password;}

    public String getJobTitle() {return jobTitle;}
    public void setJobTitle(String jobTitle) {this.jobTitle = jobTitle;}

    // ===== Optional Helper =====
    public String getFullName() {return firstName + " " + lastName;}

    // ===== toString (excluding password) =====
    @Override
    public String toString() {
        return "User{" +
                "userId=" + userId +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", jobTitle='" + jobTitle + '\'' +
                '}';
    }
}

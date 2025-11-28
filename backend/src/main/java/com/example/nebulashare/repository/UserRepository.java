package com.example.nebulashare.repository;

import com.example.nebulashare.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Spring Data JPA automatically generates the implementation for these methods
    // based on their names. Using Optional is a best practice to avoid NullPointerExceptions.

    /**
     * Finds a user by their email address.
     * @param email The email to search for.
     * @return An Optional containing the user if found, or an empty Optional otherwise.
     */
    Optional<User> findByEmail(String email);

    /**
     * Finds a user by their username.
     * @param username The username to search for.
     * @return An Optional containing the user if found, or an empty Optional otherwise.
     */
    Optional<User> findByUsername(String username);
}
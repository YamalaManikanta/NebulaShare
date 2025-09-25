package com.example.nebulashare.repository;

import com.example.nebulashare.model.FileData;
import com.example.nebulashare.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FileDataRepository extends JpaRepository<FileData, String> {

    /**
     * Finds all files belonging to a specific user.
     * Spring Data JPA creates the query automatically from the method name.
     *
     * @param user The user entity to search files for.
     * @return A list of FileData objects owned by the user.
     */
    List<FileData> findByUser(User user);

    /**
     * Finds a file by its ID and the user who owns it.
     * This is useful for ensuring a user can only access their own files.
     *
     * @param id The ID of the file.
     * @param user The owner of the file.
     * @return An Optional containing the file if found and owned by the user.
     */
    Optional<FileData> findByIdAndUser(String id, User user);
}
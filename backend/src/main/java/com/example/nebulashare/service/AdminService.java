package com.example.nebulashare.service;

import com.example.nebulashare.model.FileData;
import com.example.nebulashare.model.User;
import com.example.nebulashare.repository.FileDataRepository;
import com.example.nebulashare.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileDataRepository fileDataRepository;

    // Get all users
    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    // Get all files
    public List<FileData> findAllFiles() {
        return fileDataRepository.findAll();
    }

    // Delete user by Long id
    public void deleteUser(Long userId) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found."));

        if (currentUser.getId().equals(userId)) {
            throw new RuntimeException("Admins cannot delete their own account.");
        }

        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found with id: " + userId);
        }

        userRepository.deleteById(userId);
    }

    // Delete user by String id (for controller)
    public void deleteUserById(String userId) {
        deleteUser(Long.parseLong(userId));
    }
}

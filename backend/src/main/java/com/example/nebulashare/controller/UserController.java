package com.example.nebulashare.controller;

import com.example.nebulashare.model.User;
import com.example.nebulashare.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userService.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> payload, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User updatedUser = userService.updateUserProfile(
                userDetails.getUsername(),
                payload.get("username"),
                payload.get("email")
            );
            // Note: If the email changes, you might need to re-verify it and issue a new JWT.
            return ResponseEntity.ok(Map.of("message", "Profile updated successfully!", "user", updatedUser));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> payload, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            userService.changeUserPassword(
                userDetails.getUsername(),
                payload.get("currentPassword"),
                payload.get("newPassword")
            );
            return ResponseEntity.ok(Map.of("message", "Password changed successfully."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
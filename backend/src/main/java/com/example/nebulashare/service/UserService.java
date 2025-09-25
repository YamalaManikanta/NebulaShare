package com.example.nebulashare.service;

import com.example.nebulashare.model.User;
import com.example.nebulashare.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    public User registerUser(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) throw new RuntimeException("Email in use");
        if (userRepository.findByUsername(user.getUsername()).isPresent()) throw new RuntimeException("Username taken");

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("USER");
        user.setVerified(false);

        String otp = generateOtp();
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        emailService.sendOtpEmail(user.getEmail(), otp);

        return userRepository.save(user);
    }

    public void verifyOtp(String email, String otp) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        if (!user.getOtp().equals(otp)) throw new RuntimeException("Invalid OTP");
        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) throw new RuntimeException("OTP expired");
        user.setVerified(true);
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
    }

    private String generateOtp() {
        return String.format("%06d", new Random().nextInt(999999));
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User updateUserProfile(String username, String newUsername, String newEmail) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        user.setUsername(newUsername);
        user.setEmail(newEmail);
        return userRepository.save(user);
    }

    public void changeUserPassword(String username, String oldPassword, String newPassword) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) throw new RuntimeException("Old password incorrect");
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}

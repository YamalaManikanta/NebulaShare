package com.example.nebulashare.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    /**
     * Sends an OTP email to the specified recipient.
     * @param to The recipient's email address.
     * @param otp The One-Time Password to send.
     */
    public void sendOtpEmail(String to, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            // IMPORTANT: This 'from' address must be a verified sender
            // in your email service provider (e.g., Brevo).
            message.setFrom("manikantayamala00@gmail.com");
            message.setTo(to);
            message.setSubject("Your NebulaShare Verification Code");
            message.setText("Welcome to NebulaShare! \n\nYour OTP code is: " + otp + "\n\nThis code will expire in 10 minutes.");
            
            mailSender.send(message);
        } catch (Exception e) {
            // In a production environment, you should handle this exception more gracefully.
            // For example, log the error and perhaps queue the email for a retry.
            throw new RuntimeException("Failed to send OTP email: " + e.getMessage());
        }
    }
}
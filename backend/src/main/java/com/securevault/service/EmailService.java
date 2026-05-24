package com.securevault.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public void sendVerificationEmail(String to, String token) {

        String verifyLink =
                frontendUrl + "/verify-email?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(to);
        message.setSubject("Verify Your SecureVault Account");

        message.setText("""
                Welcome to SecureVault!

                Click the link below to verify your account:

                %s

                If you did not create this account, ignore this email.
                """.formatted(verifyLink));

        mailSender.send(message);
    }
}
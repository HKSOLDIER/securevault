package com.securevault.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

// @Service
// @RequiredArgsConstructor
// public class EmailService {

//     private final JavaMailSender mailSender;

//     @Value("${app.frontend.url}")
//     private String frontendUrl;

//     public void sendVerificationEmail(String to, String token) {

//         System.out.println("MAIL USERNAME = " + System.getenv("MAIL_USERNAME"));
//         String verifyLink =
//                 frontendUrl + "/verify-email?token=" + token;

//         SimpleMailMessage message = new SimpleMailMessage();

//         message.setTo(to);
//         message.setSubject("Verify Your SecureVault Account");

//         message.setText("""
//                 Welcome to SecureVault!

//                 Click the link below to verify your account:

//                 %s

//                 If you did not create this account, ignore this email.
//                 """.formatted(verifyLink));

//         mailSender.send(message);
//     }
// }
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${spring.mail.username}")
    private String mailUsername;

    public void sendVerificationEmail(String to, String token) {

        System.out.println("=== EMAIL DEBUG START ===");
        System.out.println("STEP 1: sendVerificationEmail() called");
        System.out.println("STEP 2: Sending TO: " + to);
        System.out.println("STEP 3: MAIL_USERNAME = " + mailUsername);
        System.out.println("STEP 4: FRONTEND_URL = " + frontendUrl);

        String verifyLink = frontendUrl + "/verify-email?token=" + token;
        System.out.println("STEP 5: Verify link = " + verifyLink);

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            System.out.println("STEP 6: SimpleMailMessage created");

            message.setFrom(mailUsername);
            message.setTo(to);
            message.setSubject("Verify Your SecureVault Account");
            message.setText("""
                    Welcome to SecureVault!

                    Click the link below to verify your account:

                    %s

                    If you did not create this account, ignore this email.
                    """.formatted(verifyLink));
            System.out.println("STEP 7: Message configured, about to send...");

            mailSender.send(message);
            System.out.println("STEP 8: ✅ Email sent successfully to " + to);

        } catch (Exception e) {
            System.out.println("STEP 8: ❌ FAILED at mailSender.send()");
            System.out.println("ERROR TYPE: " + e.getClass().getName());
            System.out.println("ERROR MESSAGE: " + e.getMessage());
            if (e.getCause() != null) {
                System.out.println("ROOT CAUSE: " + e.getCause().getMessage());
            }
            throw e; // rethrow so AuthService also logs it
        }

        System.out.println("=== EMAIL DEBUG END ===");
    }
}
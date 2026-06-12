package com.securevault.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;

import com.resend.Resend;
import com.resend.services.emails.model.SendEmailRequest;

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
    
    @Value("${spring.mail.host}")
    private String mailHost;

    @Value("${spring.mail.port}")
    private String mailPort;

    @Value("${spring.mail.username}")
    private String mailUsername;
    @Value("${resend.api-key}")
    private String resendApiKey;

    @PostConstruct
    public void checkMailConfig() {
        System.out.println("MAIL HOST = " + mailHost);
        System.out.println("MAIL PORT = " + mailPort);
        System.out.println("MAIL USERNAME = " + mailUsername);
    }
    // @jakarta.annotation.PostConstruct
    // public void checkMailConfig() {
    //     System.out.println("MAIL PORT = " + mailPort);
    // }
    public void sendVerificationEmail(String to, String token) {

    String verifyLink =
            frontendUrl + "/verify-email?token=" + token;

    try {

        Resend resend = new Resend(resendApiKey);

        SendEmailRequest request =
                SendEmailRequest.builder()
                        .from("onboarding@resend.dev")
                        .to(to)
                        .subject("Verify Your SecureVault Account")
                        .html("""
                            <h2>Welcome to SecureVault</h2>

                            <p>Click below to verify your account:</p>

                            <a href="%s">
                                Verify Email
                            </a>

                            <p>If you did not create this account, ignore this email.</p>
                            """.formatted(verifyLink))
                        .build();

        resend.emails().send(request);

        System.out.println("EMAIL SENT SUCCESSFULLY");

    } catch (Exception e) {

        e.printStackTrace();

        throw new RuntimeException("Email sending failed", e);
    }
}
}
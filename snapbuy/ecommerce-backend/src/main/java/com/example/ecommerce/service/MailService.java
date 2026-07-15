package com.example.ecommerce.service;

import com.example.ecommerce.model.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailService {
    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendOrderPlaced(String to, Order order) {
        send(to, "SnapBuy order placed", "Your SnapBuy order #" + order.getId() + " was placed successfully. Total: Rs. " + order.getTotalPrice());
    }

    public void sendPaymentSuccess(String to, Order order) {
        send(to, "SnapBuy payment successful", "Payment for order #" + order.getId() + " is successful. Tracking: " + order.getTrackingNumber());
    }

    public void sendPasswordReset(String to, String token) {
        send(to, "SnapBuy password reset", "Use this reset token in the app: " + token);
    }

    private void send(String to, String subject, String body) {
        if (mailSender == null || to == null || to.isBlank()) {
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (RuntimeException ex) {
            System.out.println("Email delivery skipped: " + ex.getMessage());
        }
    }
}

package com.example.ecommerce.service;

import com.example.ecommerce.dto.OrderRequest;
import com.example.ecommerce.model.*;
import com.example.ecommerce.repository.CartItemRepository;
import com.example.ecommerce.repository.OrderRepository;
import com.example.ecommerce.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private MailService mailService;

    public Order placeOrder(User user, OrderRequest request) {
        List<CartItem> cartItems = cartItemRepository.findByUser(user);
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Shopping cart is empty");
        }

        double totalPrice = 0.0;
        Order order = new Order();
        order.setUser(user);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("PENDING");
        order.setShippingAddress(request.getShippingAddress());
        order.setPhoneNumber(request.getPhoneNumber());
        String paymentMethod = request.getPaymentMethod() == null ? "COD" : request.getPaymentMethod().toUpperCase();
        order.setPaymentMethod(paymentMethod);
        order.setPaymentStatus(paymentMethod.equals("CARD") ? "PAID" : "PENDING");
        order.setTrackingNumber("SNAP-" + System.currentTimeMillis());

        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            Integer stock = product.getStockQuantity();
            if (stock == null || stock < cartItem.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }

            // Deduct stock
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = new OrderItem(
                    order,
                    product,
                    cartItem.getQuantity(),
                    product.getPrice()
            );
            orderItems.add(orderItem);
            totalPrice += product.getPrice() * cartItem.getQuantity();
        }

        order.setOrderItems(orderItems);
        order.setTotalPrice(totalPrice);

        // Save order (will cascade and save orderItems too)
        Order savedOrder = orderRepository.save(order);

        // Clear cart
        cartItemRepository.deleteAll(cartItems);

        mailService.sendOrderPlaced(user.getEmail(), savedOrder);
        if ("PAID".equals(savedOrder.getPaymentStatus())) {
            mailService.sendPaymentSuccess(user.getEmail(), savedOrder);
        }

        return savedOrder;
    }

    public List<Order> getOrdersByUser(User user) {
        return orderRepository.findByUserOrderByOrderDateDesc(user);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByOrderDateDesc();
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
    }

    public Order updateOrderStatus(Long orderId, String status) {
        Order order = getOrderById(orderId);
        
        // Allowed statuses: PENDING, SHIPPED, DELIVERED, CANCELLED
        String cleanStatus = status == null ? "" : status.toUpperCase();
        if (!cleanStatus.equals("PENDING") && !cleanStatus.equals("SHIPPED") && 
            !cleanStatus.equals("DELIVERED") && !cleanStatus.equals("CANCELLED")) {
            throw new RuntimeException("Invalid order status: " + status);
        }

        order.setStatus(cleanStatus);
        return orderRepository.save(order);
    }

    public Order updatePaymentStatus(Long orderId, String status) {
        Order order = getOrderById(orderId);
        String cleanStatus = status == null ? "" : status.toUpperCase();
        if (!cleanStatus.equals("PENDING") && !cleanStatus.equals("PAID") && !cleanStatus.equals("FAILED") && !cleanStatus.equals("REFUNDED")) {
            throw new RuntimeException("Invalid payment status: " + status);
        }
        order.setPaymentStatus(cleanStatus);
        Order saved = orderRepository.save(order);
        if ("PAID".equals(cleanStatus)) {
            mailService.sendPaymentSuccess(saved.getUser().getEmail(), saved);
        }
        return saved;
    }
}

package com.example.ecommerce.controller;

import com.example.ecommerce.dto.CartItemRequest;
import com.example.ecommerce.dto.MessageResponse;
import com.example.ecommerce.model.CartItem;
import com.example.ecommerce.model.User;
import com.example.ecommerce.repository.UserRepository;
import com.example.ecommerce.security.services.UserDetailsImpl;
import com.example.ecommerce.service.CartService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/cart")
@PreAuthorize("hasRole('CUSTOMER') and !hasRole('ADMIN')")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<List<CartItem>> getCart() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(cartService.getCartByUser(user));
    }

    @PostMapping
    public ResponseEntity<CartItem> addItemToCart(@Valid @RequestBody CartItemRequest request) {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(cartService.addItemToCart(user, request));
    }

    @PutMapping("/{cartItemId}")
    public ResponseEntity<CartItem> updateItemQuantity(
            @PathVariable Long cartItemId,
            @RequestParam("quantity") Integer quantity) {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(cartService.updateItemQuantity(user, cartItemId, quantity));
    }

    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<?> removeItemFromCart(@PathVariable Long cartItemId) {
        User user = getAuthenticatedUser();
        cartService.removeItemFromCart(user, cartItemId);
        return ResponseEntity.ok(new MessageResponse("Item removed from cart"));
    }

    @DeleteMapping
    public ResponseEntity<?> clearCart() {
        User user = getAuthenticatedUser();
        cartService.clearCart(user);
        return ResponseEntity.ok(new MessageResponse("Cart cleared successfully"));
    }
}

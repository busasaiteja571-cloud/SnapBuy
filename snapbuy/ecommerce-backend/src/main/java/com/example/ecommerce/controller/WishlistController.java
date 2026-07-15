package com.example.ecommerce.controller;

import com.example.ecommerce.dto.MessageResponse;
import com.example.ecommerce.model.WishlistItem;
import com.example.ecommerce.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/wishlist")
@PreAuthorize("hasRole('CUSTOMER') and !hasRole('ADMIN')")
public class WishlistController extends BaseUserController {
    @Autowired
    private WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<List<WishlistItem>> getWishlist() {
        return ResponseEntity.ok(wishlistService.getWishlist(currentUser()));
    }

    @PostMapping("/{productId}")
    public ResponseEntity<WishlistItem> add(@PathVariable Long productId) {
        return ResponseEntity.ok(wishlistService.add(currentUser(), productId));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<MessageResponse> remove(@PathVariable Long productId) {
        wishlistService.remove(currentUser(), productId);
        return ResponseEntity.ok(new MessageResponse("Removed from wishlist"));
    }
}

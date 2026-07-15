package com.example.ecommerce.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.ecommerce.model.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // All active (not deleted) products
    List<Product> findByDeletedFalse();

    // Get product by id only if not deleted
    Optional<Product> findByIdAndDeletedFalse(Long id);

    // Products by category only if not deleted
    List<Product> findByCategoryIdAndDeletedFalse(Long categoryId);

    // Search by name ignoring case and not deleted
    List<Product> findByNameContainingIgnoreCaseAndDeletedFalse(String name);

    // Deals only if not deleted
    List<Product> findByDealTrueAndDeletedFalse();

}
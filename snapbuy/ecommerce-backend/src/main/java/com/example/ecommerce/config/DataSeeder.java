package com.example.ecommerce.config;

import com.example.ecommerce.model.*;
import com.example.ecommerce.repository.CategoryRepository;
import com.example.ecommerce.repository.ProductRepository;
import com.example.ecommerce.repository.RoleRepository;
import com.example.ecommerce.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.util.HashSet;
import java.util.Set;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${app.seed-data:false}")
    private boolean seedData;

    @Override
    public void run(String... args) throws Exception {
        if (!seedData) {
            return;
        }
        // 1. Seed Roles
        if (roleRepository.count() == 0) {
            roleRepository.save(new Role(ERole.ROLE_CUSTOMER));
            roleRepository.save(new Role(ERole.ROLE_ADMIN));
            System.out.println("Seeded database roles.");
        }

        // Retrieve Roles for User Seeding
        Role customerRole = roleRepository.findByName(ERole.ROLE_CUSTOMER)
                .orElseThrow(() -> new RuntimeException("Role customer not found"));
        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                .orElseThrow(() -> new RuntimeException("Role admin not found"));

        // 2. Seed Users (Admin & Customer)
        if (userRepository.count() == 0) {
            // Seed Admin User
            User admin = new User(
                    "admin",
                    "admin@snapbuy.com",
                    passwordEncoder.encode("admin123"),
                    "SnapBuy",
                    "Administrator"
            );
            admin.setPhone("9999999999");
            admin.setAddresses("SnapBuy Admin Office");
            Set<Role> adminRoles = new HashSet<>();
            adminRoles.add(adminRole);
            adminRoles.add(customerRole);
            admin.setRoles(adminRoles);
            userRepository.save(admin);

            // Seed Customer User
            User customer = new User(
                    "customer",
                    "customer@store.com",
                    passwordEncoder.encode("customer123"),
                    "John",
                    "Doe"
            );
            customer.setPhone("8888888888");
            customer.setAddresses("221B Demo Street, Bengaluru");
            Set<Role> customerRoles = new HashSet<>();
            customerRoles.add(customerRole);
            customer.setRoles(customerRoles);
            userRepository.save(customer);

            System.out.println("Seeded admin and customer accounts.");
        }

        // 3. Seed Categories & Products
        if (categoryRepository.count() == 0) {
            Category electronics = categoryRepository.save(new Category("Electronics", "Premium gadgets and consumer electronics"));
            Category fashion = categoryRepository.save(new Category("Fashion", "Stylish clothes, accessories, and shoes"));
            Category homeKitchen = categoryRepository.save(new Category("Home & Living", "Elegant furniture and home decorations"));
            Category books = categoryRepository.save(new Category("Books", "Best-selling novels and educational textbooks"));

            System.out.println("Seeded product categories.");

            // 4. Seed Products
            // Electronics
            Product headphones = new Product(
                    "Titanium Wireless Headphones",
                    "Experience high-fidelity sound, active noise cancellation, and a premium titanium frame with up to 40 hours of battery life.",
                    299.99,
                    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
                    15,
                    electronics
            );
            headphones.setDeal(true);
            headphones.setRating(4.8);
            productRepository.save(headphones);
            Product watch = new Product(
                    "Zenith OLED Smart Watch",
                    "Sleek health tracking, blood oxygen monitors, custom fitness profiles, and 7-day battery life with an elegant ceramic dial.",
                    199.50,
                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
                    25,
                    electronics
            );
            watch.setDeal(true);
            watch.setRating(4.7);
            productRepository.save(watch);

            // Fashion
            productRepository.save(new Product(
                    "Minimalist Leather Jacket",
                    "Crafted from premium full-grain Italian leather, this jacket offers a timeless silhouette with durable silver metal zippers.",
                    179.99,
                    "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
                    10,
                    fashion
            ));
            productRepository.save(new Product(
                    "Retro Athletic Sneakers",
                    "Super soft memory foam insoles combined with lightweight athletic mesh and a vintage silhouette for daily style and ultimate comfort.",
                    89.90,
                    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
                    30,
                    fashion
            ));

            // Home & Living
            productRepository.save(new Product(
                    "Nordic Ceramic Vase Set",
                    "Set of three handmade matte ceramic vases in earth tones. Adds a clean, aesthetic touch of Nordic design to any desk or shelf.",
                    45.00,
                    "https://images.unsplash.com/photo-1581781870027-04212e231e96?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
                    50,
                    homeKitchen
            ));
            productRepository.save(new Product(
                    "Ambient Smart Desk Lamp",
                    "Customize color temperature, sync with ambient screen colors, and control voice commands. Integrates seamlessly with Apple and Google smart homes.",
                    69.95,
                    "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
                    12,
                    homeKitchen
            ));

            // Books
            productRepository.save(new Product(
                    "Designing for the Future",
                    "An insightful deep-dive into UI/UX patterns, cognitive psychology in tech, and how spatial computing is changing human interaction.",
                    29.99,
                    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
                    100,
                    books
            ));

            productRepository.save(new Product(
                    "SnapBuy Cotton Hoodie",
                    "Soft everyday hoodie with a relaxed fit, durable stitching, and deep front pocket.",
                    59.99,
                    "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
                    35,
                    fashion
            ));
            Product speaker = new Product(
                    "Portable Bluetooth Speaker",
                    "Compact waterproof speaker with punchy bass and 18 hours of playback.",
                    79.99,
                    "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
                    0,
                    electronics
            );
            speaker.setRating(4.3);
            productRepository.save(speaker);

            System.out.println("Seeded default product inventory.");
        }
    }
}

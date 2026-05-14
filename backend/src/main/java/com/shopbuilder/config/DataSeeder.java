package com.shopbuilder.config;

import com.shopbuilder.entity.Category;
import com.shopbuilder.entity.Product;
import com.shopbuilder.entity.Role;
import com.shopbuilder.entity.User;
import com.shopbuilder.repository.CategoryRepository;
import com.shopbuilder.repository.ProductRepository;
import com.shopbuilder.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@Profile("dev")
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository,
                      CategoryRepository categoryRepository,
                      ProductRepository productRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (categoryRepository.count() > 0) {
            log.info("Seed data already exists, skipping seeding.");
            return;
        }

        log.info("Seeding development data...");

        // Create default seller
        User seller = new User();
        seller.setName("Demo Seller");
        seller.setEmail("seller@shopbuilder.dev");
        seller.setPasswordHash(passwordEncoder.encode("seller123"));
        seller.setRole(Role.SELLER);
        seller = userRepository.save(seller);

        // Create categories
        Category electronics = categoryRepository.save(new Category("electronics"));
        Category clothing = categoryRepository.save(new Category("clothing"));
        Category home = categoryRepository.save(new Category("home"));

        // Create 10 products distributed across categories (4 electronics, 3 clothing, 3 home)
        List<Product> products = List.of(
                createProduct("Wireless Bluetooth Headphones",
                        "Premium over-ear headphones with active noise cancellation and 30-hour battery life.",
                        new BigDecimal("79.99"), 45,
                        "https://placehold.co/400x300/1a1a2e/eaeaea?text=Headphones",
                        electronics, seller),
                createProduct("USB-C Fast Charger",
                        "65W GaN charger compatible with laptops, tablets, and smartphones.",
                        new BigDecimal("34.99"), 80,
                        "https://placehold.co/400x300/16213e/eaeaea?text=Charger",
                        electronics, seller),
                createProduct("Mechanical Keyboard",
                        "Compact 75% layout mechanical keyboard with RGB backlighting and hot-swappable switches.",
                        new BigDecimal("129.99"), 30,
                        "https://placehold.co/400x300/0f3460/eaeaea?text=Keyboard",
                        electronics, seller),
                createProduct("Portable Bluetooth Speaker",
                        "Waterproof portable speaker with 360-degree sound and 12-hour playtime.",
                        new BigDecimal("49.99"), 60,
                        "https://placehold.co/400x300/533483/eaeaea?text=Speaker",
                        electronics, seller),
                createProduct("Classic Denim Jacket",
                        "Timeless medium-wash denim jacket with a relaxed fit, perfect for layering.",
                        new BigDecimal("89.99"), 25,
                        "https://placehold.co/400x300/2b2d42/eaeaea?text=Jacket",
                        clothing, seller),
                createProduct("Cotton Crew T-Shirt",
                        "Soft 100% organic cotton t-shirt available in multiple colors.",
                        new BigDecimal("24.99"), 100,
                        "https://placehold.co/400x300/8d99ae/eaeaea?text=T-Shirt",
                        clothing, seller),
                createProduct("Running Sneakers",
                        "Lightweight breathable running shoes with responsive cushioning.",
                        new BigDecimal("119.99"), 40,
                        "https://placehold.co/400x300/ef233c/eaeaea?text=Sneakers",
                        clothing, seller),
                createProduct("Scented Soy Candle Set",
                        "Set of 3 hand-poured soy candles with lavender, vanilla, and cedarwood scents.",
                        new BigDecimal("29.99"), 70,
                        "https://placehold.co/400x300/d4a373/eaeaea?text=Candles",
                        home, seller),
                createProduct("Ceramic Plant Pot",
                        "Minimalist matte ceramic pot with drainage hole, ideal for indoor plants.",
                        new BigDecimal("18.99"), 55,
                        "https://placehold.co/400x300/606c38/eaeaea?text=Plant+Pot",
                        home, seller),
                createProduct("Throw Blanket",
                        "Ultra-soft knitted throw blanket in neutral tones, perfect for the couch.",
                        new BigDecimal("44.99"), 35,
                        "https://placehold.co/400x300/dda15e/eaeaea?text=Blanket",
                        home, seller)
        );

        productRepository.saveAll(products);
        log.info("Seeded {} categories and {} products.", 3, products.size());
    }

    private Product createProduct(String name, String description, BigDecimal price,
                                  int stock, String imageUrl, Category category, User seller) {
        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setStock(stock);
        product.setImageUrl(imageUrl);
        product.setCategory(category);
        product.setCreatedBy(seller);
        return product;
    }
}

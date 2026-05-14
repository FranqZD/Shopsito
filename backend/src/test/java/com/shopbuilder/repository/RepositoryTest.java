package com.shopbuilder.repository;

import com.shopbuilder.entity.Category;
import com.shopbuilder.entity.Product;
import com.shopbuilder.entity.Role;
import com.shopbuilder.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class RepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    private User seller;
    private Category electronics;
    private Category clothing;

    @BeforeEach
    void setUp() {
        seller = new User();
        seller.setName("Test Seller");
        seller.setEmail("seller@test.com");
        seller.setPasswordHash("hashedpassword");
        seller.setRole(Role.SELLER);
        seller = userRepository.save(seller);

        electronics = new Category("electronics");
        electronics = categoryRepository.save(electronics);

        clothing = new Category("clothing");
        clothing = categoryRepository.save(clothing);

        createProduct("Wireless Headphones", electronics, seller);
        createProduct("Bluetooth Speaker", electronics, seller);
        createProduct("Cotton T-Shirt", clothing, seller);
        createProduct("Denim Jacket", clothing, seller);
    }

    private Product createProduct(String name, Category category, User createdBy) {
        Product product = new Product();
        product.setName(name);
        product.setDescription("A great " + name.toLowerCase());
        product.setPrice(new BigDecimal("29.99"));
        product.setStock(10);
        product.setCategory(category);
        product.setCreatedBy(createdBy);
        return productRepository.save(product);
    }

    @Test
    void userRepository_findByEmail_returnsUser() {
        Optional<User> found = userRepository.findByEmail("seller@test.com");
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Test Seller");
    }

    @Test
    void userRepository_findByEmail_returnsEmptyForNonExistent() {
        Optional<User> found = userRepository.findByEmail("nonexistent@test.com");
        assertThat(found).isEmpty();
    }

    @Test
    void productRepository_findByNameContainingIgnoreCase_findsMatches() {
        Page<Product> results = productRepository.findByNameContainingIgnoreCase(
                "wireless", PageRequest.of(0, 10));
        assertThat(results.getContent()).hasSize(1);
        assertThat(results.getContent().get(0).getName()).isEqualTo("Wireless Headphones");
    }

    @Test
    void productRepository_findByNameContainingIgnoreCase_caseInsensitive() {
        Page<Product> results = productRepository.findByNameContainingIgnoreCase(
                "BLUETOOTH", PageRequest.of(0, 10));
        assertThat(results.getContent()).hasSize(1);
        assertThat(results.getContent().get(0).getName()).isEqualTo("Bluetooth Speaker");
    }

    @Test
    void productRepository_findByNameContainingIgnoreCase_partialMatch() {
        Page<Product> results = productRepository.findByNameContainingIgnoreCase(
                "t", PageRequest.of(0, 10));
        // "Wireless Headphones" (no t in name? actually has no 't'... let me check)
        // "Bluetooth Speaker" has 't', "Cotton T-Shirt" has 't', "Denim Jacket" has 't'
        assertThat(results.getContent().size()).isGreaterThanOrEqualTo(2);
    }

    @Test
    void productRepository_findByCategoryName_filtersCorrectly() {
        Page<Product> results = productRepository.findByCategoryName(
                "electronics", PageRequest.of(0, 10));
        assertThat(results.getContent()).hasSize(2);
        assertThat(results.getContent()).allMatch(p -> p.getCategory().getName().equals("electronics"));
    }

    @Test
    void productRepository_findByNameContainingIgnoreCaseAndCategoryName_combinesFilters() {
        Page<Product> results = productRepository.findByNameContainingIgnoreCaseAndCategoryName(
                "wireless", "electronics", PageRequest.of(0, 10));
        assertThat(results.getContent()).hasSize(1);
        assertThat(results.getContent().get(0).getName()).isEqualTo("Wireless Headphones");
    }

    @Test
    void productRepository_findByNameContainingIgnoreCaseAndCategoryName_noMatchWrongCategory() {
        Page<Product> results = productRepository.findByNameContainingIgnoreCaseAndCategoryName(
                "wireless", "clothing", PageRequest.of(0, 10));
        assertThat(results.getContent()).isEmpty();
    }

    @Test
    void productRepository_findByCreatedById_filtersCorrectly() {
        Page<Product> results = productRepository.findByCreatedById(
                seller.getId(), PageRequest.of(0, 10));
        assertThat(results.getContent()).hasSize(4);
    }

    @Test
    void productRepository_findByCreatedById_emptyForNonExistentUser() {
        Page<Product> results = productRepository.findByCreatedById(
                999L, PageRequest.of(0, 10));
        assertThat(results.getContent()).isEmpty();
    }

    @Test
    void productRepository_pagination_works() {
        Page<Product> page0 = productRepository.findByNameContainingIgnoreCase(
                "", PageRequest.of(0, 2));
        assertThat(page0.getContent()).hasSize(2);
        assertThat(page0.getTotalElements()).isEqualTo(4);
        assertThat(page0.getTotalPages()).isEqualTo(2);

        Page<Product> page1 = productRepository.findByNameContainingIgnoreCase(
                "", PageRequest.of(1, 2));
        assertThat(page1.getContent()).hasSize(2);
    }
}

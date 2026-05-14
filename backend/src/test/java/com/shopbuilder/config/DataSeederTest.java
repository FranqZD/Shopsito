package com.shopbuilder.config;

import com.shopbuilder.entity.Category;
import com.shopbuilder.entity.Product;
import com.shopbuilder.entity.Role;
import com.shopbuilder.entity.User;
import com.shopbuilder.repository.CategoryRepository;
import com.shopbuilder.repository.ProductRepository;
import com.shopbuilder.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class DataSeederTest {

    private UserRepository userRepository;
    private CategoryRepository categoryRepository;
    private ProductRepository productRepository;
    private PasswordEncoder passwordEncoder;
    private DataSeeder dataSeeder;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        categoryRepository = mock(CategoryRepository.class);
        productRepository = mock(ProductRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);
        dataSeeder = new DataSeeder(userRepository, categoryRepository, productRepository, passwordEncoder);
    }

    @Test
    void shouldSkipSeedingWhenDataAlreadyExists() {
        when(categoryRepository.count()).thenReturn(3L);

        dataSeeder.run();

        verify(userRepository, never()).save(any());
        verify(productRepository, never()).saveAll(any());
    }

    @Test
    void shouldSeedDataWhenNoCategoriesExist() {
        when(categoryRepository.count()).thenReturn(0L);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(1L);
            return user;
        });
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> {
            Category cat = invocation.getArgument(0);
            cat.setId(1L);
            return cat;
        });
        when(productRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

        dataSeeder.run();

        verify(userRepository).save(any(User.class));
        verify(categoryRepository, times(3)).save(any(Category.class));
        verify(productRepository).saveAll(any());
    }

    @Test
    void shouldCreateSellerWithCorrectAttributes() {
        when(categoryRepository.count()).thenReturn(0L);
        when(passwordEncoder.encode("seller123")).thenReturn("bcrypt_hash");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(1L);
            return user;
        });
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(productRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

        dataSeeder.run();

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();

        assertEquals("Demo Seller", savedUser.getName());
        assertEquals("seller@shopbuilder.dev", savedUser.getEmail());
        assertEquals("bcrypt_hash", savedUser.getPasswordHash());
        assertEquals(Role.SELLER, savedUser.getRole());
    }

    @Test
    void shouldCreateThreeCategories() {
        when(categoryRepository.count()).thenReturn(0L);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(1L);
            return user;
        });
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(productRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

        dataSeeder.run();

        ArgumentCaptor<Category> categoryCaptor = ArgumentCaptor.forClass(Category.class);
        verify(categoryRepository, times(3)).save(categoryCaptor.capture());
        List<Category> categories = categoryCaptor.getAllValues();

        assertEquals("electronics", categories.get(0).getName());
        assertEquals("clothing", categories.get(1).getName());
        assertEquals("home", categories.get(2).getName());
    }

    @SuppressWarnings("unchecked")
    @Test
    void shouldCreateTenProductsWithValidAttributes() {
        when(categoryRepository.count()).thenReturn(0L);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(1L);
            return user;
        });
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(productRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

        dataSeeder.run();

        ArgumentCaptor<List<Product>> productsCaptor = ArgumentCaptor.forClass(List.class);
        verify(productRepository).saveAll(productsCaptor.capture());
        List<Product> products = productsCaptor.getValue();

        assertEquals(10, products.size());

        for (Product product : products) {
            assertNotNull(product.getName());
            assertNotNull(product.getDescription());
            assertTrue(product.getPrice().doubleValue() >= 1.00 && product.getPrice().doubleValue() <= 999.99);
            assertTrue(product.getStock() >= 1 && product.getStock() <= 100);
            assertTrue(product.getImageUrl().startsWith("https://placehold.co/400x300"));
            assertNotNull(product.getCategory());
            assertNotNull(product.getCreatedBy());
        }
    }
}

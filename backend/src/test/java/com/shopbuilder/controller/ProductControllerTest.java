package com.shopbuilder.controller;

import com.shopbuilder.dto.CreateProductRequest;
import com.shopbuilder.dto.PaginatedResponse;
import com.shopbuilder.dto.ProductDto;
import com.shopbuilder.dto.UpdateProductRequest;
import com.shopbuilder.exception.ResourceNotFoundException;
import com.shopbuilder.service.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ProductControllerTest {

    private ProductController productController;
    private FakeProductService fakeProductService;

    private static final ProductDto SAMPLE_PRODUCT = new ProductDto(
            1L, "Test Product", "A description", new BigDecimal("29.99"),
            10, "http://example.com/img.jpg", "electronics", 1L, 1L, Instant.now()
    );

    @BeforeEach
    void setUp() {
        fakeProductService = new FakeProductService();
        productController = new ProductController(fakeProductService);
    }

    // --- GET /api/products ---

    @Test
    void getProducts_returnsOkStatus() {
        ResponseEntity<PaginatedResponse<ProductDto>> response =
                productController.getProducts(0, 12, null, null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void getProducts_returnsPaginatedResponse() {
        ResponseEntity<PaginatedResponse<ProductDto>> response =
                productController.getProducts(0, 12, null, null);

        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().content().size());
        assertEquals(1, response.getBody().totalPages());
        assertEquals(1L, response.getBody().totalElements());
        assertEquals(0, response.getBody().currentPage());
    }

    @Test
    void getProducts_passesSearchAndCategoryToService() {
        productController.getProducts(0, 12, "laptop", "electronics");

        assertEquals("laptop", fakeProductService.lastSearch);
        assertEquals("electronics", fakeProductService.lastCategory);
    }

    @Test
    void getProducts_passesPageAndSizeToService() {
        productController.getProducts(2, 24, null, null);

        assertEquals(2, fakeProductService.lastPage);
        assertEquals(24, fakeProductService.lastSize);
    }

    // --- GET /api/products/{id} ---

    @Test
    void getProduct_existingId_returnsOkWithProduct() {
        ResponseEntity<ProductDto> response = productController.getProduct(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1L, response.getBody().id());
        assertEquals("Test Product", response.getBody().name());
    }

    @Test
    void getProduct_nonExistingId_throwsResourceNotFoundException() {
        assertThrows(ResourceNotFoundException.class,
                () -> productController.getProduct(999L));
    }

    // --- POST /api/products ---

    @Test
    void createProduct_returnsCreatedStatus() {
        CreateProductRequest request = new CreateProductRequest(
                "New Product", "Description", new BigDecimal("19.99"), 5, 1L, null);
        UserDetails userDetails = buildUserDetails("seller@example.com");

        ResponseEntity<ProductDto> response =
                productController.createProduct(request, null, userDetails);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
    }

    @Test
    void createProduct_returnsCreatedProduct() {
        CreateProductRequest request = new CreateProductRequest(
                "New Product", "Description", new BigDecimal("19.99"), 5, 1L, null);
        UserDetails userDetails = buildUserDetails("seller@example.com");

        ResponseEntity<ProductDto> response =
                productController.createProduct(request, null, userDetails);

        assertNotNull(response.getBody());
        assertEquals("Test Product", response.getBody().name());
    }

    @Test
    void createProduct_passesSellerEmailToService() {
        CreateProductRequest request = new CreateProductRequest(
                "New Product", "Description", new BigDecimal("19.99"), 5, 1L, null);
        UserDetails userDetails = buildUserDetails("seller@example.com");

        productController.createProduct(request, null, userDetails);

        assertEquals("seller@example.com", fakeProductService.lastSellerEmail);
    }

    // --- PUT /api/products/{id} ---

    @Test
    void updateProduct_ownerRequest_returnsOkWithUpdatedProduct() {
        UpdateProductRequest request = new UpdateProductRequest(
                "Updated Name", "Updated desc", new BigDecimal("49.99"), 20, 1L, null);
        UserDetails userDetails = buildUserDetails("seller@example.com");

        ResponseEntity<ProductDto> response =
                productController.updateProduct(1L, request, null, userDetails);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void updateProduct_nonOwner_throwsAccessDeniedException() {
        UpdateProductRequest request = new UpdateProductRequest(
                "Updated Name", "Updated desc", new BigDecimal("49.99"), 20, 1L, null);
        UserDetails userDetails = buildUserDetails("other@example.com");

        assertThrows(AccessDeniedException.class,
                () -> productController.updateProduct(1L, request, null, userDetails));
    }

    @Test
    void updateProduct_nonExistingProduct_throwsResourceNotFoundException() {
        UpdateProductRequest request = new UpdateProductRequest(
                "Updated Name", "Updated desc", new BigDecimal("49.99"), 20, 1L, null);
        UserDetails userDetails = buildUserDetails("seller@example.com");

        assertThrows(ResourceNotFoundException.class,
                () -> productController.updateProduct(999L, request, null, userDetails));
    }

    // --- DELETE /api/products/{id} ---

    @Test
    void deleteProduct_owner_returnsNoContent() {
        UserDetails userDetails = buildUserDetails("seller@example.com");

        ResponseEntity<Void> response = productController.deleteProduct(1L, userDetails);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        assertNull(response.getBody());
    }

    @Test
    void deleteProduct_nonOwner_throwsAccessDeniedException() {
        UserDetails userDetails = buildUserDetails("other@example.com");

        assertThrows(AccessDeniedException.class,
                () -> productController.deleteProduct(1L, userDetails));
    }

    @Test
    void deleteProduct_nonExistingProduct_throwsResourceNotFoundException() {
        UserDetails userDetails = buildUserDetails("seller@example.com");

        assertThrows(ResourceNotFoundException.class,
                () -> productController.deleteProduct(999L, userDetails));
    }

    // --- Helpers ---

    private UserDetails buildUserDetails(String email) {
        return User.withUsername(email).password("password").roles("SELLER").build();
    }

    /**
     * Fake ProductService for unit testing the controller layer in isolation.
     * Tracks the last arguments passed to each method for assertion.
     */
    private static class FakeProductService extends ProductService {

        int lastPage;
        int lastSize;
        String lastSearch;
        String lastCategory;
        String lastSellerEmail;

        FakeProductService() {
            super(null, null, null, null);
        }

        @Override
        public PaginatedResponse<ProductDto> getProducts(int page, int size, String search, String category) {
            this.lastPage = page;
            this.lastSize = size;
            this.lastSearch = search;
            this.lastCategory = category;
            return new PaginatedResponse<>(List.of(SAMPLE_PRODUCT), 1, 1L, 0);
        }

        @Override
        public ProductDto getProduct(Long id) {
            if (id == 999L) {
                throw new ResourceNotFoundException("Product not found with id: " + id);
            }
            return SAMPLE_PRODUCT;
        }

        @Override
        public ProductDto createProduct(CreateProductRequest request, MultipartFile image, String sellerEmail) {
            this.lastSellerEmail = sellerEmail;
            return SAMPLE_PRODUCT;
        }

        @Override
        public ProductDto updateProduct(Long id, UpdateProductRequest request, MultipartFile image, String sellerEmail) {
            if (id == 999L) {
                throw new ResourceNotFoundException("Product not found with id: " + id);
            }
            if (!sellerEmail.equals("seller@example.com")) {
                throw new AccessDeniedException("You do not have permission to modify this product");
            }
            return SAMPLE_PRODUCT;
        }

        @Override
        public void deleteProduct(Long id, String sellerEmail) {
            if (id == 999L) {
                throw new ResourceNotFoundException("Product not found with id: " + id);
            }
            if (!sellerEmail.equals("seller@example.com")) {
                throw new AccessDeniedException("You do not have permission to modify this product");
            }
        }
    }
}

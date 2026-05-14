package com.shopbuilder.service;

import com.shopbuilder.dto.CreateProductRequest;
import com.shopbuilder.dto.PaginatedResponse;
import com.shopbuilder.dto.ProductDto;
import com.shopbuilder.dto.UpdateProductRequest;
import com.shopbuilder.entity.Category;
import com.shopbuilder.entity.Product;
import com.shopbuilder.entity.User;
import com.shopbuilder.exception.ResourceNotFoundException;
import com.shopbuilder.repository.CategoryRepository;
import com.shopbuilder.repository.ProductRepository;
import com.shopbuilder.repository.UserRepository;
import com.shopbuilder.storage.StorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class ProductServiceTest {

    private ProductRepository productRepository;
    private CategoryRepository categoryRepository;
    private UserRepository userRepository;
    private StorageService storageService;
    private ProductService productService;

    private User seller;
    private Category category;
    private Product product;

    @BeforeEach
    void setUp() {
        productRepository = mock(ProductRepository.class);
        categoryRepository = mock(CategoryRepository.class);
        userRepository = mock(UserRepository.class);
        storageService = mock(StorageService.class);
        productService = new ProductService(productRepository, categoryRepository, userRepository, storageService);

        seller = new User();
        seller.setId(1L);
        seller.setEmail("seller@example.com");
        seller.setName("Test Seller");

        category = new Category("electronics");
        category.setId(10L);

        product = new Product();
        product.setId(100L);
        product.setName("Test Product");
        product.setDescription("A test product description");
        product.setPrice(new BigDecimal("29.99"));
        product.setStock(50);
        product.setImageUrl("http://localhost:8080/uploads/test.jpg");
        product.setCategory(category);
        product.setCreatedBy(seller);
        product.setCreatedAt(Instant.now());
    }

    // --- getProducts ---

    @Test
    void getProducts_noFilters_returnsAllProductsPaginated() {
        Page<Product> page = new PageImpl<>(List.of(product), PageRequest.of(0, 12), 1);
        when(productRepository.findAll(any(Pageable.class))).thenReturn(page);

        PaginatedResponse<ProductDto> response = productService.getProducts(0, 12, null, null);

        assertEquals(1, response.content().size());
        assertEquals(1, response.totalPages());
        assertEquals(1L, response.totalElements());
        assertEquals(0, response.currentPage());
        assertEquals("Test Product", response.content().get(0).name());
    }

    @Test
    void getProducts_withSearchOnly_usesNameFilter() {
        Page<Product> page = new PageImpl<>(List.of(product), PageRequest.of(0, 12), 1);
        when(productRepository.findByNameContainingIgnoreCase(eq("test"), any(Pageable.class))).thenReturn(page);

        PaginatedResponse<ProductDto> response = productService.getProducts(0, 12, "test", null);

        assertEquals(1, response.content().size());
        verify(productRepository).findByNameContainingIgnoreCase(eq("test"), any(Pageable.class));
        verify(productRepository, never()).findAll(any(Pageable.class));
    }

    @Test
    void getProducts_withCategoryOnly_usesCategoryFilter() {
        Page<Product> page = new PageImpl<>(List.of(product), PageRequest.of(0, 12), 1);
        when(productRepository.findByCategoryName(eq("electronics"), any(Pageable.class))).thenReturn(page);

        PaginatedResponse<ProductDto> response = productService.getProducts(0, 12, null, "electronics");

        assertEquals(1, response.content().size());
        verify(productRepository).findByCategoryName(eq("electronics"), any(Pageable.class));
    }

    @Test
    void getProducts_withSearchAndCategory_usesCombinedFilter() {
        Page<Product> page = new PageImpl<>(List.of(product), PageRequest.of(0, 12), 1);
        when(productRepository.findByNameContainingIgnoreCaseAndCategoryName(
                eq("test"), eq("electronics"), any(Pageable.class))).thenReturn(page);

        PaginatedResponse<ProductDto> response = productService.getProducts(0, 12, "test", "electronics");

        assertEquals(1, response.content().size());
        verify(productRepository).findByNameContainingIgnoreCaseAndCategoryName(
                eq("test"), eq("electronics"), any(Pageable.class));
    }

    @Test
    void getProducts_withBlankSearch_treatsAsNoFilter() {
        Page<Product> page = new PageImpl<>(List.of(product), PageRequest.of(0, 12), 1);
        when(productRepository.findAll(any(Pageable.class))).thenReturn(page);

        productService.getProducts(0, 12, "  ", null);

        verify(productRepository).findAll(any(Pageable.class));
        verify(productRepository, never()).findByNameContainingIgnoreCase(any(), any());
    }

    // --- getProduct ---

    @Test
    void getProduct_existingId_returnsProductDto() {
        when(productRepository.findById(100L)).thenReturn(Optional.of(product));

        ProductDto dto = productService.getProduct(100L);

        assertEquals(100L, dto.id());
        assertEquals("Test Product", dto.name());
        assertEquals("electronics", dto.category());
        assertEquals(10L, dto.categoryId());
        assertEquals(1L, dto.createdBy());
    }

    @Test
    void getProduct_nonExistingId_throwsResourceNotFoundException() {
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> productService.getProduct(999L));
    }

    // --- createProduct ---

    @Test
    void createProduct_withImageFile_storesImageAndCreatesProduct() {
        CreateProductRequest request = new CreateProductRequest(
                "New Product", "Description", new BigDecimal("19.99"), 10, 10L, null);
        MultipartFile image = mock(MultipartFile.class);
        when(image.isEmpty()).thenReturn(false);
        when(storageService.store(image)).thenReturn("http://localhost:8080/uploads/new.jpg");
        when(userRepository.findByEmail("seller@example.com")).thenReturn(Optional.of(seller));
        when(categoryRepository.findById(10L)).thenReturn(Optional.of(category));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> {
            Product p = inv.getArgument(0);
            p.setId(200L);
            p.setCreatedAt(Instant.now());
            return p;
        });

        ProductDto dto = productService.createProduct(request, image, "seller@example.com");

        assertEquals(200L, dto.id());
        assertEquals("New Product", dto.name());
        assertEquals("http://localhost:8080/uploads/new.jpg", dto.imageUrl());
        verify(storageService).store(image);
    }

    @Test
    void createProduct_withImageUrl_usesUrlDirectly() {
        CreateProductRequest request = new CreateProductRequest(
                "New Product", "Description", new BigDecimal("19.99"), 10, 10L,
                "https://example.com/image.jpg");
        when(userRepository.findByEmail("seller@example.com")).thenReturn(Optional.of(seller));
        when(categoryRepository.findById(10L)).thenReturn(Optional.of(category));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> {
            Product p = inv.getArgument(0);
            p.setId(201L);
            p.setCreatedAt(Instant.now());
            return p;
        });

        ProductDto dto = productService.createProduct(request, null, "seller@example.com");

        assertEquals("https://example.com/image.jpg", dto.imageUrl());
        verify(storageService, never()).store(any());
    }

    @Test
    void createProduct_withNoImage_createsProductWithNullImageUrl() {
        CreateProductRequest request = new CreateProductRequest(
                "New Product", "Description", new BigDecimal("19.99"), 10, 10L, null);
        when(userRepository.findByEmail("seller@example.com")).thenReturn(Optional.of(seller));
        when(categoryRepository.findById(10L)).thenReturn(Optional.of(category));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> {
            Product p = inv.getArgument(0);
            p.setId(202L);
            p.setCreatedAt(Instant.now());
            return p;
        });

        ProductDto dto = productService.createProduct(request, null, "seller@example.com");

        assertNull(dto.imageUrl());
        verify(storageService, never()).store(any());
    }

    @Test
    void createProduct_unknownSeller_throwsResourceNotFoundException() {
        CreateProductRequest request = new CreateProductRequest(
                "New Product", "Description", new BigDecimal("19.99"), 10, 10L, null);
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> productService.createProduct(request, null, "unknown@example.com"));
    }

    @Test
    void createProduct_unknownCategory_throwsResourceNotFoundException() {
        CreateProductRequest request = new CreateProductRequest(
                "New Product", "Description", new BigDecimal("19.99"), 10, 999L, null);
        when(userRepository.findByEmail("seller@example.com")).thenReturn(Optional.of(seller));
        when(categoryRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> productService.createProduct(request, null, "seller@example.com"));
    }

    // --- updateProduct ---

    @Test
    void updateProduct_ownerWithNewImage_replacesOldImageAndUpdatesFields() {
        UpdateProductRequest request = new UpdateProductRequest(
                "Updated Name", "Updated desc", new BigDecimal("49.99"), 20, 10L, null);
        MultipartFile newImage = mock(MultipartFile.class);
        when(newImage.isEmpty()).thenReturn(false);
        when(storageService.store(newImage)).thenReturn("http://localhost:8080/uploads/new.jpg");
        when(productRepository.findById(100L)).thenReturn(Optional.of(product));
        when(categoryRepository.findById(10L)).thenReturn(Optional.of(category));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));

        ProductDto dto = productService.updateProduct(100L, request, newImage, "seller@example.com");

        assertEquals("Updated Name", dto.name());
        assertEquals("http://localhost:8080/uploads/new.jpg", dto.imageUrl());
        // Old image should be deleted
        verify(storageService).delete("test.jpg");
        verify(storageService).store(newImage);
    }

    @Test
    void updateProduct_ownerWithNoNewImage_keepsExistingImageUrl() {
        UpdateProductRequest request = new UpdateProductRequest(
                "Updated Name", "Updated desc", new BigDecimal("49.99"), 20, 10L, null);
        when(productRepository.findById(100L)).thenReturn(Optional.of(product));
        when(categoryRepository.findById(10L)).thenReturn(Optional.of(category));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));

        ProductDto dto = productService.updateProduct(100L, request, null, "seller@example.com");

        assertEquals("http://localhost:8080/uploads/test.jpg", dto.imageUrl());
        verify(storageService, never()).delete(any());
        verify(storageService, never()).store(any());
    }

    @Test
    void updateProduct_nonOwner_throwsAccessDeniedException() {
        UpdateProductRequest request = new UpdateProductRequest(
                "Updated Name", "Updated desc", new BigDecimal("49.99"), 20, 10L, null);
        when(productRepository.findById(100L)).thenReturn(Optional.of(product));

        assertThrows(AccessDeniedException.class,
                () -> productService.updateProduct(100L, request, null, "other@example.com"));
        verify(productRepository, never()).save(any());
    }

    @Test
    void updateProduct_nonExistingProduct_throwsResourceNotFoundException() {
        UpdateProductRequest request = new UpdateProductRequest(
                "Updated Name", "Updated desc", new BigDecimal("49.99"), 20, 10L, null);
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> productService.updateProduct(999L, request, null, "seller@example.com"));
    }

    // --- deleteProduct ---

    @Test
    void deleteProduct_owner_deletesImageAndProduct() {
        when(productRepository.findById(100L)).thenReturn(Optional.of(product));

        productService.deleteProduct(100L, "seller@example.com");

        verify(storageService).delete("test.jpg");
        verify(productRepository).delete(product);
    }

    @Test
    void deleteProduct_nonOwner_throwsAccessDeniedException() {
        when(productRepository.findById(100L)).thenReturn(Optional.of(product));

        assertThrows(AccessDeniedException.class,
                () -> productService.deleteProduct(100L, "other@example.com"));
        verify(productRepository, never()).delete(any());
        verify(storageService, never()).delete(any());
    }

    @Test
    void deleteProduct_nonExistingProduct_throwsResourceNotFoundException() {
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> productService.deleteProduct(999L, "seller@example.com"));
    }

    @Test
    void deleteProduct_productWithNoImage_deletesProductWithoutStorageCall() {
        product.setImageUrl(null);
        when(productRepository.findById(100L)).thenReturn(Optional.of(product));

        productService.deleteProduct(100L, "seller@example.com");

        verify(storageService, never()).delete(any());
        verify(productRepository).delete(product);
    }

    // --- DTO mapping ---

    @Test
    void getProduct_dtoContainsAllExpectedFields() {
        when(productRepository.findById(100L)).thenReturn(Optional.of(product));

        ProductDto dto = productService.getProduct(100L);

        assertEquals(100L, dto.id());
        assertEquals("Test Product", dto.name());
        assertEquals("A test product description", dto.description());
        assertEquals(new BigDecimal("29.99"), dto.price());
        assertEquals(50, dto.stock());
        assertEquals("http://localhost:8080/uploads/test.jpg", dto.imageUrl());
        assertEquals("electronics", dto.category());
        assertEquals(10L, dto.categoryId());
        assertEquals(1L, dto.createdBy());
    }
}

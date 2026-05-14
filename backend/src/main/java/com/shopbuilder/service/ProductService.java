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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Service handling product CRUD operations with ownership enforcement,
 * pagination, search/filter logic, and file storage integration.
 */
@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;

    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          UserRepository userRepository,
                          StorageService storageService) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.storageService = storageService;
    }

    /**
     * Returns a paginated list of products, optionally filtered by search term and/or category.
     * The search filter performs a case-insensitive partial match on the product name.
     */
    public PaginatedResponse<ProductDto> getProducts(int page, int size, String search, String category) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> productPage;

        boolean hasSearch = search != null && !search.isBlank();
        boolean hasCategory = category != null && !category.isBlank();

        if (hasSearch && hasCategory) {
            productPage = productRepository.findByNameContainingIgnoreCaseAndCategoryName(search, category, pageable);
        } else if (hasSearch) {
            productPage = productRepository.findByNameContainingIgnoreCase(search, pageable);
        } else if (hasCategory) {
            productPage = productRepository.findByCategoryName(category, pageable);
        } else {
            productPage = productRepository.findAll(pageable);
        }

        return new PaginatedResponse<>(
                productPage.getContent().stream().map(this::toDto).toList(),
                productPage.getTotalPages(),
                productPage.getTotalElements(),
                productPage.getNumber()
        );
    }

    /**
     * Returns a single product by ID, or throws ResourceNotFoundException if not found.
     */
    public ProductDto getProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return toDto(product);
    }

    /**
     * Creates a new product associated with the authenticated seller.
     * If an image file is provided it is stored via StorageService; otherwise the imageUrl
     * from the request is used directly.
     */
    public ProductDto createProduct(CreateProductRequest request, MultipartFile image, String sellerEmail) {
        User seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + sellerEmail));

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.categoryId()));

        String imageUrl = resolveImageUrl(image, request.imageUrl(), null);

        Product product = new Product();
        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setStock(request.stock());
        product.setImageUrl(imageUrl);
        product.setCategory(category);
        product.setCreatedBy(seller);

        return toDto(productRepository.save(product));
    }

    /**
     * Updates an existing product. Verifies that the authenticated seller owns the product.
     * If a new image file is provided, the old image is deleted from storage and replaced.
     */
    public ProductDto updateProduct(Long id, UpdateProductRequest request, MultipartFile image, String sellerEmail) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        verifyOwnership(product, sellerEmail);

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.categoryId()));

        String oldImageUrl = product.getImageUrl();
        String newImageUrl = resolveImageUrl(image, request.imageUrl(), oldImageUrl);

        // Delete old stored image if it was replaced by a newly uploaded file
        if (image != null && !image.isEmpty() && oldImageUrl != null) {
            deleteStoredFile(oldImageUrl);
        }

        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setStock(request.stock());
        product.setImageUrl(newImageUrl);
        product.setCategory(category);

        return toDto(productRepository.save(product));
    }

    /**
     * Deletes a product. Verifies that the authenticated seller owns the product,
     * then deletes the associated image from storage and removes the product record.
     */
    public void deleteProduct(Long id, String sellerEmail) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        verifyOwnership(product, sellerEmail);

        if (product.getImageUrl() != null) {
            deleteStoredFile(product.getImageUrl());
        }

        productRepository.delete(product);
    }

    // --- Private helpers ---

    private void verifyOwnership(Product product, String sellerEmail) {
        if (!product.getCreatedBy().getEmail().equals(sellerEmail)) {
            throw new AccessDeniedException("You do not have permission to modify this product");
        }
    }

    /**
     * Resolves the image URL to use for a product.
     * Priority: uploaded file > request imageUrl > existing imageUrl (for updates).
     */
    private String resolveImageUrl(MultipartFile image, String requestImageUrl, String existingImageUrl) {
        if (image != null && !image.isEmpty()) {
            return storageService.store(image);
        }
        if (requestImageUrl != null && !requestImageUrl.isBlank()) {
            return requestImageUrl;
        }
        return existingImageUrl;
    }

    /**
     * Extracts the filename from a stored URL and deletes it via StorageService.
     * Handles both full URLs (http://host/uploads/filename) and plain filenames.
     */
    private void deleteStoredFile(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return;
        }
        // Extract just the filename portion after the last '/'
        String filename = imageUrl.contains("/")
                ? imageUrl.substring(imageUrl.lastIndexOf('/') + 1)
                : imageUrl;
        storageService.delete(filename);
    }

    private ProductDto toDto(Product product) {
        return new ProductDto(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getStock(),
                product.getImageUrl(),
                product.getCategory().getName(),
                product.getCategory().getId(),
                product.getCreatedBy().getId(),
                product.getCreatedAt()
        );
    }
}

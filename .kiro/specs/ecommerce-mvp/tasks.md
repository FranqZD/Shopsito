# Implementation Plan: ShopBuilder E-Commerce MVP

## Overview

This plan implements a full-stack e-commerce MVP with a React (Vite) frontend and Java Spring Boot backend. Tasks are ordered to build foundational infrastructure first (project scaffolding, database, auth), then core features (products, catalog, cart), and finally polish (theme, responsive layout, seeding). Property-based tests validate correctness properties from the design document using jqwik (backend) and fast-check (frontend).

## Tasks

- [x] 1. Scaffold backend project and core infrastructure
  - [x] 1.1 Initialize Spring Boot project with Maven, configure dependencies (Spring Web, Spring Security, Spring Data JPA, H2, PostgreSQL, Flyway, Bucket4j, jjwt, jqwik), and set up package structure (controller, service, repository, config, security, storage, exception, dto)
    - Add all dependencies to pom.xml including test dependencies (JUnit 5, Mockito, jqwik)
    - Create base package directories
    - _Requirements: 18.1, 19.3, 19.4_

  - [x] 1.2 Create application.properties, application-dev.properties, and application-prod.properties with externalized configuration for JWT, CORS, database, and storage
    - Configure H2 for dev profile with ddl-auto=create-drop
    - Configure PostgreSQL for prod profile with ddl-auto=validate and Flyway enabled
    - Add startup validation for required environment variables
    - _Requirements: 18.1, 18.4, 18.5, 19.1, 19.2, 19.5, 19.6_

  - [x] 1.3 Create Flyway migration V1__initial_schema.sql with users, categories, and products tables including constraints and indexes
    - Define tables with proper types, constraints (CHECK, NOT NULL, UNIQUE), and foreign keys
    - Add indexes on category_id, created_by, and name columns
    - _Requirements: 19.4, 16.11_

  - [x] 1.4 Create JPA entities (User, Category, Product) with auditing annotations, Role enum, and enable JPA auditing on the main application class
    - Implement @Entity classes with proper column mappings
    - Add @EnableJpaAuditing to main application class
    - _Requirements: 1.3, 16.11_

  - [x] 1.5 Create Spring Data JPA repositories (UserRepository, CategoryRepository, ProductRepository) with custom query methods for search and filtering
    - UserRepository: findByEmail
    - ProductRepository: search by name (case-insensitive), filter by category, filter by createdBy, paginated
    - _Requirements: 5.6, 10.1, 16.3_

  - [x] 1.6 Implement GlobalExceptionHandler with @ControllerAdvice producing consistent error JSON shape, custom exception classes (ResourceNotFoundException, DuplicateEmailException, UnsupportedMediaTypeException), and ErrorResponse record
    - Handle 400, 403, 404, 409, 413, 415, 500 status codes
    - _Requirements: 3.6_

  - [ ]* 1.7 Write property test for error response shape (Property 6)
    - **Property 6: Error responses have consistent shape**
    - Test that for any exception type, the handler produces JSON with exactly "error" (non-empty string), "status" (matching HTTP code), and "timestamp" (ISO-8601)
    - **Validates: Requirements 3.6**

- [x] 2. Implement authentication system (backend)
  - [x] 2.1 Implement JwtService with token generation (embedding userId, name, email, role claims) and validation (signature check, expiration check)
    - Use configurable secret and expiration from properties
    - _Requirements: 1.1, 1.2, 2.1, 2.6_

  - [ ]* 2.2 Write property test for JWT token claims (Property 1)
    - **Property 1: JWT token contains correct claims**
    - For any valid user, generating and extracting claims yields same email, role, and userId
    - **Validates: Requirements 1.1, 1.2, 2.1**

  - [x] 2.3 Implement AuthService with register (hash password, check duplicate email, create user, generate token) and login (verify credentials, generate token) methods
    - Use BCryptPasswordEncoder for password hashing
    - Return generic error on invalid credentials (don't reveal if email exists)
    - _Requirements: 1.1, 1.4, 2.1, 2.2_

  - [x] 2.4 Implement JwtAuthFilter (OncePerRequestFilter) that extracts JWT from Authorization header, validates it, and sets SecurityContext
    - Skip filter for public endpoints
    - _Requirements: 2.3_

  - [x] 2.5 Implement RateLimitFilter using Bucket4j for login endpoint (10 attempts per IP per 5 minutes, returns 429 with standard error JSON)
    - Apply only to POST /api/auth/login
    - _Requirements: 2.1, 2.2 (security best practice)_

  - [x] 2.6 Write property test for login rate limiting (Property 18)
    - **Property 18: Login rate limiting**
    - For any IP, allow up to 10 requests in 5 minutes, reject 11th with 429, allow after window reset
    - **Validates: Requirements 2.1, 2.2 (security)**

  - [x] 2.7 Implement SecurityConfig with SecurityFilterChain (stateless sessions, public/protected endpoint rules, filter ordering) and CorsConfigurationSource bean
    - Configure CORS with externalized allowed-origin, allowed methods, headers, and max-age
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6_

  - [x] 2.8 Implement AuthController with POST /api/auth/register and POST /api/auth/login endpoints, request DTOs with Jakarta validation annotations
    - RegisterRequest: @NotBlank name, @Email email, @Pattern password (8+ chars, 1+ digit)
    - LoginRequest: @Email email, @NotBlank password
    - _Requirements: 16.1, 16.2_

- [x] 3. Checkpoint - Backend auth and infrastructure
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement product management (backend)
  - [x] 4.1 Implement StorageService interface with LocalStorageService (dev profile) that stores files with UUID-prefixed filenames and returns accessible URLs
    - Validate file type (JPEG, PNG, WebP) and size (max 5MB)
    - Delete old files on replacement
    - Configure static resource handler for /uploads/** path
    - _Requirements: 11.3, 11.4, 16.9, 16.10_

  - [x] 4.1b Implement CloudStorageService (prod profile) using Cloudinary Java SDK
    - Implement StorageService interface with store(MultipartFile) returning public Cloudinary URL and delete(String publicId) removing the asset
    - Annotate with @Service @Profile("prod")
    - Externalize Cloudinary credentials via environment variable CLOUDINARY_URL in application-prod.properties
    - Add Cloudinary SDK dependency to pom.xml: com.cloudinary:cloudinary-http44
    - Add CLOUDINARY_URL to the README.md environment variables section and to .env.example
    - _Requirements: 20.1, 20.2, 20.3_

  - [ ]* 4.2 Write property tests for file upload validation and unique filenames (Properties 16, 17)
    - **Property 16: File upload validation** — accept iff content type is JPEG/PNG/WebP AND size <= 5MB
    - **Property 17: Unique filename generation** — two uploads with identical names produce distinct filenames
    - **Validates: Requirements 11.3, 11.10**

  - [x] 4.3 Implement ProductService with CRUD operations, ownership enforcement, pagination, search/filter logic, and file handling integration
    - Create: validate data, store image, associate with seller
    - Update: verify ownership, update fields, replace image if new one provided
    - Delete: verify ownership, delete image from storage, remove product
    - List: paginate, filter by search (case-insensitive name match) and category
    - _Requirements: 5.6, 11.1, 11.4, 11.5, 11.6, 16.7, 16.8_

  - [ ]* 4.4 Write property test for product search filter correctness (Property 7)
    - **Property 7: Product search filter correctness**
    - For any set of products and search string, results contain only matching products (case-insensitive partial name match + category filter)
    - **Validates: Requirements 5.6**

  - [ ]* 4.5 Write property tests for ownership enforcement and product validation (Properties 14, 15)
    - **Property 14: Ownership enforcement** — allow modification only if createdBy matches authenticated user
    - **Property 15: Product data validation** — accept iff all field constraints are satisfied
    - **Validates: Requirements 10.1, 11.1, 11.5, 11.6**

  - [x] 4.6 Implement ProductController with GET /api/products (paginated, search, category), GET /api/products/{id}, POST /api/products, PUT /api/products/{id}, DELETE /api/products/{id}
    - Use multipart/form-data for create and update
    - Return PaginatedResponse for list endpoint
    - _Requirements: 16.3, 16.4, 16.5, 16.6, 16.7, 16.8_

  - [x] 4.7 Implement CategoryController with GET /api/categories endpoint returning all categories
    - _Requirements: 16.9_

- [x] 5. Implement database seeding
  - [x] 5.1 Implement DataSeeder (CommandLineRunner, dev profile) that seeds default seller, 3 categories, and 10 sample products on first startup, skipping if data already exists
    - Categories: electronics, clothing, home (at least 3 products per category)
    - Products with realistic names, prices 1.00-999.99, stock 1-100, placehold.co images
    - _Requirements: 15.1, 15.2, 15.3, 15.4_

- [x] 6. Checkpoint - Backend complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Scaffold frontend project and core infrastructure
  - [x] 7.1 Initialize Vite + React + TypeScript project, install dependencies (react-router-dom, zustand, axios, tailwindcss, postcss, autoprefixer, react-hot-toast or sonner, fast-check, vitest, @testing-library/react, jsdom), configure TailwindCSS with dark mode class strategy
    - Set up vitest.config.ts with jsdom environment
    - Create .env.example with VITE_API_BASE_URL placeholder
    - Create .env with VITE_API_BASE_URL=http://localhost:8080
    - Add .env to .gitignore
    - _Requirements: 18.2, 18.3, 18.6_

  - [x] 7.2 Create API service layer (src/services/api.ts) with Axios instance, request interceptor for JWT injection, and response interceptor for centralized error handling (401, 403, 5xx, network errors)
    - Use VITE_API_BASE_URL from environment
    - Implement toast notifications for errors
    - _Requirements: 14.4, 14.5, 2.3, 2.5, 3.4_

  - [ ]* 7.3 Write property test for Axios interceptor JWT attachment (Property 4)
    - **Property 4: Axios interceptor attaches JWT to requests**
    - For any request config, if token exists attach "Bearer {token}", otherwise no Authorization header
    - **Validates: Requirements 2.3**

  - [x] 7.4 Create toast utility module (src/utils/toast.ts) wrapping the toast library with typed helper functions (success, error, warning, info)
    - _Requirements: 14.1_

- [x] 8. Implement frontend auth stores and routing
  - [x] 8.1 Implement auth store (src/stores/authStore.ts) with login (decode JWT, persist token and user to localStorage), logout (clear localStorage), and initial rehydration from localStorage
    - _Requirements: 2.1, 2.4_

  - [x] 8.2 Implement theme store (src/stores/themeStore.ts) with toggle, localStorage persistence, OS preference detection via prefers-color-scheme, and document class toggling
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

  - [x] 8.3 Implement ProtectedRoute component that checks token presence, expiration, and role claim, redirecting appropriately (login for unauthenticated/expired, catalog for wrong role)
    - Preserve originally requested path for post-login redirect
    - _Requirements: 3.1, 3.2, 3.3, 3.7_

  - [ ]* 8.4 Write property test for route access control decision (Property 5)
    - **Property 5: Route access control decision**
    - For any route path and auth state, verify correct access/redirect behavior
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.7**

  - [x] 8.5 Set up React Router with route definitions (public: /, /products, /products/:id, /cart, /login, /register; protected: /dashboard/*) and App component with layout structure
    - _Requirements: 3.1, 3.3_

- [x] 9. Implement frontend auth pages
  - [x] 9.1 Implement LoginPage with email/password form, inline validation (non-empty email with valid format, non-empty password), API integration, error handling via toast, and redirect to dashboard on success
    - _Requirements: 2.1, 2.2_

  - [ ]* 9.2 Write property tests for email and password validation (Properties 2, 3)
    - **Property 2: Password validation correctly classifies inputs** — accept iff length >= 8 and contains digit
    - **Property 3: Email validation correctly classifies inputs** — accept iff well-formed email pattern
    - **Validates: Requirements 1.7, 2.7**

  - [x] 9.3 Implement RegisterPage with name/email/password form, inline validation (password: 8+ chars with digit, email: valid format), API integration, error handling, and redirect to dashboard on success
    - _Requirements: 1.1, 1.5, 1.6_

- [x] 10. Implement frontend product catalog and detail
  - [x] 10.1 Implement CatalogPage with responsive product grid, skeleton loaders (12 placeholders), pagination controls, empty state, and error handling
    - Responsive: 1 column mobile, 2 columns tablet, 3-4 columns desktop
    - _Requirements: 4.1, 4.3, 4.4, 4.5, 13.3, 13.4_

  - [x] 10.2 Implement ProductCard component with image (4:3 aspect ratio), name, price, category badge, hover animation (scale + shadow), and quick-add-to-cart button on hover
    - Use TailwindCSS transition utilities (duration-200, ease-in-out)
    - _Requirements: 4.1, 4.2, 14.1_

  - [x] 10.3 Implement search bar with debounce (300ms, min 2 chars) and category filter dropdown, fetching categories from GET /api/categories
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 10.4 Implement ProductDetailPage with full product info (image, name, description, formatted price, stock, category badge), skeleton loader, 404 empty state, out-of-stock indicator, breadcrumb navigation, and add-to-cart action
    - Disable add-to-cart when stock is 0
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 11. Implement frontend shopping cart
  - [x] 11.1 Implement cart store (src/stores/cartStore.ts) with addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice, localStorage persistence via zustand/middleware, and stock clamping logic
    - Round each line item to 2 decimal places before summing for totalPrice
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 8.1_

  - [ ]* 11.2 Write property tests for cart behavior (Properties 8, 9, 10, 11, 12)
    - **Property 8: Cart add item behavior** — correct quantity handling for new/existing items
    - **Property 9: Cart quantity clamping** — result equals max(1, min(Q, S))
    - **Property 10: Cart remove item** — N items becomes N-1, others unchanged
    - **Property 11: Cart persistence round-trip** — serialize/deserialize preserves state
    - **Property 12: Cart total computation** — totalItems = sum of quantities, totalPrice = sum of rounded line items
    - **Validates: Requirements 7.1-7.9, 8.1**

  - [x] 11.3 Implement CartPage with line items (image, name, price, quantity selector, subtotal, remove button), cart total, empty state with CTA to catalog, and cart badge in navigation
    - Format all monetary values with currency symbol and 2 decimal places
    - _Requirements: 8.2, 8.3, 8.4, 7.8_

  - [ ]* 11.4 Write property test for currency formatting (Property 13)
    - **Property 13: Currency formatting**
    - For any non-negative number, output starts with currency symbol, has exactly one decimal point, and exactly 2 digits after it
    - **Validates: Requirements 8.2**

- [x] 12. Checkpoint - Frontend catalog and cart complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Implement seller dashboard
  - [x] 13.1 Implement DashboardLayout with sidebar navigation (Dashboard overview, Products sections), active state highlight, and collapsible menu on mobile (< 768px)
    - _Requirements: 9.2, 13.2_

  - [x] 13.2 Implement DashboardOverview with metric cards (total products from API, mock total sales and recent orders with "Demo data" label), skeleton loaders, and error state
    - _Requirements: 9.1, 9.3, 9.4_

  - [x] 13.3 Implement ProductListPage (seller's products table) with columns (name, price, stock, category, actions), skeleton loaders, empty state with CTA, delete confirmation prompt, and success/error toasts
    - Filter products by authenticated seller's ID
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [x] 13.4 Implement ProductFormPage (create/edit) with form fields (name, description, price, stock, category dropdown, image URL or file upload), inline validation on blur, API integration (multipart/form-data), success toast and navigation back to list
    - Validate: name 1-150 chars, description 1-2000 chars, price 0.01-999999999.99, stock 0-999999, image JPEG/PNG/WebP max 5MB
    - _Requirements: 11.1, 11.2, 11.3, 11.5, 11.7, 11.8_

- [x] 14. Implement theme toggle and responsive polish
  - [x] 14.1 Implement ThemeToggle component in navigation, wire to theme store, ensure all components render correctly in both dark and light modes using TailwindCSS dark: variants
    - _Requirements: 12.1, 12.2_

  - [x] 14.2 Implement responsive navigation bar with logo, nav links (Catalog, Cart with badge, Login/Dashboard), theme toggle, and mobile hamburger menu
    - Minimum 44x44px touch targets on mobile
    - _Requirements: 13.1, 13.4, 14.5_

  - [x] 14.3 Audit and apply consistent hover/focus transitions (150-300ms), ensure no inline styles, verify component files under 150 lines, and ensure all API calls go through the centralized service layer
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [x] 15. Create backend README with environment setup documentation
  - [x] 15.1 Create README.md documenting all required environment variables (DB_URL, DB_USERNAME, DB_PASSWORD, JWT_SECRET, APP_CORS_ALLOWED_ORIGIN, STORAGE_PROVIDER, CLOUDINARY_URL) with descriptions, expected formats, and example values
    - _Requirements: 18.4_

- [x] 16. Final checkpoint - Full integration
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using jqwik (backend, Java) and fast-check (frontend, TypeScript)
- Unit tests validate specific examples and edge cases
- Backend runs on port 8080, frontend on port 5173 (Vite default)
- The dev profile uses H2 in-memory database (no external DB needed)
- All 18 correctness properties from the design document are covered by property test tasks

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "7.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "7.2", "7.4"] },
    { "id": 2, "tasks": ["1.4", "1.5", "1.6", "7.3"] },
    { "id": 3, "tasks": ["1.7", "2.1", "8.1", "8.2"] },
    { "id": 4, "tasks": ["2.2", "2.3", "2.4", "2.5", "8.3", "8.5"] },
    { "id": 5, "tasks": ["2.6", "2.7", "2.8", "8.4"] },
    { "id": 6, "tasks": ["4.1", "4.1b", "5.1", "9.1", "9.3"] },
    { "id": 7, "tasks": ["4.2", "4.3", "9.2"] },
    { "id": 8, "tasks": ["4.4", "4.5", "4.6", "4.7"] },
    { "id": 9, "tasks": ["10.1", "10.2", "10.3", "11.1"] },
    { "id": 10, "tasks": ["10.4", "11.2", "11.3"] },
    { "id": 11, "tasks": ["11.4", "13.1", "13.2"] },
    { "id": 12, "tasks": ["13.3", "13.4"] },
    { "id": 13, "tasks": ["14.1", "14.2", "15.1"] },
    { "id": 14, "tasks": ["14.3"] }
  ]
}
```

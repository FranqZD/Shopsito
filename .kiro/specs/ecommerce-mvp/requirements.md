# Requirements Document

## Introduction

ShopBuilder is a minimal but visually polished e-commerce web application for entrepreneurs to sell products online. The MVP focuses on an exceptional modern frontend UI with a lean backend, covering authentication, a public product catalog, a client-side shopping cart, and a protected seller dashboard. The tech stack uses React (Vite) with TailwindCSS and Zustand on the frontend, and Java Spring Boot with PostgreSQL (production) / H2 (development) on the backend.

## Glossary

- **ShopBuilder_App**: The full-stack e-commerce web application comprising a React frontend and Spring Boot backend
- **Frontend**: The React-based single-page application built with Vite, TailwindCSS, React Router, and Zustand
- **Backend_API**: The Java Spring Boot REST API providing authentication and product management endpoints
- **Auth_Service**: The authentication subsystem handling user registration, login, and JWT token management
- **Product_Catalog**: The public-facing browsable collection of products with search and filtering capabilities
- **Cart_Store**: The Zustand-based client-side state store managing shopping cart data, persisted in localStorage via zustand/middleware
- **Seller_Dashboard**: The protected area of the application accessible only to authenticated sellers for managing products
- **JWT_Token**: A JSON Web Token used for authenticating API requests, stored in localStorage, containing user role claims
- **Product**: An item for sale with name, description, price, stock quantity, category, and image URL
- **Category**: A classification label for products (e.g., electronics, clothing, home)
- **Skeleton_Loader**: A placeholder UI element that mimics content layout while data is loading
- **Toast_Notification**: A brief non-blocking message displayed to provide feedback on user actions
- **Theme_Mode**: The visual appearance setting of the application, either dark or light
- **SELLER_Role**: The role automatically assigned to users upon registration, granting access to the Seller_Dashboard
- **API_Service_Layer**: The centralized Axios instance with JWT interceptor and error handling that all components use for HTTP requests
- **Debounce**: A technique that delays executing a function until after a specified wait time has passed since the last invocation, used to limit API calls on search input

## Requirements

### Requirement 1: User Registration

**User Story:** As an entrepreneur, I want to create an account with my name, email, and password, so that I can access the seller dashboard to manage my products.

#### Acceptance Criteria

1. WHEN a user submits valid registration data (name, email, password), THE Auth_Service SHALL create a new user account with the SELLER_Role automatically assigned and return a JWT_Token
2. WHEN a user registers successfully, THE Auth_Service SHALL embed the user role claim inside the JWT_Token so the Frontend can make access decisions without an extra API call
3. THE Backend_API SHALL store user roles using a role ENUM field with value SELLER on the users table
4. WHEN a user submits a registration request with an email that already exists, THE Auth_Service SHALL return a descriptive error indicating the email is already in use
5. WHEN a user submits a registration request with invalid data (missing fields or malformed email), THE Frontend SHALL display real-time validation feedback before submission
6. IF the Backend_API is unreachable during registration, THEN THE Frontend SHALL display a Toast_Notification with an error message
7. THE Frontend SHALL enforce a minimum password length of 8 characters with at least one number before submission, displaying inline validation feedback if the rule is not met

### Requirement 2: User Login

**User Story:** As a registered user, I want to log in with my email and password, so that I can access protected areas of the application.

#### Acceptance Criteria

1. WHEN a user submits valid login credentials, THE Auth_Service SHALL return a JWT_Token containing the user role claim and the Frontend SHALL store the JWT_Token in localStorage and redirect the user to the Seller_Dashboard
2. WHEN a user submits invalid login credentials (non-existent email or incorrect password), THE Auth_Service SHALL return a generic authentication error that does not reveal whether the email exists, and the Frontend SHALL display a Toast_Notification with the error message
3. WHILE a user is authenticated, THE Frontend SHALL include the JWT_Token in the Authorization header of all subsequent API requests via the API_Service_Layer interceptor
4. WHEN a user clicks the logout action, THE Frontend SHALL remove the JWT_Token from localStorage and redirect to the public catalog
5. WHEN the Backend_API returns a 401 on any subsequent authenticated request, THE Frontend SHALL automatically clear the JWT_Token from localStorage, redirect the user to the login page, and display a Toast_Notification with a message indicating the session has expired
6. THE Auth_Service SHALL issue JWT_Tokens with an expiration time of 24 hours for the dev profile and 8 hours for the prod profile
7. WHEN a user submits the login form, THE Frontend SHALL validate that the email field is non-empty and well-formed and the password field is non-empty before sending the request, displaying inline validation feedback on invalid fields
8. IF the Backend_API is unreachable during login, THEN THE Frontend SHALL display a Toast_Notification with an error message indicating a connection failure

### Requirement 3: Protected Route Access

**User Story:** As a system owner, I want unauthenticated users to be blocked from the seller dashboard, so that only authorized sellers can manage products.

#### Acceptance Criteria

1. WHEN an unauthenticated user attempts to navigate to a Seller_Dashboard route, THE Frontend SHALL redirect the user to the login page and preserve the originally requested path so that after successful login the user is redirected back to that path
2. WHEN the Frontend detects that the stored JWT_Token has passed its expiration timestamp before sending a request, THE Frontend SHALL remove the token from localStorage, redirect the user to the login page, and display a Toast_Notification indicating the session has expired
3. WHILE a user is authenticated with a JWT_Token that has not passed its expiration timestamp and contains the SELLER_Role claim, THE Frontend SHALL allow access to all Seller_Dashboard routes
4. WHEN the Backend_API returns 403 on any request, THE Frontend SHALL display a Toast_Notification indicating the user lacks permission, without redirecting
5. WHEN the Backend_API returns 404 on any request, THE Frontend SHALL display the designed empty state corresponding to the current view
6. THE Backend_API SHALL return all error responses in a consistent JSON shape: { "error": string, "status": number, "timestamp": string } enforced by a global @ControllerAdvice exception handler
7. IF a user holds a valid JWT_Token that does not contain the SELLER_Role claim and attempts to navigate to a Seller_Dashboard route, THEN THE Frontend SHALL redirect the user to the public Product_Catalog and display a Toast_Notification indicating insufficient permissions

### Requirement 4: Product Catalog Display

**User Story:** As a shopper, I want to browse a grid of product cards showing image, name, price, and category, so that I can discover products available for purchase.

#### Acceptance Criteria

1. THE Product_Catalog SHALL display products in a responsive grid layout with each card showing the product image (4:3 aspect ratio), name, price, and a Category badge
2. WHEN a product card is hovered, THE Frontend SHALL apply a scale transform and shadow animation, and display a quick-add-to-cart button
3. WHILE products are loading from the Backend_API, THE Frontend SHALL display 12 Skeleton_Loader placeholders matching the product card layout dimensions
4. WHEN the Backend_API returns an empty product list, THE Frontend SHALL display an empty state illustration with a message indicating no products are available and a call-to-action element that navigates the user back to an unfiltered catalog view
5. THE Frontend SHALL display pagination controls (previous and next buttons with current page indicator) that allow the user to navigate between pages of results returned by the Backend_API
6. IF the GET /api/products request fails due to a network error or server error, THEN THE Frontend SHALL display a Toast_Notification with an error message and retain any previously displayed product data on screen

### Requirement 5: Product Search and Filtering

**User Story:** As a shopper, I want to search products by name and filter by category, so that I can quickly find products I am interested in.

#### Acceptance Criteria

1. WHEN a user types at least 2 characters in the search bar, THE Frontend SHALL apply a Debounce of at least 300ms before sending a request to the Backend_API with the search query parameter
2. WHEN a user selects a category filter, THE Frontend SHALL send a request to the Backend_API with the category query parameter and display only products belonging to the selected Category
3. WHEN a user clears the search bar or deselects the active category filter, THE Frontend SHALL send a request to the Backend_API without the cleared parameter and display the unfiltered or partially filtered results
4. WHEN both a search term and category filter are active, THE Frontend SHALL send both parameters to the Backend_API which returns only products matching both criteria
5. THE Frontend SHALL display available categories retrieved from the GET /api/categories endpoint
6. THE Backend_API SHALL accept optional query parameters search (string) and category (string) on the GET /api/products endpoint and apply them as filters before returning paginated results; the search filter SHALL perform a case-insensitive partial match against the product name
7. WHEN the Backend_API returns an empty product list for the active search or filter criteria, THE Frontend SHALL display a designed empty state indicating no products matched the current filters

### Requirement 6: Product Detail Page

**User Story:** As a shopper, I want to view a single product's full details including image, description, price, and stock availability, so that I can make an informed purchase decision.

#### Acceptance Criteria

1. WHEN a user navigates to a product detail page, THE Frontend SHALL display the product image, name, description, price (formatted with exactly 2 decimal places and a currency symbol), stock quantity, and Category badge
2. IF the product stock quantity is zero, THEN THE Frontend SHALL display an out-of-stock indicator and disable the add-to-cart action
3. WHILE the product detail is loading, THE Frontend SHALL display a Skeleton_Loader matching the detail page layout
4. IF the requested product does not exist (Backend_API returns 404), THEN THE Frontend SHALL display a designed 404 empty state with a navigation element to return to the Product_Catalog
5. WHEN a user navigates to a product detail page, THE Frontend SHALL provide a breadcrumb or back navigation element to return to the Product_Catalog
6. IF the Backend_API returns a server error or is unreachable when fetching product details, THEN THE Frontend SHALL display a Toast_Notification with an error message and show a retry action

### Requirement 7: Shopping Cart Management

**User Story:** As a shopper, I want to add products to a cart, adjust quantities, and remove items, so that I can prepare a collection of products I intend to purchase.

#### Acceptance Criteria

1. WHEN a user clicks the add-to-cart button on a product, THE Cart_Store SHALL add the product to the cart with a quantity of one
2. WHEN a user adds a product that already exists in the cart, THE Cart_Store SHALL increment the quantity of that product by one
3. WHEN a user adjusts the quantity selector for a cart item, THE Cart_Store SHALL update the quantity to the selected value, enforcing a minimum value of 1 and a maximum value equal to the product's available stock
4. WHEN a user removes an item from the cart, THE Cart_Store SHALL remove the product from the cart entirely
5. THE Cart_Store SHALL persist cart data across browser sessions using the persist middleware from zustand/middleware, storing state in localStorage under the key shopbuilder-cart
6. WHEN the application loads, THE Cart_Store SHALL automatically rehydrate its state from localStorage
7. WHEN a user adds a product to the cart with a quantity that would exceed the product's available stock, THE Cart_Store SHALL cap the quantity at the product's stock value and display a Toast_Notification warning the user
8. THE Frontend SHALL display the sum of all item quantities as a numeric badge on the cart icon in the navigation bar
9. THE Cart_Store stock validation is based on the product data available at the time the item was added; real-time stock re-validation against the Backend_API is out of scope for this MVP (known limitation)
10. IF a user sets the quantity selector to a value less than 1, THEN THE Cart_Store SHALL reject the change and keep the quantity at 1

### Requirement 8: Cart Total Calculation

**User Story:** As a shopper, I want to see the total cost of items in my cart, so that I can understand how much I would spend.

#### Acceptance Criteria

1. THE Cart_Store SHALL calculate the cart total as the sum of each item's price multiplied by its quantity, rounding each line item subtotal to exactly 2 decimal places before summing
2. THE Frontend SHALL display a subtotal per line item (price × quantity) and the cart total, formatting all monetary values with a currency symbol prefix and exactly 2 decimal places
3. WHEN the cart contents change (add, remove, or quantity update), THE Frontend SHALL reflect the updated totals synchronously on the next render cycle without requiring an API call
4. WHEN the cart is empty, THE Frontend SHALL display a designed empty state with a call-to-action that navigates the user to the Product_Catalog

### Requirement 9: Seller Dashboard Overview

**User Story:** As a seller, I want to see an overview of key metrics when I access my dashboard, so that I can quickly understand my store's status.

#### Acceptance Criteria

1. WHEN a seller navigates to the Seller_Dashboard, THE Frontend SHALL display metric cards showing total products count (retrieved from the Backend_API paginated response's totalElements field) and mock hardcoded values for total sales and recent orders, each mock metric card displaying a visible "Demo data" text label adjacent to its value until a real orders system is implemented
2. THE Seller_Dashboard SHALL include a sidebar navigation with icon and label for each section (at minimum: Dashboard overview and Products), an active state highlight on the current section, and collapse into a toggleable menu on viewports below the mobile breakpoint defined in Requirement 13
3. WHILE the dashboard data is loading, THE Frontend SHALL display Skeleton_Loader placeholders for each metric card
4. IF the Backend_API request for dashboard metrics fails, THEN THE Frontend SHALL display a Toast_Notification with an error message and show the metric cards in an error state indicating data is unavailable

### Requirement 10: Product Management — List View

**User Story:** As a seller, I want to see a table of all my products with edit and delete actions, so that I can manage my product inventory.

#### Acceptance Criteria

1. WHEN a seller navigates to the products section of the Seller_Dashboard, THE Frontend SHALL display a table listing only the products created by the authenticated seller, filtered by the seller's user ID, with columns for name, price, stock, category, and action buttons
2. WHILE the product list is loading from the Backend_API, THE Frontend SHALL display Skeleton_Loader placeholders matching the table layout
3. WHEN the Backend_API returns an empty product list for the authenticated seller, THE Frontend SHALL display a designed empty state with a call-to-action to create a new product
4. WHEN a seller clicks the delete action on a product, THE Frontend SHALL display a confirmation prompt before sending a DELETE request to the Backend_API
5. IF the seller dismisses or cancels the confirmation prompt, THEN THE Frontend SHALL take no further action and leave the product unchanged in the table
6. WHEN the Backend_API confirms product deletion, THE Frontend SHALL remove the product from the table and display a success Toast_Notification
7. IF the delete request fails, THEN THE Frontend SHALL retain the product in the table and display an error Toast_Notification indicating the deletion was unsuccessful

### Requirement 11: Product Management — Create and Edit

**User Story:** As a seller, I want to add new products and edit existing ones through a form, so that I can maintain my product catalog.

#### Acceptance Criteria

1. WHEN a seller submits the add product form with valid data, THE Backend_API SHALL create a new Product and return the created resource, where valid data requires: name (1–150 characters), description (1–2000 characters), price (0.01 to 999,999,999.99), stock (0 to 999,999 integer), category (must reference an existing Category), and an optional product image
2. WHEN a seller submits the product form, THE Frontend SHALL accept either a direct image URL or a file upload for the product image field
3. WHEN a seller uploads an image file, THE Backend_API SHALL accept files of type JPEG, PNG, or WebP with a maximum size of 5 MB as a multipart/form-data request, store the file in the configured storage provider, and return the publicly accessible URL as imageUrl in the response
4. WHEN a seller edits a product and uploads a new image file, THE Backend_API SHALL replace the previous imageUrl with the new one and delete the old file from storage to avoid orphaned files accumulating
5. WHEN a seller submits the edit product form with valid data, THE Backend_API SHALL update the existing Product and return the updated resource, applying the same validation rules as creation
6. IF a seller attempts to edit or delete a product they do not own, THEN THE Backend_API SHALL reject the request with a 403 error indicating insufficient permissions
7. WHEN a seller submits a product form with invalid data, THE Frontend SHALL display inline validation feedback on each invalid field as the user leaves the field, indicating which rule was violated (e.g., name too long, price out of range, unsupported file type)
8. WHEN a product is successfully created or updated, THE Frontend SHALL display a success Toast_Notification and navigate back to the product list
9. IF the create or update request fails, THEN THE Frontend SHALL display an error Toast_Notification with the error message returned by the Backend_API
10. IF a seller uploads a file that exceeds 5 MB or is not of type JPEG, PNG, or WebP, THEN THE Backend_API SHALL reject the request with an error indicating the file constraint that was violated

### Requirement 12: Dark and Light Theme Support

**User Story:** As a user, I want to switch between dark and light visual themes, so that I can use the application comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE Frontend SHALL render all components with a coherent color scheme in both dark and light Theme_Mode from initial release
2. WHEN a user toggles the theme, THE Frontend SHALL apply the selected Theme_Mode across all components without requiring a page reload
3. THE Frontend SHALL persist the selected Theme_Mode preference in localStorage so that the preference is retained across browser sessions
4. WHEN a user visits the application for the first time and no persisted Theme_Mode preference exists, THE Frontend SHALL default to the user's operating system theme preference via the prefers-color-scheme media query, falling back to light Theme_Mode if the preference cannot be detected
5. WHEN a user returns to the application and a persisted Theme_Mode preference exists in localStorage, THE Frontend SHALL apply the persisted preference regardless of the current operating system theme setting

### Requirement 13: Responsive Layout

**User Story:** As a user, I want the application to work well on mobile, tablet, and desktop screens, so that I can shop or manage products from any device.

#### Acceptance Criteria

1. THE Frontend SHALL render a mobile-responsive layout using a consistent 8px spacing grid system and TailwindCSS responsive breakpoints: mobile below 768px, tablet from 768px to 1023px, and desktop at 1024px and above
2. WHILE the viewport is below 768px, THE Frontend SHALL collapse the Seller_Dashboard sidebar into a toggleable menu
3. WHILE the viewport is below 768px, THE Frontend SHALL display the product grid in a single-column layout
4. WHILE the viewport is between 768px and 1023px, THE Frontend SHALL display the product grid in a two-column layout
5. THE Frontend SHALL render a minimum touch target size of 44×44 CSS pixels for all interactive elements (buttons, links, form controls) on viewports below 768px
6. THE Frontend SHALL maintain a typography hierarchy across all viewport sizes using at least three distinct font sizes for headings, subheadings, and body text, with each level visually distinguishable by a minimum difference of 4px in font size

### Requirement 14: UI Component Quality

**User Story:** As a user, I want smooth interactions and consistent visual feedback, so that the application feels polished and professional.

#### Acceptance Criteria

1. THE Frontend SHALL apply hover state transitions with a duration between 150ms and 300ms using TailwindCSS transition utilities (e.g., transition, duration-200, ease-in-out) on every interactive element (buttons, cards, links, form inputs)
2. THE Frontend SHALL use only TailwindCSS classes for styling with no inline styles
3. THE Frontend SHALL keep each component file under 150 lines, extracting logic or UI sections into sub-components when the limit is exceeded
4. THE Frontend SHALL centralize all API calls through a single API_Service_Layer with JWT interceptor (no direct fetch calls in components)
5. THE Frontend SHALL centralize all HTTP error handling (401, 403, 404, 5xx) in the API_Service_Layer using an Axios response interceptor, so no individual component handles raw HTTP errors directly
6. WHEN an interactive element receives focus via keyboard navigation, THE Frontend SHALL display a visible focus indicator with the same transition timing as hover states

### Requirement 15: Database Seeding

**User Story:** As a developer, I want the application to start with sample data, so that the UI looks realistic during development and demonstration.

#### Acceptance Criteria

1. WHEN the Backend_API starts and no seed data exists, THE Backend_API SHALL seed the database with the 3 default categories (electronics, clothing, home) followed by 10 sample products distributed across those categories with at least 3 products per category
2. IF the database already contains seed data when the Backend_API starts, THEN THE Backend_API SHALL skip seeding to avoid duplicate entries on restart
3. THE Backend_API SHALL seed sample products with names and descriptions relevant to their assigned category, prices between 1.00 and 999.99, stock quantities between 1 and 100, and image URLs using https://placehold.co placeholder images
4. WHEN the Backend_API seeds sample products, THE Backend_API SHALL also create a default seller account and associate all seeded products with that seller via the createdBy foreign key

### Requirement 16: API Endpoint Structure

**User Story:** As a frontend developer, I want a well-structured REST API, so that I can integrate the frontend with predictable backend behavior.

#### Acceptance Criteria

1. THE Backend_API SHALL expose a POST /api/auth/register endpoint accepting name, email, and password fields
2. THE Backend_API SHALL expose a POST /api/auth/login endpoint accepting email and password fields
3. THE Backend_API SHALL expose a GET /api/products endpoint that accepts optional query parameters: page (int, default 0), size (int, default 12, maximum 100), search (string, maximum 255 characters), and category (string)
4. THE Backend_API SHALL return paginated responses in the shape: { "content": Product[], "totalPages": number, "totalElements": number, "currentPage": number }
5. THE Backend_API SHALL expose a GET /api/products/{id} endpoint returning a single product's full details
6. THE Backend_API SHALL expose a POST /api/products endpoint restricted to authenticated sellers for creating products
7. THE Backend_API SHALL expose a PUT /api/products/{id} endpoint restricted to the authenticated seller who owns the product for updating products
8. THE Backend_API SHALL expose a DELETE /api/products/{id} endpoint restricted to the authenticated seller who owns the product for deleting products
9. THE Backend_API SHALL expose a GET /api/categories endpoint returning all available categories
10. THE Backend_API SHALL expose a GET /uploads/{filename} endpoint to serve uploaded product images as publicly accessible static resources with no authentication required
11. THE Backend_API SHALL associate every Product with the seller (user) who created it, storing a createdBy foreign key referencing the users table
12. IF an authenticated seller attempts to update or delete a Product they do not own, THEN THE Backend_API SHALL return a 403 error response without modifying the resource
13. IF a request targets a product ID that does not exist, THEN THE Backend_API SHALL return a 404 error response

### Requirement 17: CORS Configuration

**User Story:** As a frontend developer, I want the backend to allow cross-origin requests from the frontend origin, so that the application works correctly in development and production.

#### Acceptance Criteria

1. THE Backend_API SHALL define a global CORS configuration using a CorsConfigurationSource @Bean inside a @Configuration class
2. THE Backend_API SHALL allow requests from the configured frontend origin (e.g., http://localhost:5173 for development) via an externalized property app.cors.allowed-origin
3. THE Backend_API SHALL explicitly allow the Authorization, Content-Type, and Accept headers in CORS preflight responses
4. THE Backend_API SHALL allow HTTP methods: GET, POST, PUT, DELETE, OPTIONS
5. IF a request originates from an origin that does not match the configured app.cors.allowed-origin value, THEN THE Backend_API SHALL reject the CORS preflight request by omitting Access-Control-Allow-Origin from the response, causing the browser to block the cross-origin request
6. THE Backend_API SHALL set a preflight cache duration (Access-Control-Max-Age) of 3600 seconds so that browsers do not repeat preflight requests for the same endpoint within that window

### Requirement 18: Environment Configuration

**User Story:** As a developer, I want environment-specific configuration separated from source code, so that the application can be deployed to different environments without code changes.

#### Acceptance Criteria

1. THE Backend_API SHALL externalize all environment-sensitive values (JWT secret, CORS origin, upload path, database credentials, storage provider) into application.properties using Spring profiles (dev, prod)
2. THE Frontend SHALL read the Backend_API base URL from a .env file using the variable VITE_API_BASE_URL, with no hardcoded localhost URLs inside source files
3. THE Frontend SHALL include a .env.example file listing all required environment variables with placeholder values and a one-line description for each variable
4. THE Backend_API SHALL document all required environment variables in a README.md section titled "Environment Setup", including DB_URL, DB_USERNAME, DB_PASSWORD, JWT_SECRET, APP_CORS_ALLOWED_ORIGIN, and STORAGE_PROVIDER, with a description, expected format, and example value for each entry
5. IF a required environment variable (DB_URL, DB_USERNAME, DB_PASSWORD, JWT_SECRET, APP_CORS_ALLOWED_ORIGIN, STORAGE_PROVIDER) is not set when the Backend_API starts, THEN THE Backend_API SHALL fail to start and log an error message indicating which variable is missing
6. THE Frontend SHALL include .env in the .gitignore file, and THE Backend_API SHALL include application-prod.properties in the .gitignore file, so that files containing real credentials are never committed to version control

### Requirement 19: Database Configuration

**User Story:** As a system owner, I want the application to use a persistent database suitable for real users, so that data is not lost between server restarts.

#### Acceptance Criteria

1. THE Backend_API SHALL use PostgreSQL for any environment beyond local development, since H2 resets all data on every server restart and cannot support concurrent real users reliably
2. THE Backend_API SHALL keep H2 available exclusively for the dev Spring profile to allow fast local development without requiring a running PostgreSQL instance
3. THE Backend_API SHALL use Spring Data JPA with Hibernate so that switching between H2 and PostgreSQL requires only a change in application.properties, with no code changes
4. THE Backend_API SHALL manage database schema changes using Flyway, with migration scripts versioned under src/main/resources/db/migration, and SHALL set Hibernate's ddl-auto to "validate" for the prod profile so that Flyway remains the sole schema authority
5. THE Backend_API SHALL store PostgreSQL credentials exclusively via environment variables (DB_URL, DB_USERNAME, DB_PASSWORD), never hardcoded in source files
6. WHILE the dev Spring profile is active, THE Backend_API SHALL use Hibernate ddl-auto set to "create-drop" or Flyway migrations compatible with H2, so that the dev environment starts cleanly without manual schema setup
7. IF the configured database is unreachable at startup, THEN THE Backend_API SHALL fail to start and log an error message indicating the connection failure, rather than falling back to an alternative database silently

### Requirement 20: File Storage

**User Story:** As a system owner, I want uploaded product images to be stored reliably, so that images are not lost when the server restarts.

#### Acceptance Criteria

1. WHILE the dev Spring profile is active, THE Backend_API SHALL store uploaded files in the local /uploads directory; WHILE the prod Spring profile is active, THE Backend_API SHALL store uploaded files in an external cloud storage service
2. THE Backend_API SHALL externalize the storage provider configuration via application.properties so switching between local and cloud storage requires no code changes
3. WHEN an image is successfully uploaded, THE Backend_API SHALL return a fully qualified public URL (starting with http:// or https://) for the uploaded image, regardless of the active storage provider
4. THE Backend_API SHALL accept only image files of type JPEG, PNG, or WebP with a maximum file size of 5 MB per upload
5. IF an upload fails due to invalid file type, file size exceeding the limit, or storage provider unavailability, THEN THE Backend_API SHALL return an error response indicating the reason for failure without persisting any partial file
6. WHEN storing an uploaded file, THE Backend_API SHALL generate a unique filename to prevent collisions, ensuring no existing file is overwritten

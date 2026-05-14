# Manual Técnico — Shopcito

**Versión:** 1.0 (Beta)
**Fecha:** Mayo 2026
**Repositorio:** https://github.com/FranqZD/Shopcito

---

## Tabla de Contenidos

1. [Descripción general del sistema](#1-descripción-general-del-sistema)
2. [Arquitectura](#2-arquitectura)
3. [Stack tecnológico](#3-stack-tecnológico)
4. [Estructura de directorios](#4-estructura-de-directorios)
5. [Modelo de datos](#5-modelo-de-datos)
6. [Backend — API REST (Spring Boot)](#6-backend--api-rest-spring-boot)
7. [Frontend — SPA (React + Vite)](#7-frontend--spa-react--vite)
8. [Autenticación y seguridad](#8-autenticación-y-seguridad)
9. [Almacenamiento de imágenes](#9-almacenamiento-de-imágenes)
10. [Configuración por entorno](#10-configuración-por-entorno)
11. [Instalación y ejecución local](#11-instalación-y-ejecución-local)
12. [Despliegue en producción](#12-despliegue-en-producción)
13. [CI/CD](#13-cicd)
14. [Pruebas](#14-pruebas)
15. [Guía de contribución](#15-guía-de-contribución)

---

## 1. Descripción general del sistema

Shopcito es una aplicación web de comercio electrónico de dos módulos:

- **Catálogo público:** Exploración de productos con búsqueda, filtros y carrito.
- **Panel de vendedor:** CRUD de productos con autenticación JWT.

El sistema sigue una arquitectura cliente–servidor desacoplada: el frontend es una SPA que consume una API REST del backend.

---

## 2. Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                          Cliente                            │
│   React SPA (Vite) — Puerto 5173 (dev) / CDN (prod)        │
│                                                             │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│   │  Pages   │  │Components│  │  Stores  │  │ Services │  │
│   │(routing) │  │  (UI)    │  │(Zustand) │  │ (axios)  │  │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP / JSON + JWT
┌──────────────────────────▼──────────────────────────────────┐
│                         Servidor                            │
│   Spring Boot 3.3.5 — Puerto 8080                          │
│                                                             │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│   │Controller│  │ Service  │  │Repository│  │ Security │  │
│   │(REST API)│  │(Business │  │  (JPA)   │  │(JWT/CORS)│  │
│   │          │  │  Logic)  │  │          │  │          │  │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                           │                                 │
│              ┌────────────▼────────────┐                   │
│              │     Storage Layer       │                   │
│              │  Local File / Cloudinary│                   │
│              └─────────────────────────┘                   │
└──────────────────────────┬──────────────────────────────────┘
                           │ JDBC
┌──────────────────────────▼──────────────────────────────────┐
│                       Base de Datos                         │
│          H2 (dev in-memory) / PostgreSQL (prod)             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Stack tecnológico

### Frontend

| Tecnología | Versión | Rol |
|---|---|---|
| React | 19.2.5 | UI framework |
| TypeScript | 6.0.2 | Tipado estático |
| Vite | 8.0.10 | Build tool / dev server |
| React Router | 7.15.0 | Routing SPA |
| Zustand | 5.0.13 | State management |
| Axios | 1.16.0 | Cliente HTTP |
| TailwindCSS | 3.4.19 | Estilos utilitarios |
| Sonner | 2.0.7 | Toast notifications |
| Vitest | 4.1.5 | Testing unitario |

### Backend

| Tecnología | Versión | Rol |
|---|---|---|
| Spring Boot | 3.3.5 | Framework principal |
| Java | 17 | Lenguaje |
| Spring Security | (Boot 3.3.5) | Autenticación/autorización |
| Spring Data JPA | (Boot 3.3.5) | ORM / acceso a datos |
| H2 Database | (Boot 3.3.5) | Base de datos en memoria (dev) |
| PostgreSQL | 42.x | Base de datos relacional (prod) |
| Flyway | (Boot 3.3.5) | Migraciones de BD |
| JJWT | 0.12.6 | Generación y validación JWT |
| Bucket4j | 8.10.1 | Rate limiting |
| Cloudinary SDK | 1.36.0 | Almacenamiento de imágenes (prod) |
| Maven | 3.8+ | Build y gestión de dependencias |

---

## 4. Estructura de directorios

```
Shopcito/
├── frontend/
│   ├── public/                   # Archivos estáticos
│   ├── src/
│   │   ├── assets/               # Imágenes y recursos estáticos
│   │   ├── components/           # Componentes reutilizables
│   │   │   ├── Navbar.tsx
│   │   │   ├── CartBadge.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── CatalogFilters.tsx
│   │   │   ├── CatalogPagination.tsx
│   │   │   ├── CartLineItem.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   └── ProductDetailSkeleton.tsx
│   │   ├── hooks/                # Custom React hooks
│   │   ├── pages/                # Componentes de página (por ruta)
│   │   │   ├── CatalogPage.tsx
│   │   │   ├── ProductDetailPage.tsx
│   │   │   ├── CartPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── dashboard/
│   │   │       ├── DashboardLayout.tsx
│   │   │       ├── DashboardOverview.tsx
│   │   │       ├── ProductListPage.tsx
│   │   │       └── ProductFormPage.tsx
│   │   ├── services/             # Capa de acceso a la API
│   │   ├── stores/               # Estado global (Zustand)
│   │   │   ├── authStore.ts
│   │   │   ├── cartStore.ts
│   │   │   └── themeStore.ts
│   │   ├── utils/                # Utilidades (toast, formatters)
│   │   ├── test/                 # Configuración de tests
│   │   ├── App.tsx               # Router raíz
│   │   └── main.tsx              # Entry point
│   ├── .env                      # Variables de entorno (no incluir en VCS)
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── backend/
│   ├── src/main/java/com/shopbuilder/
│   │   ├── config/
│   │   │   ├── SecurityConfig.java
│   │   │   ├── StorageConfig.java
│   │   │   └── DataSeeder.java
│   │   ├── controller/
│   │   │   ├── AuthController.java
│   │   │   ├── ProductController.java
│   │   │   └── CategoryController.java
│   │   ├── dto/                  # Request/Response DTOs
│   │   ├── entity/
│   │   │   ├── User.java
│   │   │   ├── Product.java
│   │   │   └── Category.java
│   │   ├── exception/            # Custom exceptions + GlobalExceptionHandler
│   │   ├── repository/
│   │   │   ├── UserRepository.java
│   │   │   ├── ProductRepository.java
│   │   │   └── CategoryRepository.java
│   │   ├── security/
│   │   │   ├── JwtAuthFilter.java
│   │   │   └── JwtService.java
│   │   ├── service/
│   │   │   ├── AuthService.java
│   │   │   └── ProductService.java
│   │   ├── storage/
│   │   │   ├── StorageService.java      # Interfaz
│   │   │   ├── LocalStorageService.java
│   │   │   └── CloudinaryStorageService.java
│   │   └── ShopBuilderApplication.java
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   ├── application-dev.properties
│   │   ├── application-prod.properties
│   │   └── db/migration/
│   │       └── V1__initial_schema.sql
│   ├── .env.example
│   └── pom.xml
│
├── .github/workflows/
│   └── build.yml                 # GitHub Actions CI
├── .kiro/specs/                  # Especificaciones de API (Kiro)
├── MANUAL_USUARIO.md
└── MANUAL_TECNICO.md
```

---

## 5. Modelo de datos

### Diagrama entidad-relación

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    users     │       │   products   │       │  categories  │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │◄──┐   │ id (PK)      │   ┌──►│ id (PK)      │
│ name         │   │   │ name         │   │   │ name         │
│ email        │   │   │ description  │   │   │ created_at   │
│ password_hash│   │   │ price        │   │   └──────────────┘
│ role         │   │   │ stock        │   │
│ created_at   │   │   │ image_url    │   │
│ updated_at   │   └───│ created_by   │   │
└──────────────┘       │ category_id  │───┘
                       │ created_at   │
                       │ updated_at   │
                       └──────────────┘
```

### Definición de tablas

#### `users`

| Columna | Tipo | Restricciones |
|---|---|---|
| id | BIGSERIAL | PK |
| name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(255) | NOT NULL, UNIQUE |
| password_hash | VARCHAR(255) | NOT NULL |
| role | VARCHAR(20) | NOT NULL, DEFAULT 'SELLER' |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() |

#### `categories`

| Columna | Tipo | Restricciones |
|---|---|---|
| id | BIGSERIAL | PK |
| name | VARCHAR(50) | NOT NULL, UNIQUE |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() |

#### `products`

| Columna | Tipo | Restricciones |
|---|---|---|
| id | BIGSERIAL | PK |
| name | VARCHAR(150) | NOT NULL |
| description | VARCHAR(2000) | NOT NULL |
| price | DECIMAL(12,2) | NOT NULL, CHECK >= 0.01 |
| stock | INTEGER | NOT NULL, CHECK >= 0 |
| image_url | VARCHAR(500) | |
| category_id | BIGINT | FK → categories(id) |
| created_by | BIGINT | FK → users(id) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() |

**Índices:**
- `idx_products_category` → `category_id`
- `idx_products_created_by` → `created_by`
- `idx_products_name` → `name`

Las migraciones se gestionan con **Flyway**. El script inicial se encuentra en:
`backend/src/main/resources/db/migration/V1__initial_schema.sql`

---

## 6. Backend — API REST (Spring Boot)

### Endpoints disponibles

#### Autenticación

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/auth/register` | No | Registrar nuevo vendedor |
| POST | `/api/auth/login` | No | Iniciar sesión, devuelve JWT |

**POST /api/auth/register — Request:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "miContraseña123"
}
```

**POST /api/auth/login — Request:**
```json
{
  "email": "juan@example.com",
  "password": "miContraseña123"
}
```

**Respuesta de login:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "role": "SELLER"
  }
}
```

#### Productos

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/products` | No | Listar productos (paginado) |
| GET | `/api/products/:id` | No | Detalle de producto |
| POST | `/api/products` | JWT | Crear producto (multipart/form-data) |
| PUT | `/api/products/:id` | JWT | Actualizar producto (multipart/form-data) |
| DELETE | `/api/products/:id` | JWT | Eliminar producto |

**GET /api/products — Query params:**

| Parámetro | Tipo | Default | Descripción |
|---|---|---|---|
| `page` | int | 0 | Número de página (base 0) |
| `size` | int | 12 | Elementos por página |
| `search` | string | — | Búsqueda por nombre (case-insensitive) |
| `category` | long | — | Filtrar por ID de categoría |

**POST / PUT /api/products — Form Data:**

| Campo | Tipo | Descripción |
|---|---|---|
| `name` | string | Nombre del producto |
| `description` | string | Descripción |
| `price` | decimal | Precio (≥ 0.01) |
| `stock` | int | Cantidad disponible (≥ 0) |
| `categoryId` | long | ID de la categoría |
| `image` | file | Imagen (JPEG/PNG/WebP, ≤ 5 MB) |

#### Categorías

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/categories` | No | Listar todas las categorías |

### Formato de errores

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "El precio debe ser mayor a 0.01",
  "timestamp": "2026-05-14T10:30:00Z"
}
```

Códigos de estado HTTP utilizados:

| Código | Descripción |
|---|---|
| 200 | OK |
| 201 | Creado exitosamente |
| 400 | Datos de entrada inválidos |
| 401 | No autenticado (token ausente o inválido) |
| 403 | Acceso denegado (no es el dueño del recurso) |
| 404 | Recurso no encontrado |
| 429 | Demasiadas solicitudes (rate limit) |
| 500 | Error interno del servidor |

---

## 7. Frontend — SPA (React + Vite)

### Rutas de la aplicación

| Ruta | Tipo | Componente | Descripción |
|---|---|---|---|
| `/` | Pública | Redirect | Redirige a `/products` |
| `/products` | Pública | `CatalogPage` | Catálogo con filtros y paginación |
| `/products/:id` | Pública | `ProductDetailPage` | Detalle de producto |
| `/cart` | Pública | `CartPage` | Carrito de compras |
| `/login` | Pública | `LoginPage` | Formulario de login |
| `/register` | Pública | `RegisterPage` | Formulario de registro |
| `/dashboard` | Protegida | `DashboardLayout` | Layout del panel (outlet) |
| `/dashboard` (index) | Protegida | `DashboardOverview` | Estadísticas del vendedor |
| `/dashboard/products` | Protegida | `ProductListPage` | Listado de productos propios |
| `/dashboard/products/new` | Protegida | `ProductFormPage` | Crear producto |
| `/dashboard/products/:id/edit` | Protegida | `ProductFormPage` | Editar producto |

Las rutas protegidas usan el componente `ProtectedRoute`, que verifica si existe un token JWT válido en el store `authStore`. Si no existe, redirige a `/login`.

### Stores de estado (Zustand)

#### `authStore`
Gestiona el estado de autenticación.

| Estado | Tipo | Descripción |
|---|---|---|
| `token` | string \| null | JWT del usuario autenticado |
| `user` | User \| null | Datos del usuario autenticado |

Acciones: `login(token, user)`, `logout()`

#### `cartStore`
Gestiona el carrito de compras. Se persiste automáticamente en `localStorage`.

| Estado | Tipo | Descripción |
|---|---|---|
| `items` | CartItem[] | Lista de productos en el carrito |
| `total` | number | Total calculado |

Acciones: `addItem(product)`, `removeItem(id)`, `updateQuantity(id, qty)`, `clearCart()`

#### `themeStore`
Gestiona el tema visual (claro/oscuro).

| Estado | Tipo | Descripción |
|---|---|---|
| `isDark` | boolean | Si el modo oscuro está activo |

Acciones: `toggle()`

### Capa de servicios (Axios)

Los servicios en `src/services/` encapsulan todas las llamadas a la API. El cliente Axios está configurado con:
- `baseURL` tomada de la variable de entorno `VITE_API_BASE_URL`.
- Interceptor de request: agrega el header `Authorization: Bearer <token>` automáticamente si hay sesión activa.
- Interceptor de response: maneja errores 401 con cierre de sesión automático.

---

## 8. Autenticación y seguridad

### Flujo JWT

```
1. Cliente envía POST /api/auth/login con email y password
2. Backend valida credenciales con BCrypt
3. Backend genera JWT firmado con HMAC-SHA256
4. Cliente almacena el token en authStore (localStorage)
5. Cada request protegido incluye: Authorization: Bearer <token>
6. JwtAuthFilter extrae y valida el token en cada request
7. Si el token es válido, Spring Security autentica al usuario
```

### Configuración de seguridad

- **Algoritmo JWT:** HMAC-SHA256 (HS256)
- **Expiración del token:**
  - Desarrollo: 24 horas
  - Producción: 8 horas
- **Almacenamiento de contraseñas:** BCrypt
- **CORS:** Configurable vía variable de entorno `APP_CORS_ALLOWED_ORIGIN`
- **CSRF:** Deshabilitado (sesión stateless con JWT)
- **Rate limiting:** Implementado con Bucket4j en `RateLimitFilter`

### Variables de entorno sensibles

| Variable | Descripción |
|---|---|
| `JWT_SECRET` | Clave para firma de tokens. Debe ser ≥ 32 bytes, codificado en Base64. |
| `DB_PASSWORD` | Contraseña de PostgreSQL. |
| `CLOUDINARY_URL` | URL de autenticación de Cloudinary. |

**Generar un JWT_SECRET seguro:**
```bash
openssl rand -base64 64
```

---

## 9. Almacenamiento de imágenes

El backend tiene una abstracción `StorageService` con dos implementaciones:

### Almacenamiento local (desarrollo)

- **Activa cuando:** `STORAGE_PROVIDER=local`
- Las imágenes se guardan en el directorio `./uploads/` del servidor.
- Las imágenes son servidas a través de `/uploads/**`.
- No recomendado para producción.

### Cloudinary (producción)

- **Activa cuando:** `STORAGE_PROVIDER=cloudinary`
- Requiere la variable `CLOUDINARY_URL` con el formato: `cloudinary://API_KEY:API_SECRET@CLOUD_NAME`
- Las imágenes se almacenan en la carpeta `products/` de la cuenta de Cloudinary.
- La URL pública de Cloudinary se guarda en `products.image_url`.

### Validaciones de archivo

- Tipos aceptados: `image/jpeg`, `image/png`, `image/webp`
- Tamaño máximo: **5 MB**
- La validación se realiza en el controlador antes de procesar la imagen.

---

## 10. Configuración por entorno

### Perfil `dev` (por defecto)

```properties
# application-dev.properties
spring.datasource.url=jdbc:h2:mem:shopbuilder;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
spring.datasource.driver-class-name=org.h2.Driver
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.h2.console.enabled=true

storage.provider=local
storage.local.upload-dir=./uploads

app.jwt.expiration=86400000   # 24 horas

app.cors.allowed-origin=http://localhost:5173
```

### Perfil `prod`

```properties
# application-prod.properties
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect

storage.provider=${STORAGE_PROVIDER}
cloudinary.url=${CLOUDINARY_URL}

app.jwt.expiration=28800000   # 8 horas

app.cors.allowed-origin=${APP_CORS_ALLOWED_ORIGIN}
```

### Variables de entorno de frontend

| Variable | Ejemplo | Descripción |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8080` | URL base del backend |

En producción, apuntar a la URL pública del servidor.

---

## 11. Instalación y ejecución local

### Prerrequisitos

- Node.js 18+ y npm 9+
- Java 17 (JDK)
- Maven 3.8+ (o usar el wrapper `./mvnw` incluido)
- Git

### 1. Clonar el repositorio

```bash
git clone https://github.com/FranqZD/Shopcito.git
cd Shopcito
```

### 2. Configurar el backend

```bash
cd backend
cp .env.example .env  # Editar si se requiere configuración custom
```

Ejecutar en modo desarrollo (H2 en memoria, sin configuración adicional):

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

El servidor se inicia en `http://localhost:8080`.
La consola H2 está disponible en `http://localhost:8080/h2-console`.

### 3. Configurar el frontend

```bash
cd ../frontend
cp .env.example .env   # Si existe, o crear manualmente
```

Contenido del archivo `.env`:

```
VITE_API_BASE_URL=http://localhost:8080
```

Instalar dependencias y lanzar el servidor de desarrollo:

```bash
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

### 4. Datos semilla (DataSeeder)

Al iniciar en modo `dev`, el `DataSeeder` carga automáticamente:
- Categorías predefinidas (Electrónica, Ropa, Hogar, etc.)
- Un usuario administrador de prueba (ver logs al iniciar para credenciales)

---

## 12. Despliegue en producción

### 1. Compilar el frontend

```bash
cd frontend
npm run build
```

Los archivos estáticos se generan en `frontend/dist/`. Sirve esa carpeta con Nginx, Apache, o un CDN.

### 2. Compilar el backend

```bash
cd backend
./mvnw clean package -DskipTests
```

El JAR ejecutable se genera en `backend/target/shopbuilder-*.jar`.

### 3. Configurar variables de entorno de producción

```bash
export DB_URL=jdbc:postgresql://localhost:5432/shopcito
export DB_USERNAME=shopcito_user
export DB_PASSWORD=<contraseña_segura>
export JWT_SECRET=<base64_64_bytes>
export APP_CORS_ALLOWED_ORIGIN=https://mi-dominio.com
export STORAGE_PROVIDER=cloudinary
export CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
```

### 4. Ejecutar el backend en producción

```bash
java -jar backend/target/shopbuilder-*.jar --spring.profiles.active=prod
```

### 5. Configurar PostgreSQL

```sql
CREATE DATABASE shopcito;
CREATE USER shopcito_user WITH PASSWORD 'contraseña_segura';
GRANT ALL PRIVILEGES ON DATABASE shopcito TO shopcito_user;
```

Flyway ejecutará automáticamente las migraciones al iniciar la aplicación.

### Ejemplo de configuración Nginx (frontend + proxy API)

```nginx
server {
    listen 80;
    server_name mi-dominio.com;

    # Frontend (archivos estáticos)
    root /var/www/shopcito/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy al backend
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Servir imágenes locales (si STORAGE_PROVIDER=local)
    location /uploads/ {
        proxy_pass http://localhost:8080;
    }
}
```

---

## 13. CI/CD

### GitHub Actions

El workflow `.github/workflows/build.yml` se ejecuta en:
- Push a la rama `main`
- Pull requests hacia `main`

Pasos del pipeline:

1. Checkout del repositorio
2. Configurar Java 17
3. Ejecutar `mvn clean verify` en el backend (compila + tests)

Para extender el pipeline (ej. añadir build del frontend o deploy):

```yaml
# Ejemplo: agregar build de frontend
- name: Setup Node
  uses: actions/setup-node@v4
  with:
    node-version: '18'

- name: Build frontend
  working-directory: frontend
  run: |
    npm ci
    npm run build
```

---

## 14. Pruebas

### Frontend

```bash
cd frontend
npm run test          # Ejecutar tests una vez
npm run test:watch    # Modo watch (re-ejecuta al cambiar archivos)
```

Usa **Vitest** como framework. Los tests se ubican junto a los archivos que prueban o en `src/test/`.

### Backend

```bash
cd backend
./mvnw test                # Solo tests
./mvnw clean verify        # Build completo + tests
```

Usa **JUnit 5** con Spring Boot Test. El perfil `test` usa H2 en memoria.

### Linting (Frontend)

```bash
cd frontend
npm run lint    # Ejecutar ESLint
```

---

## 15. Guía de contribución

### Flujo de trabajo

1. Crea una rama desde `main` con nombre descriptivo:
   ```bash
   git checkout -b feature/nombre-de-la-funcionalidad
   ```

2. Realiza tus cambios siguiendo las convenciones del proyecto.

3. Asegúrate de que el linter y los tests pasen:
   ```bash
   # Frontend
   npm run lint && npm run test
   # Backend
   ./mvnw clean verify
   ```

4. Crea un Pull Request hacia `main` con descripción clara de los cambios.

### Convenciones de código

**Backend (Java):**
- Nombres de clases en PascalCase.
- Nombres de métodos y variables en camelCase.
- DTOs separados para Request y Response.
- Validaciones de entrada con anotaciones Bean Validation (`@NotBlank`, `@Min`, etc.).
- La lógica de negocio va en `Service`, nunca en `Controller`.

**Frontend (TypeScript/React):**
- Componentes en PascalCase.
- Hooks y utilidades en camelCase.
- Props tipadas con interfaces TypeScript.
- Estado global solo en stores de Zustand. No usar prop drilling profundo.
- Llamadas a API solo desde la capa `services/`.

### Agregar una nueva categoría de productos

Las categorías se cargan a través del `DataSeeder` en desarrollo y mediante el endpoint `GET /api/categories`. Para agregar categorías en producción, insertar directamente en la base de datos:

```sql
INSERT INTO categories (name, created_at) VALUES ('Nueva Categoría', NOW());
```

### Agregar una nueva variable de entorno

1. Declarar la variable en `backend/.env.example` con un valor de ejemplo.
2. Leerla en el `application.properties` correspondiente con `${VARIABLE_NAME}`.
3. Documentarla en este manual técnico.

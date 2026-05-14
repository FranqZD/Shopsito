# ShopBuilder Backend

Java Spring Boot REST API for the ShopBuilder e-commerce MVP.

## Prerequisites

- Java 17+
- Maven 3.8+
- PostgreSQL 14+ (prod profile only)

## Running locally (dev profile)

The dev profile uses an in-memory H2 database and local filesystem storage — no external services required. No environment variables need to be set.

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

The API will be available at `http://localhost:8080`.

Dev profile defaults:
- **Database:** H2 in-memory (data resets on restart)
- **Storage:** Local filesystem (`./uploads/` directory)
- **CORS origin:** `http://localhost:5173`
- **JWT expiration:** 24 hours
- **Seed data:** Automatically seeds 3 categories, 10 products, and a default seller account on first startup

## Running in production (prod profile)

The prod profile requires PostgreSQL and external configuration via environment variables. Copy `.env.example` to `.env`, fill in real values, then source the file before starting:

```bash
cp .env.example .env
# Edit .env with real values
source .env
./mvnw spring-boot:run -Dspring-boot.run.profiles=prod
```

Prod profile behavior:
- **Database:** PostgreSQL (persistent, schema managed by Flyway)
- **Storage:** Cloudinary (cloud-hosted images)
- **CORS origin:** Configured via `APP_CORS_ALLOWED_ORIGIN`
- **JWT expiration:** 8 hours
- **Seed data:** No automatic seeding

## Environment Setup

All sensitive configuration is supplied via environment variables. The table below lists every variable required by the prod profile.

> **Tip:** For local development using the `dev` profile, no environment variables are needed. The dev profile uses an in-memory H2 database and local filesystem storage with sensible defaults. See [Running locally](#running-locally-dev-profile) above.

A reference file listing all variables with placeholder values is available at [`.env.example`](.env.example). Copy it to `.env` and fill in real values before running the prod profile.

| Variable | Description | Expected format | Example |
|---|---|---|---|
| `DB_URL` | JDBC connection URL for the PostgreSQL database | `jdbc:postgresql://<host>:<port>/<dbname>` | `jdbc:postgresql://localhost:5432/shopbuilder` |
| `DB_USERNAME` | Database username used to authenticate with PostgreSQL | Plain string | `shopbuilder_user` |
| `DB_PASSWORD` | Database password used to authenticate with PostgreSQL | Plain string (keep secret) | `s3cr3tpassword` |
| `JWT_SECRET` | Base64-encoded secret key used to sign and verify JWT tokens. Must be at least 256 bits (32 bytes) to satisfy the HS256 algorithm | Base64-encoded string (≥ 32 bytes decoded) | `c2VjdXJlLWp3dC1zZWNyZXQta2V5LXRoYXQtaXMtbG9uZy1lbm91Z2g=` |
| `APP_CORS_ALLOWED_ORIGIN` | The frontend origin URL allowed by the CORS policy. Must match the exact origin (scheme + host + port) of the frontend deployment | Full URL without trailing slash | `https://myshop.example.com` |
| `STORAGE_PROVIDER` | Determines which storage backend is used for product image uploads | `local` or `cloudinary` | `cloudinary` |
| `CLOUDINARY_URL` | Cloudinary account credentials URL for cloud-based image storage. **Required only when `STORAGE_PROVIDER=cloudinary`** | `cloudinary://<api_key>:<api_secret>@<cloud_name>` | `cloudinary://123456789012345:abcdefghijklmnopqrstuvwxyz@mycloud` |

### Notes

- **Dev profile does not require any environment variables.** When running with `-Dspring-boot.run.profiles=dev`, the application uses H2 (in-memory) and local storage with hardcoded defaults.
- `CLOUDINARY_URL` is only required when `STORAGE_PROVIDER=cloudinary`. When `STORAGE_PROVIDER=local`, uploaded images are stored on the local filesystem under `./uploads/`.
- The application will **fail to start** and log an error indicating the missing variable if any of the required variables (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `APP_CORS_ALLOWED_ORIGIN`, `STORAGE_PROVIDER`) are not set when running the prod profile.
- Never commit `.env`, `application-prod.properties`, or any file containing real credentials to version control.

## Running tests

```bash
./mvnw test
```

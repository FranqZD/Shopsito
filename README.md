# Shopsito

E-commerce platform for small sellers and independent businesses.

## Tech Stack

- **Frontend:** React 18 (Vite + TypeScript)
- **Backend:** Spring Boot 3 (Java 17+)
- **Database:** MySQL 8
- **Migrations:** Flyway
- **Infrastructure:** Docker Compose

## Prerequisites

- Java 17+
- Node.js 18+
- Docker & Docker Compose
- Maven

## Project Structure

```
shopsito/
├── frontend/          # React application (Vite + TypeScript)
├── backend/           # Spring Boot application (Java 17+)
├── docker-compose.yml # MySQL service for local development
├── .env.example       # Root environment variables template
├── SETUP_GUIDE.md     # Detailed setup tutorial
└── README.md
```

## Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd shopsito
```

### 2. Configure environment variables

Copy the example files and fill in your values:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Root `.env` — MySQL credentials used by Docker Compose:

```
MYSQL_DATABASE=shopsito
MYSQL_USER=shopsito_user
MYSQL_PASSWORD=<your-password>
MYSQL_ROOT_PASSWORD=<your-root-password>
MYSQL_PORT=3306
```

Backend `.env` — Spring Boot database connection:

```
DB_URL=jdbc:mysql://localhost:3306/shopsito
DB_USERNAME=shopsito_user
DB_PASSWORD=<your-password>
SERVER_PORT=8080
```

Frontend `.env` — API base URL:

```
VITE_API_BASE_URL=http://localhost:8080
```

### 3. Start MySQL

```bash
docker-compose up -d
```

### 4. Run the backend

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

The backend starts at `http://localhost:8080`. Flyway migrations run automatically on startup.

Verify it's running:

```bash
curl http://localhost:8080/api/v1/health
```

### 5. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts at `http://localhost:5173`.

## Further Documentation

- [Frontend README](frontend/README.md) — npm scripts, environment variables, directory structure
- [Backend README](backend/README.md) — Maven commands, environment variables, Flyway migrations
- [Setup Guide](SETUP_GUIDE.md) — detailed step-by-step tutorial with troubleshooting tips

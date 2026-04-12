# Shopsito Frontend

React frontend for Shopsito, built with Vite and TypeScript.

## Scripts

| Command             | Description                                      |
|---------------------|--------------------------------------------------|
| `npm run dev`       | Start development server (http://localhost:5173)  |
| `npm run build`     | TypeScript check + production build               |
| `npm run preview`   | Preview production build                          |
| `npm run lint`      | Run ESLint                                        |

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable            | Description                          | Default                  |
|---------------------|--------------------------------------|--------------------------|
| `VITE_API_BASE_URL` | Backend API base URL                 | `http://localhost:8080`  |

## Directory Structure

```
src/
├── components/common/  # Shared/reusable components
├── pages/              # Page components (one directory per page)
├── services/           # API service layer (Axios client)
├── utils/              # Shared types and utilities
└── hooks/              # Custom React hooks
```

## Key Files

- `src/router.tsx` — Centralized routing with lazy-loaded pages
- `src/services/apiClient.ts` — Shared Axios instance (base URL from env, `/api/v1` prefix)

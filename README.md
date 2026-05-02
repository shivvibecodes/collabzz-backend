# Collabzz Backend (Express)

Production-oriented Express.js backend with:

- Express.js + Node.js
- MongoDB Atlas (via Mongoose)
- Zod configuration & input validation
- Health endpoints + Request ID tracing
- In-memory rate limiting for contact form

## Prerequisites

- Node.js 22 LTS
- pnpm 10+

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Copy `.env.example` to `.env` and fill in your values (API_PREFIX, CORS_ORIGIN, MONGODB_URI).

3. Start development server:
```bash
pnpm run dev
```

## Key Endpoints

- `GET /api/v1/health/live` - Liveness probe
- `GET /api/v1/health/ready` - Readiness probe (checks DB)
- `POST /api/v1/waitlist` - Submit waitlist registration
- `POST /api/v1/contact` - Submit contact form

## Build and Lint

```bash
pnpm run lint
pnpm run build
```

## Notes

- This project was migrated from NestJS to Express for a more streamlined deployment on Render.
- `API_PREFIX` defaults to `/api/v1`.
- `CORS_ORIGIN` should be a comma-separated list of allowed origins.

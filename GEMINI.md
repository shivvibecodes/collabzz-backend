# Collabzz Backend (Express)

## Overview
Collabzz Backend is a lightweight Node.js/Express application. It has been migrated from NestJS to provide a more streamlined and reliable deployment for basic API needs.

## Tech Stack
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose)
- **Validation:** Zod
- **Logging:** Morgan
- **Security:** Helmet, CORS
- **Language:** TypeScript

## Core Architecture

### 1. Minimal APIs
The server only exposes three functional APIs:
- `/health`: Liveness and readiness (DB check) probes.
- `/waitlist`: Handles waitlist registrations with Zod validation.
- `/contact`: Handles contact form submissions with Zod validation and a 1-minute rate limit per IP.

### 2. Environment Configuration
Environment variables are validated using Zod in `src/config/env.ts`.
- `API_PREFIX`: Global prefix for all routes (default: `/api/v1`).
- `CORS_ORIGIN`: Allowed origins for CORS.
- `MONGODB_URI`: MongoDB connection string.

### 3. Middleware
- `requestIdMiddleware`: Ensures every request and response has an `x-request-id` header.
- `errorHandler`: Global catch-all for errors, providing consistent JSON responses.
- `morgan`: Standard HTTP request logging.

## Directory Structure
- `src/config`: Configuration and DB connection.
- `src/controllers`: Request handlers and business logic.
- `src/middleware`: Global and route-specific middleware.
- `src/models`: Mongoose schemas.
- `src/routes`: Express route definitions.
- `src/utils`: Helper functions and Zod schemas.
- `src/index.ts`: Application entry point.

## Development Workflows

### Setup
1. Copy `.env.example` to `.env`.
2. Install dependencies: `pnpm install`.
3. Start development server: `pnpm run dev`.

### Build & Start
- Build: `pnpm run build`
- Start: `pnpm run start`

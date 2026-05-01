# Collabzz Backend

## Overview
Collabzz Backend is a NestJS application built with the Fastify adapter, providing a robust API for the Collabzz platform. It uses Mongoose for MongoDB interaction, Zod for schema validation, and an event-driven architecture for background tasks like email processing.

## Tech Stack
- **Framework:** NestJS (Fastify Adapter)
- **Database:** MongoDB (Mongoose)
- **Validation:** Zod (Environment & Config)
- **Authentication:** Passport (Google, YouTube OAuth2), JWT (Access/Refresh tokens)
- **Storage:** Cloudflare R2 (S3-compatible) via AWS SDK v3
- **Email:** Brevo (formerly Sendinblue) with custom event-driven processor
- **Testing:** Jest (Unit, Integration, E2E)
- **Tools:** pnpm, ESLint, Prettier, Husky

## Core Architecture & Patterns

### 1. Modular Design
The project follows the standard NestJS modular structure. Features are encapsulated in `src/modules`.
- `auth`: Google & YouTube authentication strategies.
- `email`: Event-driven email system using `EventEmitter2`.
- `uploads`: Handles file uploads to Cloudflare R2.
- `database`: Global Mongoose configuration.
- `cache`: Redis-based caching (via `cache-manager`).

### 2. Environment Configuration
Environment variables are strictly validated using Zod in `src/config/env.schema.ts`.
- All variables must be defined in `.env`.
- Use `ConfigService<Env, true>` for type-safe access to configuration.

### 3. Data Modeling
- **Shared Schemas:** Common schemas like `User` are located in `src/models`.
- **Module Schemas:** Module-specific schemas are in `src/modules/schemas` (e.g., `EmailLog`).
- **Naming:** Follows PascalCase for Classes/Schemas and camelCase for properties.

### 4. Global Middleware
- **Exception Filter:** `AllExceptionsFilter` handles uniform error responses.
- **Interceptors:** `RequestIdInterceptor` adds a unique ID to every request for tracking.
- **Security:** `helmet` and `CORS` are configured in `main.ts`.

### 5. Email System
- Uses an event-driven approach. `EmailService` emits `email.send` events.
- `EmailProcessor` listens for these events and handles template resolution and transport.
- Templates are TypeScript functions located in `src/modules/templates`.

## Development Workflows

### Setup
1. Copy `.env.example` to `.env`.
2. Install dependencies: `pnpm install`.
3. Start development server: `pnpm run start:dev`.

### Code Standards
- **Linting:** `pnpm run lint` (uses ESLint Flat Config).
- **Formatting:** `pnpm run format` (uses Prettier).
- **Commits:** Husky hooks run `lint-staged` and build checks.

### Testing
- **Unit/Integration:** `pnpm run test`
- **E2E:** `pnpm run test:e2e`
- Test files should follow the `*.spec.ts` naming convention.

## Directory Structure
- `src/common`: Global filters, interceptors, and decorators.
- `src/config`: Environment schema and validation.
- `src/models`: Shared Mongoose schemas and types.
- `src/modules`: Feature-based modules.
- `test`: E2E tests and integration test suites.

# Collabzz Backend

Production-oriented NestJS backend baseline with:

- NestJS + Fastify
- MongoDB Atlas (managed)
- Redis (Docker service)
- Zod config/input validation
- Cloudflare R2 signed upload URL flow
- Health endpoints + request ID tracing + rate limiting

## Prerequisites

- Node.js 22 LTS
- pnpm 10+
- Docker Desktop (for Redis)

## Setup

1. Install dependencies.

```bash
pnpm install
```

2. Copy `.env.example` to `.env` and fill real secrets and Atlas values.

3. Start Redis container.

```bash
docker compose up -d redis
```

4. Start API.

```bash
pnpm run start:dev
```

## Key Endpoints

- `GET /api/v1/health/live`
- `GET /api/v1/health/ready`
- `POST /api/v1/uploads/presign`
- `GET /api/v1/auth/health`

## Build and Lint

```bash
pnpm run lint
pnpm run build
```

## Notes

- MongoDB is expected from Atlas via `MONGODB_URI`.
- Redis is local in Docker using persistent volume `redis_collabzz_data`.
- Request throttling is enabled globally via environment variables.

# Novetta Auth Backend

This repository contains the authentication module for Novetta built with NestJS, TypeScript, Prisma, PostgreSQL and Redis.

Quick start (development):

1. Install dependencies

```bash
cd backend
npm install
```

2. Start services via Docker-compose (Postgres + Redis)

```bash
docker compose up -d
```

3. Generate Prisma client and run migrations

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

4. Start dev server

```bash
npm run start:dev
```

API docs: http://localhost:5000/docs


Security & production notes:
- Update `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` in environment.
- Use a managed Redis and Postgres in production.
- Configure SMTP provider for email OTP delivery.
- Add logging and monitoring hooks.

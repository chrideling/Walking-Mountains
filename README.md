# Walking Mountains

> Finding your way through a life that keeps moving.

A health integration app combining biometric data, life context, and AI coaching across Body, Mind, and World.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite + Tailwind CSS |
| Backend | Node.js + Fastify + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Cache | Redis |
| AI Coaching | Claude API (claude-sonnet-4-6) |
| Auth | JWT + refresh tokens |

## Getting started

### 1. Prerequisites

- Node.js 20+
- Docker (for Postgres + Redis)
- An Anthropic API key

### 2. Environment

```bash
cp .env.example .env
# Edit .env — set ANTHROPIC_API_KEY and any other values
```

### 3. Start the database

```bash
docker-compose up -d
```

### 4. Install dependencies

```bash
npm install
```

### 5. Run database migrations

```bash
npm run db:generate
npm run db:migrate
```

### 6. Start development servers

```bash
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3001
- Prisma Studio: `npm run db:studio`

## Project structure

```
walking-mountains/
├── apps/
│   ├── web/          # React frontend
│   └── api/          # Fastify backend
├── packages/
│   ├── db/           # Prisma schema + client
│   └── types/        # Shared TypeScript types
├── docker-compose.yml
└── .env.example
```

## Core concepts

- **Mountains** — Long-term life orientations (Body / Mind / World)
- **Hills** — Time-bound milestones that make a mountain measurable
- **Paths** — How you climb: hill-directed or open ongoing practices
- **Steps** — The atomic unit: path steps and free steps both count
- **Weather** — Daily energy state computed from HRV + sleep + stress

## Domain colours

| Domain | Colour | Hex |
|---|---|---|
| Body | Terracotta | `#C05C2E` |
| Mind | Slate blue | `#3D5A8A` |
| World | Forest green | `#4A7358` |

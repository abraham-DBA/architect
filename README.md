# The Architect

Personal goal management web application inspired by Jim Rohn's philosophy: *success is something you attract by the person you become.*

## Stack

- **Next.js 16** (App Router) + React + TypeScript
- **PostgreSQL** + Prisma ORM
- **Tailwind CSS**

## Getting started

### 1. Start PostgreSQL

```bash
docker compose up -d
```

### 2. Configure environment

```bash
cp .env.example .env
```

### 3. Install dependencies & set up the database

```bash
npm install
npm run db:push
npm run db:seed
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Onboarding flow

1. **Accomplishments Vault** — log at least 3 past wins
2. **Goal Brain Dump** — capture aspirations across life categories
3. **Priority Goal Builder** — select exactly 4 goals with WHY, identity, and action plans
4. **Dashboard** — daily command center (unlocked after 4 priority goals)

## Modules

| Module | Route |
|--------|-------|
| Accomplishments Vault | `/vault` |
| Goal Brain Dump | `/brain-dump` |
| Priority Goal Builder | `/priority-goals` |
| Dashboard | `/dashboard` |
| Goal Detail | `/goals/[id]` |
| Weekly Review | `/weekly-review` |
| Growth Journal | `/journal` |
| Reading Tracker | `/reading` |

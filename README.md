# TaxFlow (Tax-Calculator)
Next.js + Prisma app for UK tax workflows (individual, self-employed, and business/payroll).

## Local setup
1. Copy env template and add your database URL.
2. Install dependencies.
3. Run the app.

```bash
cp .env.example .env
npm install
npm run dev
```

## Database (PostgreSQL)
Prisma now uses PostgreSQL through `DATABASE_URL`.

- Local/dev: use any Postgres instance.
- Production (Vercel): use hosted Postgres (Neon, Supabase, Vercel Postgres, etc.) and set `DATABASE_URL` in Vercel Environment Variables.

## Deployment
The `build` script runs:
1. `prisma generate`
2. `prisma migrate deploy`
3. `next build`

So when Vercel deploys, your schema migrations are applied automatically to the database configured in `DATABASE_URL`.

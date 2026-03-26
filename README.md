# Wrap'n Bowl Stock Tracker

Simple, production-ready stock tracking for Wrap'n Bowl, Eugreeka!, and LEB+NOM.

## Stack
- Next.js (App Router) + TypeScript (strict)
- Tailwind CSS
- Supabase (Auth + Postgres)
- Prisma ORM
- Vercel-ready

## Project Structure
```
stock-tracker/
  prisma/
    schema.prisma
  scripts/
    import-excel.ts
    seed-demo.ts
  supabase/
    rls.sql
  src/
    app/
      (auth)/login/
      (app)/dashboard/
      (app)/products/
      (app)/products/[id]/
      (app)/products/[id]/edit/
      (app)/products/new/
      (app)/orders/
      (app)/orders/export/
      (app)/stock-updates/
      (app)/users/
      (app)/settings/
    components/
      app-shell.tsx
      form-feedback.tsx
      product-form.tsx
    lib/
      auth.ts
      db.ts
      demo-data.ts
      order-utils.ts
      product-utils.ts
      supabase/
        admin.ts
        client.ts
        server.ts
      utils.ts
  middleware.ts
  .env.example
  package.json
  tailwind.config.ts
  next.config.mjs
```

## Setup
1. Install dependencies (requires internet):
```
npm install
```
2. Copy env vars:
```
cp .env.example .env.local
```
3. Create your Supabase project and Postgres database.
4. Generate Prisma client and sync schema:
```
npm run prisma:generate
npm run db:push
```
5. Run the dev server:
```
npm run dev
```

## Supabase Auth
- Email/password or magic link
- 4 users total (admin + staff)
- Admin can manage users and deactivate

Supabase should have email auth enabled. Use the anon key on the client. Use the service role key only in server actions for admin operations.

## Excel Import
Import script uses upsert and safe fallbacks.
```
npm run import:excel -- "/Users/kemal/Downloads/Wrapn BowlStock list 2026.xlsx"
```
The mapping lives inside `scripts/import-excel.ts` and can be adjusted.

## Seed Data
```
npm run seed
```

## RLS (Optional)
Minimal policies in:
```
supabase/rls.sql
```
Apply these in Supabase SQL editor if you want authenticated-only access. For a small team, keep policies minimal.

## Deploy (Vercel)
1. Push repo to GitHub.
2. Connect to Vercel.
3. Add env vars from `.env.local`.
4. Ensure the database URL is reachable from Vercel.

## Notes
- Product brand filters use `brandLabel` and `brandTags` for combined brand labels.

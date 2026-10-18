# BloomNote BE (NestJS)

```bash
cp .env.example .env
npm install
npx prisma generate
npm run seed
npm run dev
```

http://localhost:4000

Kiến trúc: `src/modules` theo Nest — controller / service / guard, Prisma global.

```
src/
  main.ts
  app.module.ts
  prisma/
  auth/
  catalog/
  categories/
  templates/
  cards/
  uploads/
```

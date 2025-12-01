# Backend

Node.js Express API for e-commerce website.

## Setup

1. Install dependencies: `pnpm install`
2. Set up PostgreSQL database and update `.env` with DATABASE_URL
3. Run migrations: `npx prisma migrate dev`
4. Generate Prisma client: `npx prisma generate`
5. Build: `pnpm build`
6. Start: `pnpm start` or `pnpm dev` for development

## API Endpoints

### Users
- POST /api/users/signup
- POST /api/users/login
- GET /api/users/validate

### Products
- GET /api/products
- GET /api/products?category=...
- GET /api/products/:id
- POST /api/products (admin)

### Orders
- POST /api/orders
- GET /api/orders

## Tests

Run `pnpm test`
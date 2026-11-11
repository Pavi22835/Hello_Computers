# Hello Computers API

Express and Prisma API for the Hello Computers storefront and admin dashboard.

## Setup

1. Configure `backend/.env`, preserving existing database settings. For SQLite, `DATABASE_URL` must use Prisma's `file:` URL format. Set a unique `JWT_SECRET` of at least 32 characters, plus `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` for the administrator account (`ADMIN_PASSWORD` must be at least 12 characters). Store contact details and shipping rules are managed in the administrator dashboard.
2. Install dependencies with `npm install`.
3. Generate the Prisma client and create/update the local SQLite schema:

   ```sh
   npm run db:generate
   npm run db:push
   ```

4. Create or reset the administrator account using the `ADMIN_*` values in `.env`:

   ```sh
   npm run admin:create
   ```

5. Start the API with `npm run dev`. It listens on port 5000 by default.

The admin password is never seeded with a default value. Keep `.env` private and use HTTPS plus a strong secret in production.

## API

Public routes:

- `GET /api/health`
- `POST /api/auth/register` and `POST /api/auth/login`
- `GET /api/products`, `GET /api/products/:id`
- `GET /api/categories`, `GET /api/categories/:slug`
- `GET /api/offers`, `GET /api/services`
- `GET /api/settings`
- `POST /api/enquiries`
- Authenticated customer routes: `GET` and `PUT /api/cart`; `GET` and `POST /api/orders`; `GET /api/orders/:id`; `PATCH /api/auth/me`

Authenticated administrator routes accept `Authorization: Bearer <token>`:

- `GET /api/auth/me`
- `GET /api/admin/dashboard`
- `POST`, `PATCH /:id`, and `DELETE /:id` on `/api/products`, `/api/categories`, `/api/offers`, and `/api/services`
- `GET /api/enquiries`, `PATCH /api/enquiries/:id` (status), and `DELETE /api/enquiries/:id`
- `GET`, `POST`, `PATCH /:id`, and `DELETE /:id` on `/api/admin/customers`
- `GET`, `POST`, `PATCH /:id` (status), and `DELETE /:id` on `/api/admin/orders`
- `GET` and `PATCH /api/admin/settings`

Offer and service list endpoints return active records by default. Administrators can include inactive entries with `?includeInactive=true`.
Order totals and stock changes are calculated transactionally by the API; checkout currently records pay-on-delivery orders and does not capture online payments.

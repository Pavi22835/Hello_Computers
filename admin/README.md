# Hello Computers Admin Dashboard

This is the standalone admin application. It reuses the existing admin UI and management components, and calls the existing Express API. It does not own a database or change the backend schema.

## Run locally

1. Configure and start the API as described in [`../backend/README.md`](../backend/README.md).
2. Set `VITE_API_URL` in `admin/.env` to the backend API base URL (default: `http://localhost:5000/api`).
3. Run `npm install` once, then `npm run dev` from this directory.
4. Open `http://localhost:5174` and sign in with an administrator account created by the backend `admin:create` script.

The admin app listens on port 5174 so it can run alongside the customer frontend on port 5173. The backend's default CORS configuration allows both origins. If you change either origin, include the admin origin in backend `CORS_ORIGINS`.

The dashboard uses an expiring bearer token and only permits users with the `ADMIN` role. It supports dashboard metrics, product and category management, orders, customers, service enquiries, offers, services, store settings, and customer enquiries.

The source is organized under `src/components`, `src/pages`, `src/routes`, `src/services`, `src/hooks`, `src/utils`, `src/styles`, and `src/assets`. Menu entries for analytics, brands, subcategories, banners, coupons, messaging, reports, profile, roles, and activity logs are explicit placeholders because those features are not implemented by the existing API. They do not use mock data or submit operations.

## Production configuration

Set `VITE_API_URL` to the deployed backend API base URL at build time. Configure backend `CORS_ORIGINS` to include the deployed admin origin. The public frontend's optional Admin link can be pointed to the deployed admin application with `VITE_ADMIN_URL`.

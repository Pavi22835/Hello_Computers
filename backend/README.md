# Hello Computers API

Express and Prisma API for the Hello Computers storefront and admin dashboard.

## Setup

1. Configure `backend/.env` with a PostgreSQL `DATABASE_URL`. Set a unique `JWT_SECRET` of at least 32 characters, plus `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` for the administrator account (`ADMIN_PASSWORD` must be at least 12 characters). To enable online checkout and refunds, set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`; configure Razorpay to send `payment.captured`, `order.paid`, `payment.failed`, `refund.created`, `refund.processed`, and `refund.failed` events to `/api/orders/razorpay/webhook`. Store contact details and shipping rules are managed in the administrator dashboard.
   Optional WhatsApp order and service enquiry notifications use the WhatsApp Cloud API. Configure `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_API_VERSION`, the order templates `WHATSAPP_ORDER_CONFIRMATION_TEMPLATE` and `WHATSAPP_ORDER_STATUS_TEMPLATE`, and the service enquiry templates `WHATSAPP_SERVICE_ENQUIRY_CONFIRMATION_TEMPLATE` and `WHATSAPP_SERVICE_ENQUIRY_STATUS_TEMPLATE`. Approved template body variables are: order confirmation (`order number`, `customer name`, `total`, `payment method`), order status (`order number`, `status`, `payment status`, `total`), service confirmation (`enquiry ID`, `customer name`, `service type`, `status`), and service status (`enquiry ID`, `status`, `service type`, `customer name`). `WHATSAPP_DEFAULT_COUNTRY_CODE` and `WHATSAPP_TEMPLATE_LANGUAGE` are optional. The existing store WhatsApp contact link does not by itself enable automated messages.
2. Install dependencies with `npm install`.
3. Generate the Prisma client and create/update the PostgreSQL schema:

   ```sh
   npm run db:generate
   npm run db:push
   ```

4. Create or reset the administrator account using the `ADMIN_*` values in `.env`:

   ```sh
   npm run admin:create
   ```

   To grant administrator access to one existing account without changing its password or creating a duplicate:

   ```sh
   npm run admin:promote -- inwebz@gmail.com --confirm
   ```

   This command requires an existing account, matches email case-insensitively, and refuses ambiguous matches. Run it only from a trusted backend environment with authorized database access. Public registration continues to create customer accounts only.

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
- Authenticated customer routes: `GET` and `PUT /api/cart`; `GET` and `POST /api/orders`; `GET /api/orders/:id`; `PATCH /api/auth/me`; address CRUD under `/api/auth/me/addresses`; and `GET /api/services/requests`
- Service enquiry submission is available to guests and signed-in customers at `POST /api/services/requests`; guest status tracking uses `GET /api/services/requests/track/:trackingCode`

Authenticated customer routes also include `POST /api/orders/razorpay/order`, `POST /api/orders/razorpay/verify`, and `POST /api/orders/razorpay/failure`. The Razorpay webhook endpoint verifies `X-Razorpay-Signature` with the configured webhook secret.

Authenticated administrator routes accept `Authorization: Bearer <token>`:

- `GET /api/auth/me`
- `GET /api/admin/dashboard`
- `POST`, `PATCH /:id`, and `DELETE /:id` on `/api/products`, `/api/categories`, `/api/offers`, and `/api/services`
- `GET /api/enquiries`, `PATCH /api/enquiries/:id` (status), and `DELETE /api/enquiries/:id`
- `GET /api/admin/customers` (search, status and registration-date filters, sorting, pagination, order metrics), `GET /api/admin/customers/:id` (profile, addresses, order/payment, enquiry, and service-request history), and `PATCH /api/admin/customers/:id/status` (activate/deactivate)
- `GET /api/admin/service-enquiries` (search, filters, sorting, pagination, and status totals), `GET /api/admin/service-enquiries/:id`, `PATCH /api/admin/service-enquiries/:id/status`, and `POST /api/admin/service-enquiries/:id/notes`
- `GET /api/admin/orders` (search, filters, date range, sorting, pagination, and summary), `GET /api/admin/orders/:id`, `POST /api/admin/orders`, `PATCH /api/admin/orders/:id` (status), and `POST /api/admin/orders/:id/refund`
- `GET` and `PATCH /api/admin/settings`

Offer and service list endpoints return active records by default. Administrators can include inactive entries with `?includeInactive=true`.
Deactivated customer accounts cannot log in or use authenticated customer APIs. Customer profiles can manage their own contact details and saved addresses. Authenticated service enquiries are linked to the account; guest enquiries can be tracked with their private tracking code. There is no employee-management module, so service enquiry assignment is not enabled.
Order totals and sale prices are calculated by the API. Checkout supports pay on delivery and Razorpay; online stock is reserved during payment and decremented only after verified payment capture. Order transitions and stock restoration are transactional. Razorpay cancellation refunds are full refunds; stock is restored after the gateway confirms processing.

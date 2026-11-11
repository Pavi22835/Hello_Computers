# Hello Computers Admin Dashboard

The dashboard is part of the customer Vite application and is available at `/admin`. Its implementation is in [`../frontend/src/pages/Admin/Admin.jsx`](../frontend/src/pages/Admin/Admin.jsx); the file in this directory is a compatibility re-export, not a second dashboard implementation.

## Run locally

1. Start the API using the setup instructions in [`../backend/README.md`](../backend/README.md).
2. Start the existing customer frontend in `../frontend`.
3. Open `/admin` and sign in with the account created by the backend `admin:create` script.

The dashboard uses an expiring bearer token and only permits users with the `ADMIN` role. It supports catalogue and image CRUD, customer management, order creation and status management, and enquiry management.

# Hello Computers storefront

The customer storefront runs in this React + Vite application. The administrator dashboard is a standalone application in [`../admin`](../admin).

## Run locally

1. Start the API using the setup steps in [`../backend/README.md`](../backend/README.md).
2. Set `VITE_API_URL` if the API is not at `http://localhost:5000/api`. Set `VITE_ADMIN_URL` to the standalone admin URL if it is not `http://localhost:5174`.
3. Run `npm install`, `npm run dev`, `npm run lint`, and `npm run build`.
4. Create an administrator with the backend `admin:create` script, then sign in in the standalone admin app.

Products, categories, offers, services, carts, checkout, and order history are backed by the API. Guest carts are stored in the browser and merged into the database cart after sign-in.

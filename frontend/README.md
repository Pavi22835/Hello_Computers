# Hello Computers storefront

The customer storefront and administrator dashboard run in this React + Vite application. The dashboard is available at `/admin`.

## Run locally

1. Start the API using the setup steps in [`../backend/README.md`](../backend/README.md).
2. Set `VITE_API_URL` if the API is not at `http://localhost:5000/api`.
3. Run `npm install`, `npm run dev`, `npm run lint`, and `npm run build`.
4. Create an administrator with the backend `admin:create` script, then sign in at `/admin`.

Products, categories, offers, services, carts, checkout, and order history are backed by the API. Guest carts are stored in the browser and merged into the database cart after sign-in.

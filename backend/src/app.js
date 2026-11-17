const express = require("express");
const cors = require("cors");
const path = require("node:path");
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const categoryRoutes = require("./routes/category.routes");
const offerRoutes = require("./routes/offer.routes");
const serviceRoutes = require("./routes/service.routes");
const enquiryRoutes = require("./routes/enquiry.routes");
const adminRoutes = require("./routes/admin.routes");
const orderRoutes = require("./routes/order.routes");
const cartRoutes = require("./routes/cart.routes");
const settingsRoutes = require("./routes/settings.routes");
const pageRoutes = require("./routes/page.routes");
const orderController = require("./controllers/order.controller");
const errorMiddleware = require("./middlewares/error.middleware");

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173,http://localhost:5174")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    const error = new Error("This origin is not allowed by CORS.");
    error.status = 403;
    return callback(error);
  },
}));
app.post("/api/orders/razorpay/webhook", express.raw({ type: "application/json" }), orderController.razorpayWebhook);
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads"), { index: false }));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/pages", pageRoutes);
app.use("/api/admin", adminRoutes);

app.use((_request, response) => response.status(404).json({ message: "Route not found." }));
app.use(errorMiddleware);

module.exports = app;
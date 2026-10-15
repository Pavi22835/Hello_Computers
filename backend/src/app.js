const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const categoryRoutes = require("./routes/category.routes");
const offerRoutes = require("./routes/offer.routes");
const serviceRoutes = require("./routes/service.routes");
const enquiryRoutes = require("./routes/enquiry.routes");
const errorMiddleware = require("./middlewares/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/enquiries", enquiryRoutes);

app.use(errorMiddleware);

module.exports = app;
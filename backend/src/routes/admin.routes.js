const { Router } = require("express");
const prisma = require("../config/database");
const asyncHandler = require("../middlewares/asyncHandler");
const { requireAuth, requireAdmin } = require("../middlewares/auth.middleware");
const orderController = require("../controllers/order.controller");
const { requiredString, optionalString, email } = require("../utils/validation");
const { hashPassword } = require("../utils/password");
const { badRequest } = require("../utils/validation");
const settingsController = require("../controllers/settings.controller");

const router = Router();

router.use(requireAuth, requireAdmin);
router.get("/dashboard", asyncHandler(async (_request, response) => {
  const [products, categories, offers, services, enquiries, newEnquiries, lowStock, orders, customers] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.offer.count({ where: { isActive: true } }),
    prisma.service.count({ where: { isActive: true } }),
    prisma.enquiry.count(),
    prisma.enquiry.count({ where: { status: "NEW" } }),
    prisma.product.count({ where: { stock: { lte: 5 } } }),
    prisma.order.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
  ]);
  response.json({ products, categories, offers, services, enquiries, newEnquiries, lowStock, orders, customers });
}));

router.get("/settings", settingsController.getAdmin);
router.patch("/settings", settingsController.update);

router.get("/orders", orderController.listAll);
router.post("/orders", orderController.createForCustomer);
router.patch("/orders/:id", orderController.updateStatus);
router.delete("/orders/:id", orderController.remove);

router.get("/customers", asyncHandler(async (_request, response) => {
  response.json(await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    select: { id: true, name: true, email: true, phone: true, createdAt: true, _count: { select: { orders: true } } },
    orderBy: { createdAt: "desc" },
  }));
}));

router.post("/customers", asyncHandler(async (request, response) => {
  const password = request.body.password;
  if (typeof password !== "string" || password.length < 8 || password.length > 200) {
    throw badRequest("Password must contain 8 to 200 characters.");
  }
  const user = await prisma.user.create({
    data: {
      name: requiredString(request.body.name, "Name", 120),
      email: email(request.body.email),
      phone: optionalString(request.body.phone, "Phone", 40),
      passwordHash: await hashPassword(password),
      role: "CUSTOMER",
    },
    select: { id: true, name: true, email: true, phone: true, createdAt: true },
  });
  response.status(201).json(user);
}));

router.patch("/customers/:id", asyncHandler(async (request, response) => {
  const data = {};
  if (request.body.name !== undefined) data.name = requiredString(request.body.name, "Name", 120);
  if (request.body.email !== undefined) data.email = email(request.body.email);
  if (request.body.phone !== undefined) data.phone = optionalString(request.body.phone, "Phone", 40);
  if (!Object.keys(data).length) throw badRequest("Provide a customer field to update.");
  const result = await prisma.user.updateMany({
    where: { id: request.params.id, role: "CUSTOMER" },
    data,
  });
  if (result.count === 0) {
    const error = new Error("Customer not found.");
    error.status = 404;
    throw error;
  }
  response.json(await prisma.user.findUnique({
    where: { id: request.params.id },
    select: { id: true, name: true, email: true, phone: true, createdAt: true },
  }));
}));

router.delete("/customers/:id", asyncHandler(async (request, response) => {
  const result = await prisma.user.deleteMany({
    where: { id: request.params.id, role: "CUSTOMER" },
  });
  if (result.count === 0) {
    const error = new Error("Customer not found.");
    error.status = 404;
    throw error;
  }
  response.status(204).end();
}));

module.exports = router;

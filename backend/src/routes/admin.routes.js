const { Router } = require("express");
const prisma = require("../config/database");
const asyncHandler = require("../middlewares/asyncHandler");
const { requireAuth, requireAdmin } = require("../middlewares/auth.middleware");
const orderController = require("../controllers/order.controller");
const customerController = require("../controllers/customer.controller");
const serviceEnquiryController = require("../controllers/service-enquiry.controller");
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
router.get("/orders/:id", orderController.getAdmin);
router.patch("/orders/:id", orderController.updateStatus);
router.post("/orders/:id/refund", orderController.refundOrder);

router.get("/customers", customerController.list);
router.get("/customers/:id", customerController.getById);
router.patch("/customers/:id/status", customerController.updateStatus);

router.get("/service-enquiries", serviceEnquiryController.listAdmin);
router.get("/service-enquiries/:id", serviceEnquiryController.getAdmin);
router.patch("/service-enquiries/:id/status", serviceEnquiryController.updateStatus);
router.post("/service-enquiries/:id/notes", serviceEnquiryController.addInternalNote);

module.exports = router;

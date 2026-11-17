const { Router } = require("express");
const orderController = require("../controllers/order.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = Router();

router.use(requireAuth);
router.get("/", orderController.listMine);
router.post("/", orderController.create);
router.post("/razorpay/order", orderController.createRazorpayOrder);
router.post("/razorpay/verify", orderController.verifyRazorpayPayment);
router.post("/razorpay/failure", orderController.failRazorpayPayment);
router.get("/:id", orderController.getMine);

module.exports = router;

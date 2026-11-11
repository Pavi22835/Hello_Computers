const { Router } = require("express");
const productController = require("../controllers/product.controller");
const { requireAuth, requireAdmin } = require("../middlewares/auth.middleware");

const router = Router();

router.get("/", productController.list);
router.get("/:id", productController.getById);
router.post("/", requireAuth, requireAdmin, productController.create);
router.patch("/:id", requireAuth, requireAdmin, productController.update);
router.delete("/:id", requireAuth, requireAdmin, productController.remove);

module.exports = router;
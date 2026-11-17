const { Router } = require("express");
const productController = require("../controllers/product.controller");
const { requireAuth, requireAdmin } = require("../middlewares/auth.middleware");
const uploadProductImages = require("../middlewares/product-upload.middleware");

const router = Router();

router.get("/", productController.list);
router.get("/filters", productController.filters);
router.get("/admin", requireAuth, requireAdmin, productController.listAdmin);
router.post("/images", requireAuth, requireAdmin, uploadProductImages, productController.uploadImages);
router.get("/:id", productController.getById);
router.post("/", requireAuth, requireAdmin, productController.create);
router.patch("/:id", requireAuth, requireAdmin, productController.update);
router.delete("/:id", requireAuth, requireAdmin, productController.remove);

module.exports = router;
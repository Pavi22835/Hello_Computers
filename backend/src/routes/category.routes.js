const { Router } = require("express");
const categoryController = require("../controllers/category.controller");
const { requireAuth, requireAdmin } = require("../middlewares/auth.middleware");
const uploadCategoryImage = require("../middlewares/category-upload.middleware");

const router = Router();

router.get("/", categoryController.list);
router.get("/admin", requireAuth, requireAdmin, categoryController.listAdmin);
router.post("/images", requireAuth, requireAdmin, uploadCategoryImage, categoryController.uploadImage);
router.get("/:slug", categoryController.getBySlug);
router.post("/", requireAuth, requireAdmin, categoryController.create);
router.patch("/:id", requireAuth, requireAdmin, categoryController.update);
router.delete("/:id", requireAuth, requireAdmin, categoryController.remove);

module.exports = router;
const { Router } = require("express");
const categoryController = require("../controllers/category.controller");
const { requireAuth, requireAdmin } = require("../middlewares/auth.middleware");

const router = Router();

router.get("/", categoryController.list);
router.get("/:slug", categoryController.getBySlug);
router.post("/", requireAuth, requireAdmin, categoryController.create);
router.patch("/:id", requireAuth, requireAdmin, categoryController.update);
router.delete("/:id", requireAuth, requireAdmin, categoryController.remove);

module.exports = router;
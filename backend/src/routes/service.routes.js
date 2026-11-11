const { Router } = require("express");
const serviceController = require("../controllers/service.controller");
const { requireAuth, requireAdmin } = require("../middlewares/auth.middleware");

const router = Router();

router.get("/", serviceController.list);
router.post("/", requireAuth, requireAdmin, serviceController.create);
router.patch("/:id", requireAuth, requireAdmin, serviceController.update);
router.delete("/:id", requireAuth, requireAdmin, serviceController.remove);

module.exports = router;
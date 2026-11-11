const { Router } = require("express");
const offerController = require("../controllers/offer.controller");
const { requireAuth, requireAdmin } = require("../middlewares/auth.middleware");

const router = Router();

router.get("/", offerController.list);
router.post("/", requireAuth, requireAdmin, offerController.create);
router.patch("/:id", requireAuth, requireAdmin, offerController.update);
router.delete("/:id", requireAuth, requireAdmin, offerController.remove);

module.exports = router;
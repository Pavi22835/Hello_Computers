const { Router } = require("express");
const enquiryController = require("../controllers/enquiry.controller");
const { requireAuth, requireAdmin } = require("../middlewares/auth.middleware");

const router = Router();

router.post("/", enquiryController.create);
router.get("/", requireAuth, requireAdmin, enquiryController.list);
router.patch("/:id", requireAuth, requireAdmin, enquiryController.update);
router.delete("/:id", requireAuth, requireAdmin, enquiryController.remove);

module.exports = router;
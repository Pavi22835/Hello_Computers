const { Router } = require("express");
const serviceController = require("../controllers/service.controller");
const serviceEnquiryController = require("../controllers/service-enquiry.controller");
const { optionalAuth, requireAuth, requireAdmin } = require("../middlewares/auth.middleware");

const router = Router();

router.get("/", serviceController.list);
router.get("/requests/track/:trackingCode", serviceEnquiryController.trackGuestRequest);
router.get("/requests", requireAuth, serviceEnquiryController.listMine);
router.post("/requests", optionalAuth, serviceEnquiryController.create);
router.post("/", requireAuth, requireAdmin, serviceController.create);
router.patch("/:id", requireAuth, requireAdmin, serviceController.update);
router.delete("/:id", requireAuth, requireAdmin, serviceController.remove);

module.exports = router;
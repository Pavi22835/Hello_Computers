const { Router } = require("express");
const cartController = require("../controllers/cart.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = Router();

router.use(requireAuth);
router.get("/", cartController.list);
router.put("/", cartController.replace);

module.exports = router;

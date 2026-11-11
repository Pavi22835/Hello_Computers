const { Router } = require("express");
const authController = require("../controllers/auth.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = Router();

router.post("/login", authController.login);
router.post("/register", authController.register);
router.get("/me", requireAuth, authController.me);
router.patch("/me", requireAuth, authController.updateMe);

module.exports = router;
const { Router } = require("express");
const settingsController = require("../controllers/settings.controller");

const router = Router();

router.get("/", settingsController.getPublic);

module.exports = router;

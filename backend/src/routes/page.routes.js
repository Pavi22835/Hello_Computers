const { Router } = require("express");
const pageController = require("../controllers/page.controller");

const router = Router();

router.get("/:page", pageController.getPublic);

module.exports = router;

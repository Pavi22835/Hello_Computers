const { Router } = require("express");
const serviceController = require("../controllers/service.controller");

const router = Router();

router.get("/", serviceController.list);

module.exports = router;
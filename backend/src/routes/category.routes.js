const { Router } = require("express");
const categoryController = require("../controllers/category.controller");

const router = Router();

router.get("/", categoryController.list);
router.get("/:slug", categoryController.getBySlug);

module.exports = router;
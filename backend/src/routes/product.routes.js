const { Router } = require("express");
const productController = require("../controllers/product.controller");

const router = Router();

router.get("/", productController.list);
router.get("/:id", productController.getById);

module.exports = router;
const { Router } = require("express");
const enquiryController = require("../controllers/enquiry.controller");

const router = Router();

router.post("/", enquiryController.create);

module.exports = router;
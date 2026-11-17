const createImageUpload = require("./image-upload.middleware");

module.exports = createImageUpload("products", "images", 10);

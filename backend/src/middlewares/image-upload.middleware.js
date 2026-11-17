const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const multer = require("multer");

const allowedTypes = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/avif", ".avif"],
]);

module.exports = function createImageUpload(directory, fieldName, maxFiles = 10) {
  const uploadDirectory = path.join(__dirname, "../../uploads", directory);
  fs.mkdirSync(uploadDirectory, { recursive: true });

  const upload = multer({
    storage: multer.diskStorage({
      destination: (_request, _file, callback) => callback(null, uploadDirectory),
      filename: (_request, file, callback) => {
        const extension = allowedTypes.get(file.mimetype);
        callback(null, `${crypto.randomBytes(16).toString("hex")}${extension}`);
      },
    }),
    limits: { files: maxFiles, fileSize: 8 * 1024 * 1024 },
    fileFilter: (_request, file, callback) => {
      if (!allowedTypes.has(file.mimetype)) {
        const error = new Error("Only JPEG, PNG, WebP, or AVIF images are supported.");
        error.status = 400;
        return callback(error);
      }
      callback(null, true);
    },
  });
  const parse = maxFiles === 1 ? upload.single(fieldName) : upload.array(fieldName, maxFiles);

  return function imageUpload(request, response, next) {
    parse(request, response, (error) => {
      if (!error) return next();
      if (error instanceof multer.MulterError) error.status = 400;
      next(error);
    });
  };
};

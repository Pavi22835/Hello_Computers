const prisma = require("../config/database");
const asyncHandler = require("../middlewares/asyncHandler");
const { badRequest } = require("../utils/validation");

const editablePages = ["home", "about"];

function pageName(value) {
  if (!editablePages.includes(value)) throw badRequest("Page must be home or about.");
  return value;
}

exports.getPublic = asyncHandler(async (request, response) => {
  const page = pageName(request.params.page);
  const record = await prisma.pageContent.findUnique({ where: { page } });
  response.json(record?.content || {});
});

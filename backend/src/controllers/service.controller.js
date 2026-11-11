const prisma = require("../config/database");
const asyncHandler = require("../middlewares/asyncHandler");
const { requiredString, optionalString, optionalUrl, boolean } = require("../utils/validation");

function serviceData(body, partial = false) {
  const data = {};
  if (!partial || body.title !== undefined) data.title = requiredString(body.title, "Title", 180);
  if (!partial || body.description !== undefined) data.description = requiredString(body.description, "Description", 2000);
  if (!partial || body.imageUrl !== undefined) data.imageUrl = optionalUrl(body.imageUrl, "Image URL");
  if (body.isActive !== undefined || !partial) data.isActive = boolean(body.isActive, "Active status");
  return data;
}

exports.list = asyncHandler(async (request, response) => {
  const where = request.query.includeInactive === "true" ? {} : { isActive: true };
  response.json(await prisma.service.findMany({ where, orderBy: { createdAt: "desc" } }));
});

exports.create = asyncHandler(async (request, response) => {
  response.status(201).json(await prisma.service.create({ data: serviceData(request.body) }));
});

exports.update = asyncHandler(async (request, response) => {
  response.json(await prisma.service.update({
    where: { id: request.params.id },
    data: serviceData(request.body, true),
  }));
});

exports.remove = asyncHandler(async (request, response) => {
  await prisma.service.delete({ where: { id: request.params.id } });
  response.status(204).end();
});
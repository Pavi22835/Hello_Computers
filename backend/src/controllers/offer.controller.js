const prisma = require("../config/database");
const asyncHandler = require("../middlewares/asyncHandler");
const { requiredString, optionalString, optionalUrl, optionalNumber, optionalDate, boolean, badRequest } = require("../utils/validation");

function offerData(body, partial = false) {
  const data = {};
  if (!partial || body.title !== undefined) data.title = requiredString(body.title, "Title", 180);
  if (!partial || body.description !== undefined) data.description = requiredString(body.description, "Description", 2000);
  if (body.discount !== undefined || !partial) {
    data.discount = optionalNumber(body.discount, "Discount", { min: 0, max: 100 });
  }
  if (body.imageUrl !== undefined || !partial) data.imageUrl = optionalUrl(body.imageUrl, "Image URL");
  if (body.startsAt !== undefined || !partial) data.startsAt = optionalDate(body.startsAt, "Start date");
  if (body.endsAt !== undefined || !partial) data.endsAt = optionalDate(body.endsAt, "End date");
  if (data.startsAt && data.endsAt && data.endsAt < data.startsAt) throw badRequest("End date must be after start date.");
  if (body.isActive !== undefined || !partial) data.isActive = boolean(body.isActive, "Active status");
  return data;
}

exports.list = asyncHandler(async (request, response) => {
  const now = new Date();
  const where = request.query.includeInactive === "true" ? {} : {
    isActive: true,
    AND: [
      { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
      { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
    ],
  };
  response.json(await prisma.offer.findMany({ where, orderBy: { createdAt: "desc" } }));
});

exports.create = asyncHandler(async (request, response) => {
  response.status(201).json(await prisma.offer.create({ data: offerData(request.body) }));
});

exports.update = asyncHandler(async (request, response) => {
  response.json(await prisma.offer.update({
    where: { id: request.params.id },
    data: offerData(request.body, true),
  }));
});

exports.remove = asyncHandler(async (request, response) => {
  await prisma.offer.delete({ where: { id: request.params.id } });
  response.status(204).end();
});
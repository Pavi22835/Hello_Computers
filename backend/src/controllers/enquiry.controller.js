const prisma = require("../config/database");
const asyncHandler = require("../middlewares/asyncHandler");
const { requiredString, optionalString, email, badRequest } = require("../utils/validation");

exports.create = asyncHandler(async (request, response) => {
  const address = email(request.body.email);
  const customer = request.user?.role === "CUSTOMER" ? request.user : null;
  const enquiry = await prisma.$transaction(async (transaction) => {
    if (customer) {
      await transaction.user.update({
        where: { id: customer.id },
        data: { lastActivityAt: new Date() },
      });
    }
    return transaction.enquiry.create({
      data: {
        userId: customer?.id,
        name: requiredString(request.body.name, "Name", 120),
        email: address,
        phone: optionalString(request.body.phone, "Phone", 40),
        message: requiredString(request.body.message, "Message", 4000),
      },
    });
  });
  response.status(201).json(enquiry);
});

exports.list = asyncHandler(async (request, response) => {
  const where = request.query.status ? { status: String(request.query.status).toUpperCase() } : {};
  response.json(await prisma.enquiry.findMany({ where, orderBy: { createdAt: "desc" } }));
});

exports.update = asyncHandler(async (request, response) => {
  const status = requiredString(request.body.status, "Status", 30).toUpperCase();
  if (!["NEW", "IN_PROGRESS", "RESOLVED"].includes(status)) throw badRequest("Status must be NEW, IN_PROGRESS, or RESOLVED.");
  response.json(await prisma.enquiry.update({
    where: { id: request.params.id },
    data: { status },
  }));
});

exports.remove = asyncHandler(async (request, response) => {
  await prisma.enquiry.delete({ where: { id: request.params.id } });
  response.status(204).end();
});
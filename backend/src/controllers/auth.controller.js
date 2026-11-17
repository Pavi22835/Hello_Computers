const prisma = require("../config/database");
const asyncHandler = require("../middlewares/asyncHandler");
const { requiredString, optionalString, email, badRequest } = require("../utils/validation");
const { hashPassword, verifyPassword } = require("../utils/password");
const { signToken } = require("../utils/token");

exports.login = asyncHandler(async (request, response) => {
  const address = email(request.body.email);
  const password = request.body.password;
  if (typeof password !== "string" || !password) throw badRequest("Password is required.");
  const user = await prisma.user.findUnique({ where: { email: address } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return response.status(401).json({ message: "Email or password is incorrect." });
  }
  if (!user.isActive) {
    return response.status(401).json({ message: "This account has been deactivated. Contact support for assistance." });
  }
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { lastActivityAt: new Date() },
    select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, lastActivityAt: true },
  });
  response.json({
    token: signToken(updatedUser),
    user: updatedUser,
  });
});

exports.register = asyncHandler(async (request, response) => {
  const name = requiredString(request.body.name, "Name", 120);
  const address = email(request.body.email);
  const password = request.body.password;
  if (typeof password !== "string" || !password || password.length > 200) throw badRequest("Password must contain 1 to 200 characters.");
  if (password.length < 8) throw badRequest("Password must be at least 8 characters.");
  const user = await prisma.user.create({
    data: {
      name,
      email: address,
      phone: request.body.phone ? requiredString(request.body.phone, "Phone", 40) : null,
      passwordHash: await hashPassword(password),
      role: "CUSTOMER",
      lastActivityAt: new Date(),
    },
    select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, lastActivityAt: true },
  });
  response.status(201).json({ token: signToken(user), user });
});

exports.me = (request, response) => response.json({ user: request.user });

exports.updateMe = asyncHandler(async (request, response) => {
  const data = { lastActivityAt: new Date() };
  if (request.body.name !== undefined) data.name = requiredString(request.body.name, "Name", 120);
  if (request.body.email !== undefined) data.email = email(request.body.email);
  if (request.body.phone !== undefined) data.phone = optionalString(request.body.phone, "Phone", 40);
  if (Object.keys(data).every((key) => key === "lastActivityAt")) throw badRequest("Provide a name, email, or phone number to update.");

  const user = await prisma.$transaction(async (transaction) => {
    if (data.email && data.email !== request.user.email) {
      await transaction.enquiry.updateMany({
        where: {
          userId: null,
          email: { equals: request.user.email, mode: "insensitive" },
        },
        data: { userId: request.user.id },
      });
    }
    return transaction.user.update({
      where: { id: request.user.id },
      data,
      select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, lastActivityAt: true },
    });
  });
  response.json({ user });
});

function addressData(body, partial = false) {
  const fields = {
    label: ["Label", 40],
    recipientName: ["Recipient name", 120],
    phone: ["Phone", 40],
    streetAddress: ["Street address", 500],
    city: ["City", 120],
    state: ["State", 120],
    postalCode: ["Postal code", 20],
    country: ["Country", 100],
  };
  const data = {};
  for (const [field, [label, limit]] of Object.entries(fields)) {
    if (!partial || body[field] !== undefined) data[field] = requiredString(body[field], label, limit);
  }
  if (!partial || body.isDefault !== undefined) data.isDefault = body.isDefault === undefined
    ? false
    : body.isDefault;
  if (data.isDefault !== undefined && typeof data.isDefault !== "boolean") {
    throw badRequest("Default status must be true or false.");
  }
  if (partial && Object.keys(data).length === 0) throw badRequest("Provide at least one address field to update.");
  return data;
}

exports.listAddresses = asyncHandler(async (request, response) => {
  response.json(await prisma.customerAddress.findMany({
    where: { userId: request.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  }));
});

exports.createAddress = asyncHandler(async (request, response) => {
  const data = addressData(request.body);
  const address = await prisma.$transaction(async (transaction) => {
    if (data.isDefault) {
      await transaction.customerAddress.updateMany({
        where: { userId: request.user.id },
        data: { isDefault: false },
      });
    }
    await transaction.user.update({
      where: { id: request.user.id },
      data: { lastActivityAt: new Date() },
    });
    return transaction.customerAddress.create({
      data: { ...data, userId: request.user.id },
    });
  });
  response.status(201).json(address);
});

exports.updateAddress = asyncHandler(async (request, response) => {
  const data = addressData(request.body, true);
  const address = await prisma.$transaction(async (transaction) => {
    const existing = await transaction.customerAddress.findFirst({
      where: { id: request.params.addressId, userId: request.user.id },
      select: { id: true },
    });
    if (!existing) {
      const error = new Error("Address not found.");
      error.status = 404;
      throw error;
    }
    if (data.isDefault) {
      await transaction.customerAddress.updateMany({
        where: { userId: request.user.id, id: { not: existing.id } },
        data: { isDefault: false },
      });
    }
    await transaction.user.update({
      where: { id: request.user.id },
      data: { lastActivityAt: new Date() },
    });
    return transaction.customerAddress.update({
      where: { id: existing.id },
      data,
    });
  });
  response.json(address);
});

exports.removeAddress = asyncHandler(async (request, response) => {
  const result = await prisma.$transaction(async (transaction) => {
    const deleted = await transaction.customerAddress.deleteMany({
      where: { id: request.params.addressId, userId: request.user.id },
    });
    if (deleted.count) {
      await transaction.user.update({
        where: { id: request.user.id },
        data: { lastActivityAt: new Date() },
      });
    }
    return deleted;
  });
  if (result.count === 0) {
    const error = new Error("Address not found.");
    error.status = 404;
    throw error;
  }
  response.status(204).end();
});
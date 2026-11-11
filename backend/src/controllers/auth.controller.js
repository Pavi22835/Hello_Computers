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
  response.json({
    token: signToken(user),
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
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
    },
    select: { id: true, name: true, email: true, phone: true, role: true },
  });
  response.status(201).json({ token: signToken(user), user });
});

exports.me = (request, response) => response.json({ user: request.user });

exports.updateMe = asyncHandler(async (request, response) => {
  const data = {};
  if (request.body.name !== undefined) data.name = requiredString(request.body.name, "Name", 120);
  if (request.body.email !== undefined) data.email = email(request.body.email);
  if (request.body.phone !== undefined) data.phone = optionalString(request.body.phone, "Phone", 40);
  if (!Object.keys(data).length) throw badRequest("Provide a name or phone number to update.");

  const user = await prisma.user.update({
    where: { id: request.user.id },
    data,
    select: { id: true, name: true, email: true, phone: true, role: true },
  });
  response.json({ user });
});
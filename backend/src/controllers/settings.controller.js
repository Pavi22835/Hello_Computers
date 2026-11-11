const prisma = require("../config/database");
const asyncHandler = require("../middlewares/asyncHandler");
const { badRequest, optionalString, optionalNumber, email } = require("../utils/validation");

const emptySettings = {
  id: "store",
  phone: null,
  whatsappNumber: null,
  email: null,
  address: null,
  hours: null,
  shippingFee: null,
  freeShippingThreshold: null,
};

function settingsData(body) {
  const data = {};
  for (const field of ["phone", "whatsappNumber", "address", "hours"]) {
    if (body[field] !== undefined) data[field] = optionalString(body[field], field, 500);
  }
  if (body.email !== undefined) {
    data.email = body.email === null || body.email === "" ? null : email(body.email);
  }
  if (body.shippingFee !== undefined) data.shippingFee = optionalNumber(body.shippingFee, "Shipping fee");
  if (body.freeShippingThreshold !== undefined) {
    data.freeShippingThreshold = optionalNumber(body.freeShippingThreshold, "Free shipping threshold");
  }
  if (!Object.keys(data).length) throw badRequest("Provide at least one setting to update.");
  return data;
}

exports.getPublic = asyncHandler(async (_request, response) => {
  const settings = await prisma.storeSettings.findUnique({ where: { id: "store" } });
  response.json(settings || emptySettings);
});

exports.getAdmin = asyncHandler(async (_request, response) => {
  const settings = await prisma.storeSettings.findUnique({ where: { id: "store" } });
  response.json(settings || emptySettings);
});

exports.update = asyncHandler(async (request, response) => {
  const data = settingsData(request.body);
  const settings = await prisma.storeSettings.upsert({
    where: { id: "store" },
    create: { id: "store", ...data },
    update: data,
  });
  response.json(settings);
});

const crypto = require("node:crypto");
const prisma = require("../config/database");
const asyncHandler = require("../middlewares/asyncHandler");
const { badRequest, requiredString, integer, email } = require("../utils/validation");

const orderInclude = {
  user: { select: { id: true, name: true, email: true, phone: true } },
  items: { orderBy: { id: "asc" } },
};

function shippingPrice(subtotal, settings) {
  const fee = settings?.shippingFee ?? 0;
  const threshold = settings?.freeShippingThreshold;
  return threshold !== null && threshold !== undefined && subtotal >= threshold ? 0 : fee;
}

function orderDetails(body) {
  const items = body.items;
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
    throw badRequest("An order must contain between 1 and 50 items.");
  }
  const quantities = new Map();
  for (const item of items) {
    const productId = requiredString(item?.productId, "Product ID", 100);
    const quantity = integer(item?.quantity, "Quantity", { min: 1, max: 100 });
    quantities.set(productId, (quantities.get(productId) || 0) + quantity);
  }
  for (const quantity of quantities.values()) {
    if (quantity > 100) throw badRequest("A product quantity cannot exceed 100.");
  }

  return {
    quantities,
    customerName: requiredString(body.customerName, "Name", 120),
    email: email(body.email),
    phone: requiredString(body.phone, "Phone", 40),
    address: requiredString(body.address, "Address", 500),
    city: requiredString(body.city, "City", 120),
    state: requiredString(body.state, "State", 120),
    postalCode: requiredString(body.postalCode, "Postal code", 20),
  };
}

async function createOrder(body, userId) {
  const details = orderDetails(body);

  return prisma.$transaction(async (transaction) => {
    const products = await transaction.product.findMany({
      where: { id: { in: [...details.quantities.keys()] } },
    });
    if (products.length !== details.quantities.size) throw badRequest("One or more products are no longer available.");

    let subtotal = 0;
    const orderItems = products.map((product) => {
      const quantity = details.quantities.get(product.id);
      if (product.stock < quantity) {
        const error = new Error(`${product.name} does not have enough stock.`);
        error.status = 409;
        throw error;
      }
      const lineTotal = product.price * quantity;
      subtotal += lineTotal;
      return {
        productId: product.id,
        productName: product.name,
        imageUrl: product.imageUrl,
        quantity,
        unitPrice: product.price,
        lineTotal,
      };
    });
    const settings = await transaction.storeSettings.findUnique({ where: { id: "store" } });
    const shippingCost = shippingPrice(subtotal, settings);

    for (const item of orderItems) {
      const result = await transaction.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (result.count !== 1) {
        const error = new Error("Stock changed during checkout. Please review your cart and try again.");
        error.status = 409;
        throw error;
      }
    }

    const order = await transaction.order.create({
      data: {
        orderNumber: `HC-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
        userId,
        subtotal,
        shippingCost,
        total: subtotal + shippingCost,
        customerName: details.customerName,
        email: details.email,
        phone: details.phone,
        address: details.address,
        city: details.city,
        state: details.state,
        postalCode: details.postalCode,
        items: { create: orderItems },
      },
      include: orderInclude,
    });
    await transaction.cartItem.deleteMany({ where: { userId } });
    return order;
  });
}

exports.create = asyncHandler(async (request, response) => {
  const order = await createOrder(request.body, request.user.id);
  response.status(201).json(order);
});

exports.createForCustomer = asyncHandler(async (request, response) => {
  const userId = requiredString(request.body.userId, "Customer ID", 100);
  const customer = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
  if (!customer || customer.role !== "CUSTOMER") throw badRequest("The selected customer account does not exist.");
  const order = await createOrder(request.body, customer.id);
  response.status(201).json(order);
});

exports.listMine = asyncHandler(async (request, response) => {
  const orders = await prisma.order.findMany({
    where: { userId: request.user.id },
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });
  response.json(orders);
});

exports.getMine = asyncHandler(async (request, response) => {
  const order = await prisma.order.findFirst({
    where: { id: request.params.id, userId: request.user.id },
    include: orderInclude,
  });
  if (!order) return response.status(404).json({ message: "Order not found." });
  response.json(order);
});

exports.listAll = asyncHandler(async (_request, response) => {
  response.json(await prisma.order.findMany({ include: orderInclude, orderBy: { createdAt: "desc" } }));
});

exports.updateStatus = asyncHandler(async (request, response) => {
  const status = requiredString(request.body.status, "Status", 30).toUpperCase();
  if (!["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].includes(status)) {
    throw badRequest("Status must be PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, or CANCELLED.");
  }

  const order = await prisma.$transaction(async (transaction) => {
    const current = await transaction.order.findUnique({
      where: { id: request.params.id },
      include: { items: true },
    });
    if (!current) {
      const error = new Error("The requested order was not found.");
      error.status = 404;
      throw error;
    }
    if (current.status === "CANCELLED" && status !== "CANCELLED") {
      throw badRequest("A cancelled order cannot be reopened.");
    }
    if (status === "CANCELLED" && current.status !== "CANCELLED") {
      for (const item of current.items) {
        if (item.productId) {
          await transaction.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
    }
    return transaction.order.update({
      where: { id: current.id },
      data: { status },
      include: orderInclude,
    });
  });
  response.json(order);
});

exports.remove = asyncHandler(async (request, response) => {
  await prisma.$transaction(async (transaction) => {
    const order = await transaction.order.findUnique({
      where: { id: request.params.id },
      include: { items: true },
    });
    if (!order) {
      const error = new Error("The requested order was not found.");
      error.status = 404;
      throw error;
    }
    if (order.status !== "CANCELLED" && order.status !== "DELIVERED") {
      for (const item of order.items) {
        if (item.productId) {
          await transaction.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
    }
    await transaction.order.delete({ where: { id: order.id } });
  });
  response.status(204).end();
});

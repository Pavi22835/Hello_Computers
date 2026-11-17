const crypto = require("node:crypto");
const prisma = require("../config/database");
const asyncHandler = require("../middlewares/asyncHandler");
const { badRequest, requiredString, integer, email, optionalDate } = require("../utils/validation");
const { getRazorpay, getPublicKeyId } = require("../services/razorpay.service");
const { sendOrderNotification } = require("../services/whatsapp.service");

const orderInclude = {
  user: { select: { id: true, name: true, email: true, phone: true } },
  items: { orderBy: { id: "asc" } },
};
const adminOrderInclude = {
  ...orderInclude,
  refunds: { orderBy: { createdAt: "desc" } },
};
const orderTransitions = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

function notifyOrder(order, type) {
  sendOrderNotification(order, type).catch((error) => {
    console.error(`Order ${type} WhatsApp notification failed for ${order.orderNumber}:`, error.message);
  });
}

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
      where: { id: { in: [...details.quantities.keys()] }, isActive: true },
    });
    if (products.length !== details.quantities.size) throw badRequest("One or more products are no longer available.");

    let subtotal = 0;
    const orderItems = products.map((product) => {
      const quantity = details.quantities.get(product.id);
      if (product.stock - product.reservedStock < quantity) {
        const error = new Error(`${product.name} does not have enough stock.`);
        error.status = 409;
        throw error;
      }
      const unitPrice = product.discountPrice ?? product.price;
      const lineTotal = unitPrice * quantity;
      subtotal += lineTotal;
      return {
        productId: product.id,
        productName: product.name,
        productModel: product.model,
        imageUrl: product.imageUrl,
        quantity,
        unitPrice,
        lineTotal,
      };
    });
    const settings = await transaction.storeSettings.findUnique({ where: { id: "store" } });
    const shippingCost = shippingPrice(subtotal, settings);
    await transaction.user.update({ where: { id: userId }, data: { lastActivityAt: new Date() } });

    for (const item of orderItems) {
      const count = await transaction.$executeRaw`
        UPDATE "Product"
        SET "stock" = "stock" - ${item.quantity}
        WHERE "id" = ${item.productId}
          AND "isActive" = true
          AND "stock" - "reservedStock" >= ${item.quantity}
      `;
      if (count !== 1) {
        const error = new Error("Stock changed during checkout. Please review your cart and try again.");
        error.status = 409;
        throw error;
      }
    }

    const order = await transaction.order.create({
      data: {
        orderNumber: `HC-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
        userId,
        status: "CONFIRMED",
        paymentStatus: "PENDING",
        paymentMethod: "COD",
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

function checkoutDetails(body) {
  const details = orderDetails(body);
  if (!details.quantities.size) throw badRequest("Your cart is empty.");
  if (details.quantities.size > 50) throw badRequest("An order cannot contain more than 50 products.");
  return details;
}

async function reserveOrder(body, userId) {
  const details = checkoutDetails(body);
  await cleanupExpiredReservations();
  return prisma.$transaction(async (transaction) => {
    const products = await transaction.product.findMany({
      where: { id: { in: [...details.quantities.keys()] }, isActive: true },
    });
    if (products.length !== details.quantities.size) throw badRequest("One or more products are no longer available.");

    let subtotalPaise = 0;
    const items = products.map((product) => {
      const quantity = details.quantities.get(product.id);
      if (product.stock - product.reservedStock < quantity) {
        const error = new Error(`${product.name} does not have enough stock.`);
        error.status = 409;
        throw error;
      }
      const unitPrice = product.discountPrice ?? product.price;
      const unitPricePaise = Math.round(unitPrice * 100);
      const lineTotalPaise = unitPricePaise * quantity;
      subtotalPaise += lineTotalPaise;
      return {
        productId: product.id,
        productName: product.name,
        productModel: product.model,
        imageUrl: product.imageUrl,
        quantity,
        unitPrice: unitPricePaise / 100,
        lineTotal: lineTotalPaise / 100,
      };
    });

    for (const item of items) {
      const count = await transaction.$executeRaw`
        UPDATE "Product"
        SET "reservedStock" = "reservedStock" + ${item.quantity}
        WHERE "id" = ${item.productId}
          AND "isActive" = true
          AND "stock" - "reservedStock" >= ${item.quantity}
      `;
      if (count !== 1) {
        const error = new Error("Stock changed during checkout. Please review your cart and try again.");
        error.status = 409;
        throw error;
      }
    }

    const settings = await transaction.storeSettings.findUnique({ where: { id: "store" } });
    const subtotal = subtotalPaise / 100;
    const shippingCostPaise = Math.round(shippingPrice(subtotal, settings) * 100);
    const totalPaise = subtotalPaise + shippingCostPaise;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await transaction.user.update({ where: { id: userId }, data: { lastActivityAt: new Date() } });
    return transaction.order.create({
      data: {
        orderNumber: `HC-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
        userId,
        status: "PENDING",
        paymentStatus: "PENDING",
        paymentMethod: "RAZORPAY",
        stockReserved: true,
        reservationExpiresAt: expiresAt,
        subtotal,
        shippingCost: shippingCostPaise / 100,
        total: totalPaise / 100,
        customerName: details.customerName,
        email: details.email,
        phone: details.phone,
        address: details.address,
        city: details.city,
        state: details.state,
        postalCode: details.postalCode,
        items: { create: items },
      },
      include: orderInclude,
    });
  });
}

async function releaseReservation(transaction, order, paymentStatus, reason) {
  if (order.stockReserved) {
    for (const item of order.items) {
      const result = await transaction.product.updateMany({
        where: { id: item.productId, reservedStock: { gte: item.quantity } },
        data: { reservedStock: { decrement: item.quantity } },
      });
      if (result.count !== 1) throw new Error(`Could not release reserved stock for product ${item.productId}.`);
    }
  }
  return transaction.order.update({
    where: { id: order.id },
    data: {
      stockReserved: false,
      reservationExpiresAt: null,
      paymentStatus,
      paymentFailureReason: reason || null,
      ...(paymentStatus === "FAILED" ? { status: "CANCELLED" } : {}),
    },
    include: adminOrderInclude,
  });
}

async function releaseOrderReservation(orderId, paymentStatus, reason) {
  let released = false;
  const order = await prisma.$transaction(async (transaction) => {
    await transaction.$queryRaw`SELECT "id" FROM "Order" WHERE "id" = ${orderId} FOR UPDATE`;
    const current = await transaction.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!current || !current.stockReserved) return current;
    released = true;
    return releaseReservation(transaction, current, paymentStatus, reason);
  });
  if (released && order) notifyOrder(order, "status");
  return order;
}

async function cleanupExpiredReservations() {
  const expiredOrders = await prisma.order.findMany({
    where: {
      stockReserved: true,
      paymentStatus: "PENDING",
      reservationExpiresAt: { lte: new Date() },
    },
    include: { items: true },
  });
  for (const order of expiredOrders) {
    if (!order.razorpayOrderId) {
      await releaseOrderReservation(order.id, "FAILED", "Payment reservation expired.");
      continue;
    }
    const result = await getRazorpay().orders.fetchPayments(order.razorpayOrderId);
    const attempts = result.items || [];
    const captured = attempts.find((payment) => payment.status === "captured");
    if (captured) {
      await finalizePaidOrder(order.id, captured.id);
      continue;
    }
    if (attempts.some((payment) => !["failed", "refunded"].includes(payment.status))) {
      await prisma.order.update({
        where: { id: order.id },
        data: { reservationExpiresAt: new Date(Date.now() + 15 * 60 * 1000) },
      });
      continue;
    }
    await releaseOrderReservation(order.id, "FAILED", "Payment reservation expired.");
  }
}

exports.cleanupExpiredReservations = cleanupExpiredReservations;

async function finalizePaidOrder(orderId, razorpayPaymentId) {
  let newlyPaid = false;
  const confirmed = await prisma.$transaction(async (transaction) => {
    await transaction.$queryRaw`SELECT "id" FROM "Order" WHERE "id" = ${orderId} FOR UPDATE`;
    const current = await transaction.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!current) throw badRequest("Order not found.");
    if (current.paymentStatus === "PAID") {
      return transaction.order.findUnique({ where: { id: current.id }, include: adminOrderInclude });
    }
    if (!current.stockReserved) {
      throw badRequest("Stock reservation has expired. Contact support with your payment reference.");
    }
    newlyPaid = true;
    for (const item of current.items) {
      const count = await transaction.$executeRaw`
        UPDATE "Product"
        SET "stock" = "stock" - ${item.quantity},
            "reservedStock" = "reservedStock" - ${item.quantity}
        WHERE "id" = ${item.productId}
          AND "stock" >= ${item.quantity}
          AND "reservedStock" >= ${item.quantity}
      `;
      if (count !== 1) throw new Error(`Could not confirm stock for product ${item.productId}.`);
    }
    const result = await transaction.order.update({
      where: { id: current.id },
      data: {
        status: "CONFIRMED",
        paymentStatus: "PAID",
        razorpayPaymentId,
        stockReserved: false,
        reservationExpiresAt: null,
        paymentFailureReason: null,
      },
      include: adminOrderInclude,
    });
    await transaction.cartItem.deleteMany({ where: { userId: current.userId } });
    return result;
  });
  if (newlyPaid) notifyOrder(confirmed, "confirmation");
  return confirmed;
}

exports.createRazorpayOrder = asyncHandler(async (request, response) => {
  const order = await reserveOrder(request.body, request.user.id);
  try {
    const razorpayOrder = await getRazorpay().orders.create({
      amount: Math.round(order.total * 100),
      currency: "INR",
      receipt: order.orderNumber,
      expire_by: Math.floor(order.reservationExpiresAt.getTime() / 1000),
      notes: { orderId: order.id, userId: request.user.id },
    });
    const saved = await prisma.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: razorpayOrder.id },
      include: adminOrderInclude,
    });
    response.status(201).json({
      order: saved,
      payment: {
        keyId: getPublicKeyId(),
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
    });
  } catch (error) {
    let cancelledOrder;
    await prisma.$transaction(async (transaction) => {
      const current = await transaction.order.findUnique({
        where: { id: order.id },
        include: { items: true },
      });
      if (current?.stockReserved) {
        cancelledOrder = await releaseReservation(transaction, current, "FAILED", "Payment initialization failed.");
      }
    });
    if (cancelledOrder) notifyOrder(cancelledOrder, "status");
    throw error;
  }
});

exports.verifyRazorpayPayment = asyncHandler(async (request, response) => {
  const orderId = requiredString(request.body.orderId, "Order ID", 100);
  const razorpayOrderId = requiredString(request.body.razorpay_order_id, "Razorpay order ID", 100);
  const razorpayPaymentId = requiredString(request.body.razorpay_payment_id, "Razorpay payment ID", 100);
  const signature = requiredString(request.body.razorpay_signature, "Razorpay signature", 256);
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: request.user.id, razorpayOrderId },
    include: { items: true },
  });
  if (!order) {
    const error = new Error("Payment order not found.");
    error.status = 404;
    throw error;
  }
  if (order.paymentStatus === "PAID") {
    return response.json(await prisma.order.findUnique({ where: { id: order.id }, include: orderInclude }));
  }
  if (!order.stockReserved) {
    throw badRequest("This checkout has expired. Please create a new order.");
  }

  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest();
  let actual;
  try {
    actual = Buffer.from(signature, "hex");
  } catch {
    actual = Buffer.alloc(0);
  }
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) {
    throw badRequest("Payment signature verification failed.");
  }

  const payment = await getRazorpay().payments.fetch(razorpayPaymentId);
  if (payment.order_id !== razorpayOrderId || Number(payment.amount) !== Math.round(order.total * 100) || payment.currency !== "INR") {
    throw badRequest("Payment details do not match this order.");
  }
  if (payment.status === "failed") {
    const result = await getRazorpay().orders.fetchPayments(razorpayOrderId);
    const attempts = result.items || [];
    const captured = attempts.find((attempt) => attempt.status === "captured");
    if (captured) return response.json(await finalizePaidOrder(order.id, captured.id));
    if (hasPendingPayment(attempts)) {
      return response.status(202).json({ paymentStatus: "PENDING", orderId: order.id });
    }
    await releaseOrderReservation(order.id, "FAILED", payment.error_description || "Payment failed.");
    return response.status(202).json({ paymentStatus: "FAILED", orderId: order.id });
  }
  if (payment.status !== "captured") {
    return response.status(202).json({
      message: "Payment is not captured yet.",
      paymentStatus: payment.status === "failed" ? "FAILED" : "PENDING",
      orderId: order.id,
    });
  }

  const confirmed = await finalizePaidOrder(order.id, razorpayPaymentId);
  response.json(confirmed);
});

exports.razorpayWebhook = asyncHandler(async (request, response) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = request.get("x-razorpay-signature") || "";
  if (!secret) {
    const error = new Error("Razorpay webhook secret is not configured.");
    error.status = 503;
    throw error;
  }
  if (!Buffer.isBuffer(request.body)) throw badRequest("Invalid payment webhook body.");
  const expected = crypto.createHmac("sha256", secret).update(request.body).digest();
  let actual;
  try {
    actual = Buffer.from(signature, "hex");
  } catch {
    actual = Buffer.alloc(0);
  }
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) {
    const error = new Error("Invalid payment webhook signature.");
    error.status = 401;
    throw error;
  }
  let event;
  try {
    event = JSON.parse(request.body.toString("utf8"));
  } catch {
    throw badRequest("Invalid payment webhook JSON.");
  }

  const refund = event.payload?.refund?.entity;
  if (refund?.id && ["refund.created", "refund.processed", "refund.failed"].includes(event.event)) {
    let record = await prisma.orderRefund.findUnique({ where: { razorpayRefundId: refund.id } });
    if (!record && refund.notes?.refundId) {
      record = await prisma.orderRefund.findUnique({ where: { id: refund.notes.refundId } });
    }
    if (record) await applyRefundStatus(record.id, refund.id, refund.status, refund.amount, refund.payment_id);
    return response.json({ received: true });
  }

  const payment = event.payload?.payment?.entity;
  if (!payment?.order_id) return response.json({ received: true });
  const order = await prisma.order.findUnique({ where: { razorpayOrderId: payment.order_id } });
  if (!order) return response.json({ received: true });
  if (event.event === "payment.captured" || event.event === "order.paid") {
    if (Number(payment.amount) !== Math.round(order.total * 100) || payment.currency !== "INR") {
      throw badRequest("Webhook payment does not match the saved order.");
    }
    await finalizePaidOrder(order.id, payment.id);
  } else if (event.event === "payment.failed" && order.stockReserved) {
    const result = await getRazorpay().orders.fetchPayments(payment.order_id);
    const attempts = result.items || [];
    if (attempts.some((attempt) => attempt.status === "captured")) {
      const captured = attempts.find((attempt) => attempt.status === "captured");
      await finalizePaidOrder(order.id, captured.id);
    } else if (hasPendingPayment(attempts)) {
      await prisma.order.update({
        where: { id: order.id },
        data: { reservationExpiresAt: new Date(Date.now() + 15 * 60 * 1000) },
      });
    } else {
      await releaseOrderReservation(order.id, "FAILED", payment.error_description || "Payment failed.");
    }
  }
  response.json({ received: true });
});

exports.failRazorpayPayment = asyncHandler(async (request, response) => {
  const orderId = requiredString(request.body.orderId, "Order ID", 100);
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: request.user.id, paymentMethod: "RAZORPAY" },
    include: { items: true },
  });
  if (!order) return response.status(404).json({ message: "Payment order not found." });
  if (order.paymentStatus === "PAID") throw badRequest("A completed payment cannot be marked as failed.");
  if (!order.stockReserved) return response.json({ paymentStatus: order.paymentStatus, orderId: order.id });
  const paymentAttempts = await getRazorpay().orders.fetchPayments(order.razorpayOrderId);
  const attempts = paymentAttempts.items || [];
  if (attempts.some((payment) => payment.status === "captured")) {
    throw badRequest("A payment has already been received. Refresh your order status.");
  }
  if (hasPendingPayment(attempts)) {
    return response.status(202).json({ paymentStatus: "PENDING", orderId: order.id });
  }
  const updated = await releaseOrderReservation(order.id, "FAILED", optionalFailureReason(request.body.reason));
  response.json({ paymentStatus: updated.paymentStatus, orderId: updated.id });
});

function optionalFailureReason(value) {
  if (typeof value !== "string") return null;
  return value.trim().slice(0, 500) || null;
}

function hasPendingPayment(payments) {
  return payments.some((payment) => !["failed", "refunded"].includes(payment.status));
}

exports.create = asyncHandler(async (request, response) => {
  const order = await createOrder(request.body, request.user.id);
  notifyOrder(order, "confirmation");
  response.status(201).json(order);
});

exports.createForCustomer = asyncHandler(async (request, response) => {
  const userId = requiredString(request.body.userId, "Customer ID", 100);
  const customer = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true, isActive: true } });
  if (!customer || customer.role !== "CUSTOMER") throw badRequest("The selected customer account does not exist.");
  if (!customer.isActive) {
    const error = new Error("Orders cannot be placed for a deactivated customer account.");
    error.status = 409;
    throw error;
  }
  const order = await createOrder(request.body, customer.id);
  notifyOrder(order, "confirmation");
  response.status(201).json(order);
});

exports.listMine = asyncHandler(async (request, response) => {
  const orders = await prisma.order.findMany({
    where: { userId: request.user.id },
    include: adminOrderInclude,
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

function orderDateFilter(value, label, endOfDay = false) {
  if (value === undefined || value === "") return null;
  if (typeof value !== "string") throw badRequest(`${label} must be a date.`);
  const parsed = optionalDate(value, label);
  if (!parsed) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    if (endOfDay) parsed.setUTCHours(23, 59, 59, 999);
    else parsed.setUTCHours(0, 0, 0, 0);
  }
  return parsed;
}

function adminOrderFilter(query) {
  const clauses = [];
  if (query.search !== undefined) {
    if (typeof query.search !== "string") throw badRequest("Search must be a string.");
    const search = query.search.trim();
    if (search.length > 120) throw badRequest("Search must be 120 characters or fewer.");
    if (search) {
      clauses.push({
        OR: [
          { id: { contains: search, mode: "insensitive" } },
          { orderNumber: { contains: search, mode: "insensitive" } },
          { customerName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
          { user: { is: { name: { contains: search, mode: "insensitive" } } } },
          { items: { some: { productName: { contains: search, mode: "insensitive" } } } },
        ],
      });
    }
  }
  const filterValues = [
    ["status", ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]],
    ["paymentStatus", ["PENDING", "PAID", "FAILED", "REFUND_PENDING", "REFUNDED"]],
    ["paymentMethod", ["COD", "RAZORPAY"]],
  ];
  for (const [field, values] of filterValues) {
    if (query[field] === undefined || query[field] === "" || query[field] === "all") continue;
    if (typeof query[field] !== "string" || !values.includes(query[field].toUpperCase())) {
      throw badRequest(`Invalid ${field} filter.`);
    }
    clauses.push({ [field]: query[field].toUpperCase() });
  }
  const dateFrom = orderDateFilter(query.dateFrom, "Start date");
  const dateTo = orderDateFilter(query.dateTo, "End date", true);
  if (dateFrom && dateTo && dateFrom > dateTo) throw badRequest("Start date cannot be after end date.");
  if (dateFrom || dateTo) {
    clauses.push({ createdAt: { ...(dateFrom ? { gte: dateFrom } : {}), ...(dateTo ? { lte: dateTo } : {}) } });
  }
  return clauses.length ? { AND: clauses } : {};
}

exports.listAll = asyncHandler(async (request, response) => {
  const page = request.query.page === undefined ? 1 : integer(request.query.page, "Page", { min: 1, max: 1000000 });
  const limit = request.query.limit === undefined ? 20 : integer(request.query.limit, "Page size", { min: 1, max: 100 });
  const sortFields = {
    date: "createdAt",
    total: "total",
    customer: "customerName",
    status: "status",
    payment: "paymentStatus",
  };
  const sortBy = request.query.sortBy === undefined ? "date" : request.query.sortBy;
  const sortOrder = request.query.sortOrder === undefined ? "desc" : request.query.sortOrder;
  if (typeof sortBy !== "string" || !sortFields[sortBy]) throw badRequest("Invalid order sort field.");
  if (!["asc", "desc"].includes(sortOrder)) throw badRequest("Sort order must be asc or desc.");

  const where = adminOrderFilter(request.query);
  const paidWhere = { AND: [where, { paymentStatus: { in: ["PAID", "REFUND_PENDING"] } }] };
  const [items, total, statusGroups, paymentGroups, revenue] = await Promise.all([
    prisma.order.findMany({
      where,
      include: adminOrderInclude,
      orderBy: [{ [sortFields[sortBy]]: sortOrder }, { id: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
    prisma.order.groupBy({ by: ["status"], where, _count: { _all: true } }),
    prisma.order.groupBy({ by: ["paymentStatus"], where, _count: { _all: true } }),
    prisma.order.aggregate({ where: paidWhere, _sum: { total: true } }),
  ]);
  const statusCounts = Object.fromEntries(statusGroups.map((group) => [group.status, group._count._all]));
  const paymentCounts = Object.fromEntries(paymentGroups.map((group) => [group.paymentStatus, group._count._all]));
  response.json({
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    summary: {
      totalOrders: total,
      pendingOrders: statusCounts.PENDING || 0,
      confirmedOrders: statusCounts.CONFIRMED || 0,
      processingOrders: statusCounts.PROCESSING || 0,
      deliveredOrders: statusCounts.DELIVERED || 0,
      cancelledOrders: statusCounts.CANCELLED || 0,
      pendingPayments: paymentCounts.PENDING || 0,
      pendingRefunds: paymentCounts.REFUND_PENDING || 0,
      paidRevenue: revenue._sum.total || 0,
    },
  });
});

exports.getAdmin = asyncHandler(async (request, response) => {
  const order = await prisma.order.findUnique({
    where: { id: request.params.id },
    include: adminOrderInclude,
  });
  if (!order) return response.status(404).json({ message: "Order not found." });
  response.json(order);
});

async function applyRefundStatus(refundId, razorpayRefundId, status, amountPaise, paymentId) {
  const normalizedStatus = String(status || "").toLowerCase();
  if (!["pending", "processed", "failed"].includes(normalizedStatus)) {
    throw badRequest("Razorpay returned an unsupported refund status.");
  }
  let shouldNotify = false;
  const result = await prisma.$transaction(async (transaction) => {
    let refund = await transaction.orderRefund.findUnique({
      where: { id: refundId },
    });
    if (!refund) return null;
    await transaction.$queryRaw`SELECT "id" FROM "Order" WHERE "id" = ${refund.orderId} FOR UPDATE`;
    refund = await transaction.orderRefund.findUnique({ where: { id: refundId } });
    const currentOrder = await transaction.order.findUnique({
      where: { id: refund.orderId },
      include: { items: true },
    });
    if (!currentOrder) throw new Error(`Order ${refund.orderId} for refund ${refund.id} no longer exists.`);
    if (paymentId && paymentId !== currentOrder.razorpayPaymentId) {
      throw badRequest("Razorpay refund does not match the saved payment.");
    }
    if (amountPaise !== undefined && Number(amountPaise) !== Math.round(refund.amount * 100)) {
      throw badRequest("Razorpay refund amount does not match the saved refund.");
    }
    if (["processed", "failed"].includes(refund.status) && refund.status !== normalizedStatus) {
      return {
        order: await transaction.order.findUnique({
          where: { id: currentOrder.id },
          include: adminOrderInclude,
        }),
        refundStatus: refund.status,
      };
    }

    await transaction.orderRefund.update({
      where: { id: refund.id },
      data: {
        ...(razorpayRefundId ? { razorpayRefundId } : {}),
        status: normalizedStatus,
      },
    });
    if (normalizedStatus === "processed") {
      if (currentOrder.status !== "CANCELLED") {
        for (const item of currentOrder.items) {
          if (item.productId) {
            await transaction.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
        shouldNotify = true;
      }
      const order = await transaction.order.update({
        where: { id: currentOrder.id },
        data: {
          status: "CANCELLED",
          paymentStatus: "REFUNDED",
          razorpayRefundId,
        },
        include: adminOrderInclude,
      });
      return { order, refundStatus: normalizedStatus };
    }
    const order = await transaction.order.update({
      where: { id: currentOrder.id },
      data: {
        paymentStatus: normalizedStatus === "failed" ? "PAID" : "REFUND_PENDING",
        ...(razorpayRefundId ? { razorpayRefundId } : {}),
      },
      include: adminOrderInclude,
    });
    return { order, refundStatus: normalizedStatus };
  });
  if (shouldNotify) notifyOrder(result.order, "status");
  return result;
}

exports.refundOrder = asyncHandler(async (request, response) => {
  const reason = optionalFailureReason(request.body.reason);
  const razorpay = getRazorpay();
  const prepared = await prisma.$transaction(async (transaction) => {
    await transaction.$queryRaw`SELECT "id" FROM "Order" WHERE "id" = ${request.params.id} FOR UPDATE`;
    const order = await transaction.order.findUnique({
      where: { id: request.params.id },
      include: { refunds: true },
    });
    if (!order) return null;
    if (order.paymentMethod !== "RAZORPAY" || order.paymentStatus !== "PAID" || !order.razorpayPaymentId) {
      throw badRequest("Only captured Razorpay orders can be refunded.");
    }
    if (!["CONFIRMED", "PROCESSING"].includes(order.status)) {
      throw badRequest("Only confirmed or processing orders can be refunded and cancelled.");
    }
    if (order.refunds.some((refund) => ["pending", "processed"].includes(refund.status))) {
      throw badRequest("A refund is already pending or has already completed for this order.");
    }
    const refund = await transaction.orderRefund.create({
      data: {
        orderId: order.id,
        amount: order.total,
        reason,
        status: "pending",
      },
    });
    await transaction.order.update({
      where: { id: order.id },
      data: { paymentStatus: "REFUND_PENDING" },
    });
    return { order, refund };
  });
  if (!prepared) return response.status(404).json({ message: "Order not found." });

  let gatewayRefund;
  try {
    gatewayRefund = await razorpay.payments.refund(prepared.order.razorpayPaymentId, {
      amount: Math.round(prepared.refund.amount * 100),
      receipt: prepared.refund.id,
      notes: { orderId: prepared.order.id, refundId: prepared.refund.id },
    });
  } catch (error) {
    console.error(`Razorpay refund outcome is unconfirmed for ${prepared.order.orderNumber}:`, error.message);
    const rejected = Number.isInteger(error.statusCode) && error.statusCode >= 400 && error.statusCode < 500;
    if (rejected) {
      await applyRefundStatus(prepared.refund.id, null, "failed");
    }
    const issue = new Error(rejected
      ? "Razorpay rejected the refund. The order remains paid and may be retried."
      : "Refund outcome could not be confirmed. The order remains refund pending; verify it in Razorpay before retrying.");
    issue.status = 502;
    throw issue;
  }
  const result = await applyRefundStatus(
    prepared.refund.id,
    gatewayRefund.id,
    gatewayRefund.status,
    gatewayRefund.amount,
    gatewayRefund.payment_id
  );
  response.status(201).json(result);
});

exports.updateStatus = asyncHandler(async (request, response) => {
  const status = requiredString(request.body.status, "Status", 30).toUpperCase();
  const requestedPaymentStatus = request.body.paymentStatus === undefined
    ? null
    : requiredString(request.body.paymentStatus, "Payment status", 20).toUpperCase();
  if (!["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].includes(status)) {
    throw badRequest("Status must be PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, or CANCELLED.");
  }
  if (requestedPaymentStatus !== null && !["PENDING", "PAID", "FAILED"].includes(requestedPaymentStatus)) {
    throw badRequest("Payment status must be PENDING, PAID, or FAILED.");
  }

  if (status === "CANCELLED") {
    const candidate = await prisma.order.findUnique({
      where: { id: request.params.id },
      select: {
        paymentMethod: true,
        paymentStatus: true,
        stockReserved: true,
        razorpayOrderId: true,
        reservationExpiresAt: true,
      },
    });
    if (!candidate) return response.status(404).json({ message: "The requested order was not found." });
    if (candidate.paymentStatus === "REFUND_PENDING") throw badRequest("Wait for the refund to finish before changing this order.");
    if (candidate.paymentMethod === "RAZORPAY" && candidate.stockReserved) {
      if (!candidate.razorpayOrderId) {
        const error = new Error("Payment initialization is still in progress. Try cancelling this order again shortly.");
        error.status = 409;
        throw error;
      }
      const result = await getRazorpay().orders.fetchPayments(candidate.razorpayOrderId);
      const attempts = result.items || [];
      const captured = attempts.find((payment) => payment.status === "captured");
      if (captured) {
        await finalizePaidOrder(request.params.id, captured.id);
        throw badRequest("Payment has been captured. Use Refund & Cancel to return the payment.");
      }
      if (hasPendingPayment(attempts)) {
        const error = new Error("A payment attempt is still processing. Wait for confirmation before cancelling.");
        error.status = 409;
        throw error;
      }
      if (candidate.reservationExpiresAt && candidate.reservationExpiresAt > new Date()) {
        const error = new Error("This Razorpay checkout is still open. Its reserved stock will be released automatically after the payment window expires.");
        error.status = 409;
        throw error;
      }
    }
  }

  let shouldNotify = false;
  const order = await prisma.$transaction(async (transaction) => {
    await transaction.$queryRaw`SELECT "id" FROM "Order" WHERE "id" = ${request.params.id} FOR UPDATE`;
    const current = await transaction.order.findUnique({
      where: { id: request.params.id },
      include: { items: true },
    });
    if (!current) {
      const error = new Error("The requested order was not found.");
      error.status = 404;
      throw error;
    }
    if (current.paymentStatus === "REFUND_PENDING" && status !== current.status) {
      throw badRequest("Order status cannot change while the refund is pending.");
    }
    if (status === "CANCELLED" && current.paymentStatus === "PAID") {
      if (current.paymentMethod === "RAZORPAY") throw badRequest("Use Refund & Cancel to cancel a paid Razorpay order.");
      throw badRequest("A paid COD order cannot be cancelled.");
    }
    if (current.paymentMethod === "RAZORPAY" && current.paymentStatus !== "PAID" && status !== "CANCELLED") {
      throw badRequest("An online order cannot be processed before payment is confirmed.");
    }
    if (requestedPaymentStatus !== null && requestedPaymentStatus !== current.paymentStatus) {
      if (current.paymentMethod !== "COD" || requestedPaymentStatus !== "PAID" || status !== "DELIVERED") {
        throw badRequest("A cash-on-delivery order can be marked paid only when it is marked delivered.");
      }
    }
    if (status !== current.status && !orderTransitions[current.status]?.includes(status)) {
      throw badRequest(`Order cannot move from ${current.status} to ${status}.`);
    }
    if (status === "CANCELLED" && current.status !== "CANCELLED") {
      if (current.stockReserved) {
        shouldNotify = true;
        return releaseReservation(transaction, current, "FAILED", "Order cancelled by administrator.");
      }
      if (current.paymentMethod === "COD") {
        for (const item of current.items) {
          if (item.productId) {
            await transaction.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
      }
    }
    shouldNotify = status !== current.status ||
      (requestedPaymentStatus !== null && requestedPaymentStatus !== current.paymentStatus);
    return transaction.order.update({
      where: { id: current.id },
      data: {
        status,
        ...(requestedPaymentStatus !== null ? { paymentStatus: requestedPaymentStatus } : {}),
      },
      include: adminOrderInclude,
    });
  });
  if (shouldNotify) notifyOrder(order, "status");
  response.json(order);
});

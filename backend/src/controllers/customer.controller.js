const prisma = require("../config/database");
const asyncHandler = require("../middlewares/asyncHandler");
const { badRequest, boolean, integer, optionalDate, optionalString } = require("../utils/validation");

function customerFilter(query) {
  const where = { role: "CUSTOMER" };
  const search = optionalString(query.search, "Search", 120);
  const status = query.status === undefined ? "all" : String(query.status).toLowerCase();
  if (!["all", "active", "inactive"].includes(status)) {
    throw badRequest("Status must be all, active, or inactive.");
  }
  if (status !== "all") where.isActive = status === "active";
  if (search) {
    where.OR = ["name", "email", "phone"].map((field) => ({
      [field]: { contains: search, mode: "insensitive" },
    }));
  }

  const registeredFrom = optionalDate(query.registeredFrom, "Registration start date");
  const registeredTo = optionalDate(query.registeredTo, "Registration end date");
  if (registeredFrom && registeredTo && registeredFrom > registeredTo) {
    throw badRequest("Registration start date must be before the end date.");
  }
  if (registeredFrom || registeredTo) {
    where.createdAt = {
      ...(registeredFrom ? { gte: registeredFrom } : {}),
      ...(registeredTo ? { lte: registeredTo } : {}),
    };
  }
  return where;
}

function customerOrderBy(query) {
  const sortBy = query.sortBy === undefined ? "createdAt" : String(query.sortBy);
  const sortOrder = query.sortOrder === undefined ? "desc" : String(query.sortOrder);
  const fields = {
    name: "name",
    email: "email",
    registered: "createdAt",
    activity: "lastActivityAt",
    status: "isActive",
  };
  if (!fields[sortBy] || !["asc", "desc"].includes(sortOrder)) {
    throw badRequest("Choose a supported customer sort field and direction.");
  }
  return [{ [fields[sortBy]]: sortOrder }, { id: "asc" }];
}

async function orderMetrics(userIds) {
  if (userIds.length === 0) return new Map();
  const [counts, totals] = await Promise.all([
    prisma.order.groupBy({
      by: ["userId"],
      where: { userId: { in: userIds } },
      _count: { _all: true },
    }),
    prisma.order.groupBy({
      by: ["userId"],
      where: { userId: { in: userIds }, status: { not: "CANCELLED" } },
      _sum: { total: true },
    }),
  ]);
  const metrics = new Map(counts.map((group) => [group.userId, {
    totalOrders: group._count._all,
    totalSpent: 0,
  }]));
  for (const group of totals) {
    metrics.set(group.userId, {
      ...metrics.get(group.userId),
      totalSpent: group._sum.total || 0,
    });
  }
  return metrics;
}

exports.list = asyncHandler(async (request, response) => {
  const page = request.query.page === undefined ? 1 : integer(request.query.page, "Page", { min: 1, max: 1000000 });
  const limit = request.query.limit === undefined ? 20 : integer(request.query.limit, "Page size", { min: 1, max: 100 });
  const where = customerFilter(request.query);
  const orderBy = customerOrderBy(request.query);
  const [total, active, inactive, customers] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.count({ where: { ...where, isActive: true } }),
    prisma.user.count({ where: { ...where, isActive: false } }),
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        lastActivityAt: true,
        createdAt: true,
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);
  const metrics = await orderMetrics(customers.map((customer) => customer.id));
  response.json({
    items: customers.map((customer) => ({
      ...customer,
      ...(metrics.get(customer.id) || { totalOrders: 0, totalSpent: 0 }),
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    summary: { totalCustomers: total, activeCustomers: active, inactiveCustomers: inactive },
  });
});

exports.getById = asyncHandler(async (request, response) => {
  const customer = await prisma.user.findFirst({
    where: { id: request.params.id, role: "CUSTOMER" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      isActive: true,
      lastActivityAt: true,
      createdAt: true,
    },
  });
  if (!customer) {
    const error = new Error("Customer not found.");
    error.status = 404;
    throw error;
  }

  const [addresses, orders, enquiries, serviceRequests] = await Promise.all([
    prisma.customerAddress.findMany({
      where: { userId: customer.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    }),
    prisma.order.findMany({
      where: { userId: customer.id },
      include: {
        items: { orderBy: { id: "asc" } },
        refunds: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.enquiry.findMany({
      where: {
        OR: [
          { userId: customer.id },
          { email: { equals: customer.email, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.serviceRequest.findMany({
      where: { userId: customer.id },
      select: {
        id: true,
        serviceTitle: true,
        serviceType: true,
        laptopModel: true,
        issueDescription: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        service: { select: { id: true, title: true } },
        statusHistory: {
          where: { status: { not: null } },
          select: { status: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  const customerServiceRequests = serviceRequests.map((serviceRequest) => {
    const statusHistory = serviceRequest.statusHistory.map((entry) => ({
      status: entry.status === "NEW" ? "PENDING" : entry.status,
      createdAt: entry.createdAt,
    }));
    return {
      ...serviceRequest,
      status: serviceRequest.status === "NEW" ? "PENDING" : serviceRequest.status,
      statusHistory: statusHistory.length
        ? statusHistory
        : [{ status: serviceRequest.status === "NEW" ? "PENDING" : serviceRequest.status, createdAt: serviceRequest.createdAt }],
    };
  });
  const completedOrders = orders.filter((order) => order.status !== "CANCELLED");
  response.json({
    customer,
    addresses,
    orders,
    enquiries,
    serviceRequests: customerServiceRequests,
    summary: {
      totalOrders: orders.length,
      completedOrders: completedOrders.length,
      totalSpent: completedOrders.reduce((total, order) => total + order.total, 0),
      totalEnquiries: enquiries.length,
      totalServiceRequests: customerServiceRequests.length,
    },
  });
});

exports.updateStatus = asyncHandler(async (request, response) => {
  const isActive = boolean(request.body.isActive, "Account status");
  const result = await prisma.user.updateMany({
    where: { id: request.params.id, role: "CUSTOMER" },
    data: { isActive },
  });
  if (result.count === 0) {
    const error = new Error("Customer not found.");
    error.status = 404;
    throw error;
  }
  response.json(await prisma.user.findUnique({
    where: { id: request.params.id },
    select: { id: true, name: true, email: true, phone: true, isActive: true, lastActivityAt: true, createdAt: true },
  }));
});

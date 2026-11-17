const crypto = require("node:crypto");
const prisma = require("../config/database");
const asyncHandler = require("../middlewares/asyncHandler");
const {
  badRequest,
  email,
  integer,
  optionalDate,
  optionalString,
  requiredString,
} = require("../utils/validation");
const { sendServiceRequestNotification } = require("../services/whatsapp.service");

const serviceTypes = {
  LAPTOP_REPAIR: "Laptop Repair",
  HARDWARE_ISSUES: "Hardware Issues",
  SOFTWARE_ISSUES: "Software Issues",
  LAPTOP_MAINTENANCE: "Laptop Maintenance",
  OTHER_SERVICES: "Other Services",
};
const statuses = ["PENDING", "CONTACTED", "APPROVED", "IN_PROGRESS", "COMPLETED", "REJECTED"];

function normalizeStatus(status) {
  return status === "NEW" ? "PENDING" : status;
}

function statusHistoryRows(entries, status, createdAt) {
  const rows = entries
    .filter((entry) => entry.status)
    .map((entry) => ({ status: normalizeStatus(entry.status), createdAt: entry.createdAt }));
  return rows.length ? rows : [{ status: normalizeStatus(status), createdAt }];
}

function trackingHash(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function notifyServiceRequest(serviceRequest, type) {
  sendServiceRequestNotification(serviceRequest, type).catch((error) => {
    console.error(`Service enquiry ${type} WhatsApp notification failed for ${serviceRequest.id}:`, error.message);
  });
}

function requestWhere(query, includeStatus = true) {
  const where = {};
  const search = optionalString(query.search, "Search", 120);
  if (search) {
    where.OR = [
      { id: { contains: search, mode: "insensitive" } },
      { customerName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
      { laptopModel: { contains: search, mode: "insensitive" } },
      { issueDescription: { contains: search, mode: "insensitive" } },
      { serviceType: { contains: search, mode: "insensitive" } },
    ];
  }
  const rawServiceType = query.serviceType === undefined ? "all" : String(query.serviceType).toUpperCase();
  const serviceType = rawServiceType === "ALL" ? "all" : rawServiceType;
  if (serviceType !== "all") {
    if (!Object.prototype.hasOwnProperty.call(serviceTypes, serviceType)) throw badRequest("Choose a supported service type.");
    where.serviceType = serviceType;
  }
  const rawStatus = query.status === undefined ? "all" : String(query.status).toUpperCase();
  const status = rawStatus === "ALL" ? "all" : rawStatus;
  if (includeStatus && status !== "all") {
    if (!statuses.includes(status)) throw badRequest("Choose a supported service enquiry status.");
    where.status = status === "PENDING" ? { in: ["PENDING", "NEW"] } : status;
  } else if (status !== "all" && !statuses.includes(status)) {
    throw badRequest("Choose a supported service enquiry status.");
  }
  const dateFrom = optionalDate(query.dateFrom, "Start date");
  const dateTo = optionalDate(query.dateTo, "End date");
  if (dateFrom && dateTo && dateFrom > dateTo) throw badRequest("Start date must be before the end date.");
  if (dateFrom || dateTo) {
    where.createdAt = {
      ...(dateFrom ? { gte: dateFrom } : {}),
      ...(dateTo ? { lte: dateTo } : {}),
    };
  }
  return where;
}

function requestOrderBy(query) {
  const sortBy = query.sortBy === undefined ? "createdAt" : String(query.sortBy);
  const sortOrder = query.sortOrder === undefined ? "desc" : String(query.sortOrder);
  const fields = {
    date: "createdAt",
    status: "status",
    customer: "customerName",
    serviceType: "serviceType",
    updated: "updatedAt",
  };
  if (!fields[sortBy] || !["asc", "desc"].includes(sortOrder)) {
    throw badRequest("Choose a supported sort field and direction.");
  }
  return [{ [fields[sortBy]]: sortOrder }, { id: "asc" }];
}

function customerRequestRecord(record) {
  const { user, statusHistory, trackingTokenHash, ...request } = record;
  return {
    ...request,
    customerName: request.customerName || user?.name || "Guest customer",
    email: request.email || user?.email || "",
    phone: request.phone || user?.phone || "",
    status: normalizeStatus(request.status),
    statusHistory: statusHistoryRows(statusHistory, request.status, request.createdAt),
  };
}

async function adminRequestDetails(id) {
  const record = await prisma.serviceRequest.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      service: { select: { id: true, title: true } },
      statusHistory: {
        include: { actor: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!record) {
    const error = new Error("Service enquiry not found.");
    error.status = 404;
    throw error;
  }
  const result = {
    ...customerRequestRecord(record),
    user: record.user,
    service: record.service,
    statusHistory: record.statusHistory.map((entry) => ({
      ...entry,
      status: entry.status ? normalizeStatus(entry.status) : null,
    })),
  };
  if (!result.statusHistory.some((entry) => entry.status)) {
    result.statusHistory.push({
      id: `${record.id}-initial`,
      status: normalizeStatus(record.status),
      note: null,
      isInternal: false,
      actorId: record.userId,
      actor: record.user,
      createdAt: record.createdAt,
    });
  }
  return result;
}

exports.create = asyncHandler(async (request, response) => {
  const serviceType = requiredString(request.body.serviceType, "Service type", 40).toUpperCase();
  if (!Object.prototype.hasOwnProperty.call(serviceTypes, serviceType)) throw badRequest("Choose a supported service type.");
  const serviceId = request.body.serviceId === undefined || request.body.serviceId === ""
    ? null
    : requiredString(request.body.serviceId, "Service", 100);
  let service = null;
  if (serviceId) {
    service = await prisma.service.findFirst({
      where: { id: serviceId, isActive: true },
      select: { id: true, title: true },
    });
    if (!service) throw badRequest("The selected service is no longer available.");
  }
  const customerName = requiredString(request.body.customerName, "Name", 120);
  const customerEmail = email(request.body.email);
  const phone = requiredString(request.body.phone, "Phone", 40);
  const laptopModel = optionalString(request.body.laptopModel, "Laptop model", 120);
  const issueDescription = requiredString(request.body.issueDescription, "Issue description", 4000);
  const trackingCode = crypto.randomBytes(32).toString("base64url");
  const userId = request.user?.role === "CUSTOMER" ? request.user.id : null;
  const created = await prisma.$transaction(async (transaction) => {
    if (userId) {
      await transaction.user.update({
        where: { id: userId },
        data: { lastActivityAt: new Date() },
      });
    }
    return transaction.serviceRequest.create({
      data: {
        userId,
        serviceId: service?.id || null,
        serviceTitle: service?.title || serviceTypes[serviceType],
        customerName,
        email: customerEmail,
        phone,
        serviceType,
        laptopModel,
        issueDescription,
        status: "PENDING",
        trackingTokenHash: trackingHash(trackingCode),
        statusHistory: {
          create: {
            status: "PENDING",
            isInternal: false,
            actorId: userId,
          },
        },
      },
      include: {
        service: { select: { id: true, title: true } },
        statusHistory: { orderBy: { createdAt: "desc" } },
      },
    });
  });
  notifyServiceRequest(created, "confirmation");
  const result = customerRequestRecord(created);
  response.status(201).json({ request: result, trackingCode });
});

exports.listMine = asyncHandler(async (request, response) => {
  const records = await prisma.serviceRequest.findMany({
    where: { userId: request.user.id },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      service: { select: { id: true, title: true } },
      statusHistory: {
        where: { status: { not: null } },
        select: { status: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  response.json(records.map(customerRequestRecord));
});

exports.trackGuestRequest = asyncHandler(async (request, response) => {
  const trackingCode = requiredString(request.params.trackingCode, "Tracking code", 100);
  const record = await prisma.serviceRequest.findUnique({
    where: { trackingTokenHash: trackingHash(trackingCode) },
    select: {
      id: true,
      serviceTitle: true,
      serviceType: true,
      laptopModel: true,
      issueDescription: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      statusHistory: {
        where: { status: { not: null } },
        select: { status: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!record) {
    const error = new Error("No service enquiry matches that tracking code.");
    error.status = 404;
    throw error;
  }
  response.json({
    ...record,
    status: normalizeStatus(record.status),
    statusHistory: record.statusHistory.map((entry) => ({
      status: normalizeStatus(entry.status),
      createdAt: entry.createdAt,
    })),
  });
});

exports.listAdmin = asyncHandler(async (request, response) => {
  const page = request.query.page === undefined ? 1 : integer(request.query.page, "Page", { min: 1, max: 1000000 });
  const limit = request.query.limit === undefined ? 20 : integer(request.query.limit, "Page size", { min: 1, max: 100 });
  const where = requestWhere(request.query);
  const summaryWhere = requestWhere(request.query, false);
  const orderBy = requestOrderBy(request.query);
  const [total, items, counts] = await Promise.all([
    prisma.serviceRequest.count({ where }),
    prisma.serviceRequest.findMany({
      where,
      select: {
        id: true,
        customerName: true,
        email: true,
        phone: true,
        serviceTitle: true,
        serviceType: true,
        laptopModel: true,
        issueDescription: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    Promise.all(statuses.map((status) => prisma.serviceRequest.count({
      where: { ...summaryWhere, status: status === "PENDING" ? { in: ["PENDING", "NEW"] } : status },
    }))),
  ]);
  const summary = Object.fromEntries(statuses.map((status, index) => [status, counts[index]]));
  response.json({
    items: items.map((record) => ({
      ...record,
      customerName: record.customerName || record.user?.name || "Guest customer",
      email: record.email || record.user?.email || "",
      phone: record.phone || record.user?.phone || "",
      status: normalizeStatus(record.status),
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    summary: { total, byStatus: summary },
  });
});

exports.getAdmin = asyncHandler(async (request, response) => {
  response.json(await adminRequestDetails(request.params.id));
});

exports.updateStatus = asyncHandler(async (request, response) => {
  const status = requiredString(request.body.status, "Status", 30).toUpperCase();
  if (!statuses.includes(status)) throw badRequest(`Status must be one of: ${statuses.join(", ")}.`);
  const changed = await prisma.$transaction(async (transaction) => {
    await transaction.$queryRaw`SELECT "id" FROM "ServiceRequest" WHERE "id" = ${request.params.id} FOR UPDATE`;
    const current = await transaction.serviceRequest.findUnique({
      where: { id: request.params.id },
      select: { id: true, status: true },
    });
    if (!current) {
      const error = new Error("Service enquiry not found.");
      error.status = 404;
      throw error;
    }
    if (normalizeStatus(current.status) === status) return false;
    await transaction.serviceRequest.update({
      where: { id: current.id },
      data: { status },
    });
    await transaction.serviceRequestHistory.create({
      data: {
        requestId: current.id,
        status,
        isInternal: false,
        actorId: request.user.id,
      },
    });
    return true;
  });
  const updated = await adminRequestDetails(request.params.id);
  if (changed) notifyServiceRequest(updated, "status");
  response.json(updated);
});

exports.addInternalNote = asyncHandler(async (request, response) => {
  const note = requiredString(request.body.note, "Internal note", 4000);
  const serviceRequest = await prisma.serviceRequest.findUnique({
    where: { id: request.params.id },
    select: { id: true },
  });
  if (!serviceRequest) {
    const error = new Error("Service enquiry not found.");
    error.status = 404;
    throw error;
  }
  await prisma.serviceRequestHistory.create({
    data: {
      requestId: serviceRequest.id,
      note,
      isInternal: true,
      actorId: request.user.id,
    },
  });
  response.status(201).json(await adminRequestDetails(serviceRequest.id));
});

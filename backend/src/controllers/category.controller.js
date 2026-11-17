const prisma = require("../config/database");
const asyncHandler = require("../middlewares/asyncHandler");
const { requiredString, optionalString, optionalUrl, boolean, integer, badRequest } = require("../utils/validation");

const categoryInclude = { _count: { select: { products: true } } };

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function categoryData(body, partial = false) {
  const data = {};
  if (!partial || body.name !== undefined) data.name = requiredString(body.name, "Name", 120);
  if (!partial || body.slug !== undefined || body.name !== undefined) {
    const slug = body.slug === undefined ? data.name : requiredString(body.slug, "Slug", 140);
    data.slug = slugify(slug);
    if (!data.slug) throw Object.assign(new Error("Slug must contain letters or numbers."), { status: 400 });
  }
  if (!partial || body.description !== undefined) data.description = optionalString(body.description, "Description");
  if (!partial || body.imageUrl !== undefined) data.imageUrl = optionalUrl(body.imageUrl, "Image URL");
  if (!partial || body.isActive !== undefined) data.isActive = boolean(body.isActive, "Active status", true);
  return data;
}

function pagination(query) {
  const page = query.page === undefined ? 1 : integer(query.page, "Page", { min: 1, max: 1000000 });
  const limit = query.limit === undefined ? 20 : integer(query.limit, "Page size", { min: 1, max: 100 });
  return { page, limit };
}

function categoryWhere(query) {
  const where = {};
  const search = typeof query.search === "string" ? query.search.trim() : "";
  if (search) {
    where.OR = ["name", "slug", "description"].map((field) => ({
      [field]: { contains: search, mode: "insensitive" },
    }));
  }
  if (query.status === "active") where.isActive = true;
  else if (query.status === "inactive") where.isActive = false;
  else if (query.status !== undefined && query.status !== "" && query.status !== "all") {
    throw badRequest("Status must be active, inactive, or all.");
  }
  return where;
}

function conflict(message) {
  const error = new Error(message);
  error.status = 409;
  return error;
}

async function assertUnique(data, excludeId) {
  const conditions = [];
  if (data.name !== undefined) conditions.push({ name: { equals: data.name, mode: "insensitive" } });
  if (data.slug !== undefined) conditions.push({ slug: data.slug });
  if (!conditions.length) return;

  const existing = await prisma.category.findFirst({
    where: { ...(excludeId ? { id: { not: excludeId } } : {}), OR: conditions },
    select: { name: true, slug: true },
  });
  if (!existing) return;
  if (data.name !== undefined && existing.name.toLowerCase() === data.name.toLowerCase()) {
    throw conflict("A category with this name already exists.");
  }
  throw conflict("A category with this slug already exists.");
}

exports.list = asyncHandler(async (_request, response) => {
  response.json(await prisma.category.findMany({
    where: { isActive: true },
    include: categoryInclude,
    orderBy: { name: "asc" },
  }));
});

exports.listAdmin = asyncHandler(async (request, response) => {
  const { page, limit } = pagination(request.query);
  const where = categoryWhere(request.query);
  const [items, total] = await Promise.all([
    prisma.category.findMany({
      where,
      include: categoryInclude,
      orderBy: { name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.category.count({ where }),
  ]);
  response.json({ items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

exports.uploadImage = asyncHandler(async (request, response) => {
  if (!request.file) throw badRequest("Select a category image.");
  const baseUrl = process.env.API_PUBLIC_URL || `${request.protocol}://${request.get("host")}`;
  response.status(201).json({ imageUrl: `${baseUrl}/uploads/categories/${request.file.filename}` });
});

exports.getBySlug = asyncHandler(async (request, response) => {
  const category = await prisma.category.findFirst({
    where: { slug: request.params.slug, isActive: true },
    include: {
      products: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!category) return response.status(404).json({ message: "Category not found." });
  response.json(category);
});

exports.create = asyncHandler(async (request, response) => {
  const data = categoryData(request.body);
  await assertUnique(data);
  response.status(201).json(await prisma.category.create({ data }));
});

exports.update = asyncHandler(async (request, response) => {
  const data = categoryData(request.body, true);
  if (!Object.keys(data).length) throw badRequest("Provide at least one category field to update.");
  await assertUnique(data, request.params.id);
  response.json(await prisma.category.update({
    where: { id: request.params.id },
    data,
    include: categoryInclude,
  }));
});

exports.remove = asyncHandler(async (request, response) => {
  await prisma.category.delete({ where: { id: request.params.id } });
  response.status(204).end();
});
const prisma = require("../config/database");
const asyncHandler = require("../middlewares/asyncHandler");
const { requiredString, optionalString, optionalUrl } = require("../utils/validation");

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
  return data;
}

exports.list = asyncHandler(async (_request, response) => {
  response.json(await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  }));
});

exports.getBySlug = asyncHandler(async (request, response) => {
  const category = await prisma.category.findUnique({
    where: { slug: request.params.slug },
    include: { products: { orderBy: { createdAt: "desc" } } },
  });
  if (!category) return response.status(404).json({ message: "Category not found." });
  response.json(category);
});

exports.create = asyncHandler(async (request, response) => {
  response.status(201).json(await prisma.category.create({ data: categoryData(request.body) }));
});

exports.update = asyncHandler(async (request, response) => {
  response.json(await prisma.category.update({
    where: { id: request.params.id },
    data: categoryData(request.body, true),
  }));
});

exports.remove = asyncHandler(async (request, response) => {
  await prisma.category.delete({ where: { id: request.params.id } });
  response.status(204).end();
});
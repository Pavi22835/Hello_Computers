const prisma = require("../config/database");
const asyncHandler = require("../middlewares/asyncHandler");
const { requiredString, optionalString, optionalUrl, optionalNumber, integer, badRequest } = require("../utils/validation");

function storefrontProduct(product) {
  return {
    ...product,
    image: product.imageUrl,
    images: product.images?.map((image) => image.url) || [],
  };
}

function productData(body, partial = false) {
  const data = {};
  if (!partial || body.name !== undefined) data.name = requiredString(body.name, "Name", 180);
  if (body.description !== undefined || !partial) data.description = optionalString(body.description, "Description");
  if (body.brand !== undefined || !partial) data.brand = optionalString(body.brand, "Brand", 120);
  if (body.specifications !== undefined || !partial) data.specifications = optionalString(body.specifications, "Specifications", 1000);
  if (body.badge !== undefined || !partial) data.badge = optionalString(body.badge, "Badge", 60);
  if (!partial || body.price !== undefined) {
    data.price = optionalNumber(body.price, "Price", { min: 0.01, max: 100000000 });
    if (data.price === null) throw badRequest("Price is required.");
  }
  if (body.oldPrice !== undefined || !partial) data.oldPrice = optionalNumber(body.oldPrice, "Original price", { min: 0.01, max: 100000000 });
  if (body.stock !== undefined || !partial) data.stock = body.stock === undefined && !partial ? 0 : integer(body.stock, "Stock");
  if (body.imageUrl !== undefined || !partial) data.imageUrl = optionalUrl(body.imageUrl, "Image URL");
  if (body.categoryId !== undefined || !partial) data.categoryId = optionalString(body.categoryId, "Category ID", 100);
  if (data.oldPrice !== undefined && data.oldPrice !== null && data.price !== undefined && data.oldPrice < data.price) {
    throw badRequest("Original price cannot be lower than the current price.");
  }
  return data;
}

function productImages(body) {
  if (body.images === undefined) return null;
  if (!Array.isArray(body.images) || body.images.length > 10) {
    throw badRequest("Images must be an array of at most 10 URLs.");
  }
  return body.images.map((image, index) => ({
    url: optionalUrl(requiredString(image, `Image ${index + 1}`, 2000), `Image ${index + 1}`),
    sortOrder: index,
  }));
}

const productInclude = {
  category: { select: { id: true, name: true, slug: true } },
  images: { orderBy: { sortOrder: "asc" } },
};

exports.list = asyncHandler(async (request, response) => {
  const where = {};
  if (request.query.category) where.category = { slug: String(request.query.category) };
  if (request.query.search) {
    where.OR = ["name", "brand", "description"].map((field) => ({
      [field]: { contains: String(request.query.search) },
    }));
  }
  const products = await prisma.product.findMany({
    where,
    include: productInclude,
    orderBy: { createdAt: "desc" },
  });
  response.json(products.map(storefrontProduct));
});

exports.getById = asyncHandler(async (request, response) => {
  const product = await prisma.product.findUnique({
    where: { id: request.params.id },
    include: productInclude,
  });
  if (!product) return response.status(404).json({ message: "Product not found." });
  response.json(storefrontProduct(product));
});

exports.create = asyncHandler(async (request, response) => {
  const images = productImages(request.body);
  const product = await prisma.product.create({
    data: {
      ...productData(request.body),
      ...(images ? { images: { create: images } } : {}),
    },
    include: productInclude,
  });
  response.status(201).json(storefrontProduct(product));
});

exports.update = asyncHandler(async (request, response) => {
  const images = productImages(request.body);
  const data = productData(request.body, true);
  if (data.oldPrice !== undefined && data.oldPrice !== null) {
    const existing = await prisma.product.findUnique({
      where: { id: request.params.id },
      select: { price: true },
    });
    if (!existing) return response.status(404).json({ message: "Product not found." });
    if (data.oldPrice < (data.price ?? existing.price)) {
      throw badRequest("Original price cannot be lower than the current price.");
    }
  }
  const product = await prisma.product.update({
    where: { id: request.params.id },
    data: {
      ...data,
      ...(images ? {
        images: {
          deleteMany: {},
          create: images,
        },
      } : {}),
    },
    include: productInclude,
  });
  response.json(storefrontProduct(product));
});

exports.remove = asyncHandler(async (request, response) => {
  await prisma.product.delete({ where: { id: request.params.id } });
  response.status(204).end();
});
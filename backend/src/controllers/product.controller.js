const prisma = require("../config/database");
const asyncHandler = require("../middlewares/asyncHandler");
const { requiredString, optionalString, optionalUrl, optionalNumber, integer, boolean, badRequest } = require("../utils/validation");

const productInclude = {
  category: { select: { id: true, name: true, slug: true } },
  images: { orderBy: { sortOrder: "asc" } },
};

function storefrontProduct(product) {
  const price = product.discountPrice ?? product.price;
  return {
    ...product,
    oldPrice: product.discountPrice !== null && product.discountPrice !== undefined
      ? product.price
      : product.oldPrice,
    price,
    image: product.imageUrl,
    images: product.images?.map((image) => image.url) || [],
  };
}

function productData(body, partial = false) {
  const data = {};
  if (!partial || body.name !== undefined) data.name = requiredString(body.name, "Name", 180);
  if (body.model !== undefined || !partial) data.model = optionalString(body.model, "Model", 120);
  if (body.description !== undefined || !partial) data.description = optionalString(body.description, "Description");
  if (body.brand !== undefined || !partial) data.brand = optionalString(body.brand, "Brand", 120);
  if (body.specifications !== undefined || !partial) data.specifications = optionalString(body.specifications, "Specifications", 5000);
  if (body.badge !== undefined || !partial) data.badge = optionalString(body.badge, "Badge", 60);
  if (!partial || body.price !== undefined) {
    data.price = optionalNumber(body.price, "Price", { min: 0.01, max: 100000000 });
    if (data.price === null) throw badRequest("Price is required.");
  }
  if (body.discountPrice !== undefined || !partial) {
    data.discountPrice = optionalNumber(body.discountPrice, "Discount price", { min: 0.01, max: 100000000 });
  }
  if (body.oldPrice !== undefined || !partial) data.oldPrice = optionalNumber(body.oldPrice, "Original price", { min: 0.01, max: 100000000 });
  if (body.stock !== undefined || !partial) data.stock = body.stock === undefined && !partial ? 0 : integer(body.stock, "Stock");
  if (body.imageUrl !== undefined || !partial) data.imageUrl = optionalUrl(body.imageUrl, "Image URL");
  if (body.categoryId !== undefined || !partial) data.categoryId = optionalString(body.categoryId, "Category ID", 100);
  if (body.isFeatured !== undefined || !partial) data.isFeatured = boolean(body.isFeatured, "Featured status", false);
  if (body.isActive !== undefined || !partial) data.isActive = boolean(body.isActive, "Active status", true);

  const price = data.price;
  const discountPrice = data.discountPrice;
  if (discountPrice !== undefined && discountPrice !== null && price !== undefined && discountPrice >= price) {
    throw badRequest("Discount price must be lower than the regular price.");
  }
  const oldPrice = data.oldPrice;
  if (oldPrice !== undefined && oldPrice !== null && price !== undefined && oldPrice < price) {
    throw badRequest("Original price cannot be lower than the regular price.");
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

function pageOptions(query) {
  const page = query.page === undefined ? 1 : integer(query.page, "Page", { min: 1, max: 1000000 });
  const limit = query.limit === undefined ? 12 : integer(query.limit, "Page size", { min: 1, max: 100 });
  return { page, limit };
}

function productWhere(query, includeInactive = false) {
  const where = includeInactive ? {} : { isActive: true };
  const clauses = [];
  if (query.category) clauses.push({ category: { slug: String(query.category) } });
  if (query.brand) clauses.push({ brand: { equals: String(query.brand), mode: "insensitive" } });
  if (query.search) {
    const search = String(query.search).trim();
    if (search) clauses.push({
      OR: ["name", "model", "brand", "description", "specifications"].map((field) => ({
        [field]: { contains: search, mode: "insensitive" },
      })),
    });
  }
  if (query.featured === "true") clauses.push({ isFeatured: true });

  const minimum = optionalNumber(query.minPrice, "Minimum price", { min: 0, max: 100000000 });
  const maximum = optionalNumber(query.maxPrice, "Maximum price", { min: 0, max: 100000000 });
  if (minimum !== null || maximum !== null) {
    if (minimum !== null && maximum !== null && minimum > maximum) {
      throw badRequest("Minimum price cannot exceed maximum price.");
    }
    const priceRange = {};
    if (minimum !== null) priceRange.gte = minimum;
    if (maximum !== null) priceRange.lte = maximum;
    clauses.push({
      OR: [
        { discountPrice: { not: null, ...priceRange } },
        { discountPrice: null, price: priceRange },
      ],
    });
  }
  if (clauses.length) where.AND = clauses;
  return where;
}

function sortProducts(products, sort) {
  const price = (product) => product.discountPrice ?? product.price;
  if (sort === "price-low") products.sort((a, b) => price(a) - price(b));
  else if (sort === "price-high") products.sort((a, b) => price(b) - price(a));
  else if (sort === "name") products.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === "featured") products.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || b.createdAt - a.createdAt);
  else if (sort === "oldest") products.sort((a, b) => a.createdAt - b.createdAt);
  else products.sort((a, b) => b.createdAt - a.createdAt);
  return products;
}

function productOrderBy(sort) {
  if (sort === "name") return { name: "asc" };
  if (sort === "featured") return [{ isFeatured: "desc" }, { createdAt: "desc" }];
  if (sort === "oldest") return { createdAt: "asc" };
  return { createdAt: "desc" };
}

async function listProducts(query, includeInactive = false) {
  const { page, limit } = pageOptions(query);
  const where = productWhere(query, includeInactive);
  const effectivePriceSort = query.sort === "price-low" || query.sort === "price-high";
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productInclude,
      ...(effectivePriceSort
        ? {}
        : { orderBy: productOrderBy(query.sort), skip: (page - 1) * limit, take: limit }),
    }),
    prisma.product.count({ where }),
  ]);
  const sorted = sortProducts(products, String(query.sort || "newest"));
  const items = (effectivePriceSort ? sorted.slice((page - 1) * limit, page * limit) : sorted)
    .map(storefrontProduct);
  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

exports.list = asyncHandler(async (request, response) => {
  const result = await listProducts(request.query);
  if (request.query.page === undefined && request.query.limit === undefined) {
    return response.json(result.items);
  }
  response.json(result);
});

exports.listAdmin = asyncHandler(async (request, response) => {
  const { page, limit } = pageOptions(request.query);
  const where = productWhere(request.query, true);
  const effectivePriceSort = request.query.sort === "price-low" || request.query.sort === "price-high";
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productInclude,
      ...(effectivePriceSort
        ? {}
        : { orderBy: productOrderBy(request.query.sort), skip: (page - 1) * limit, take: limit }),
    }),
    prisma.product.count({ where }),
  ]);
  const sorted = sortProducts(products, String(request.query.sort || "newest"));
  const items = effectivePriceSort ? sorted.slice((page - 1) * limit, page * limit) : sorted;
  response.json({ items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

exports.filters = asyncHandler(async (_request, response) => {
  const [brands, regularPrices, discountedPrices] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, brand: { not: null } },
      distinct: ["brand"],
      select: { brand: true },
      orderBy: { brand: "asc" },
    }),
    prisma.product.aggregate({
      where: { isActive: true, discountPrice: null },
      _min: { price: true },
      _max: { price: true },
    }),
    prisma.product.aggregate({
      where: { isActive: true, discountPrice: { not: null } },
      _min: { discountPrice: true },
      _max: { discountPrice: true },
    }),
  ]);
  const minima = [regularPrices._min.price, discountedPrices._min.discountPrice].filter(Number.isFinite);
  const maxima = [regularPrices._max.price, discountedPrices._max.discountPrice].filter(Number.isFinite);
  response.json({
    brands: brands.map((item) => item.brand).filter(Boolean),
    minPrice: minima.length ? Math.min(...minima) : 0,
    maxPrice: maxima.length ? Math.max(...maxima) : 0,
  });
});

exports.uploadImages = asyncHandler(async (request, response) => {
  if (!request.files?.length) throw badRequest("Select at least one product image.");
  const baseUrl = process.env.API_PUBLIC_URL || `${request.protocol}://${request.get("host")}`;
  response.status(201).json({
    images: request.files.map((file) => `${baseUrl}/uploads/products/${file.filename}`),
  });
});

exports.getById = asyncHandler(async (request, response) => {
  const product = await prisma.product.findFirst({
    where: { id: request.params.id, isActive: true },
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
  if (Object.keys(data).length === 0 && images === null) {
    throw badRequest("Provide at least one product field to update.");
  }
  const product = await prisma.$transaction(async (transaction) => {
    await transaction.$queryRaw`SELECT "id" FROM "Product" WHERE "id" = ${request.params.id} FOR UPDATE`;
    const existing = await transaction.product.findUnique({
      where: { id: request.params.id },
      select: { price: true, discountPrice: true, reservedStock: true },
    });
    if (!existing) {
      const error = new Error("Product not found.");
      error.status = 404;
      throw error;
    }
    if (data.stock !== undefined && data.stock < existing.reservedStock) {
      const error = new Error("Stock cannot be reduced below the quantity reserved for pending payments.");
      error.status = 409;
      throw error;
    }
    const finalPrice = data.price ?? existing.price;
    const finalDiscountPrice = data.discountPrice === undefined ? existing.discountPrice : data.discountPrice;
    if (finalDiscountPrice !== undefined && finalDiscountPrice !== null && finalDiscountPrice >= finalPrice) {
      throw badRequest("Discount price must be lower than the regular price.");
    }
    if (data.oldPrice !== undefined && data.oldPrice !== null && data.oldPrice < finalPrice) {
      throw badRequest("Original price cannot be lower than the regular price.");
    }
    return transaction.product.update({
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
  });
  response.json(storefrontProduct(product));
});

exports.remove = asyncHandler(async (request, response) => {
  await prisma.$transaction(async (transaction) => {
    await transaction.$queryRaw`SELECT "id" FROM "Product" WHERE "id" = ${request.params.id} FOR UPDATE`;
    const product = await transaction.product.findUnique({
      where: { id: request.params.id },
      select: { reservedStock: true },
    });
    if (!product) {
      const error = new Error("Product not found.");
      error.status = 404;
      throw error;
    }
    if (product.reservedStock > 0) {
      const error = new Error("This product has stock reserved for a pending payment and cannot be deleted yet.");
      error.status = 409;
      throw error;
    }
    await transaction.cartItem.deleteMany({ where: { productId: request.params.id } });
    await transaction.product.delete({ where: { id: request.params.id } });
  });
  response.status(204).end();
});

const prisma = require("../config/database");
const asyncHandler = require("../middlewares/asyncHandler");
const { badRequest, integer, requiredString } = require("../utils/validation");

const includeProduct = {
  product: {
    include: {
      category: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { sortOrder: "asc" } },
    },
  },
};

function cartItemResponse(item) {
  return {
    ...item,
    product: {
      ...item.product,
      image: item.product.imageUrl,
      images: item.product.images.map((image) => image.url),
    },
  };
}

exports.list = asyncHandler(async (request, response) => {
  const items = await prisma.cartItem.findMany({
    where: { userId: request.user.id },
    include: includeProduct,
    orderBy: { updatedAt: "desc" },
  });
  response.json(items.map(cartItemResponse));
});

exports.replace = asyncHandler(async (request, response) => {
  if (!Array.isArray(request.body.items) || request.body.items.length > 50) {
    throw badRequest("Cart items must be an array of at most 50 products.");
  }
  const quantities = new Map();
  for (const item of request.body.items) {
    const productId = requiredString(item?.productId, "Product ID", 100);
    const quantity = integer(item?.quantity, "Quantity", { min: 1, max: 100 });
    const combined = (quantities.get(productId) || 0) + quantity;
    if (combined > 100) throw badRequest("A product quantity cannot exceed 100.");
    quantities.set(productId, combined);
  }

  const updated = await prisma.$transaction(async (transaction) => {
    const products = await transaction.product.findMany({ where: { id: { in: [...quantities.keys()] } } });
    if (products.length !== quantities.size) throw badRequest("One or more cart products are no longer available.");
    for (const product of products) {
      if (product.stock < quantities.get(product.id)) {
        const error = new Error(`${product.name} does not have enough stock.`);
        error.status = 409;
        throw error;
      }
    }

    await transaction.cartItem.deleteMany({ where: { userId: request.user.id } });
    for (const [productId, quantity] of quantities) {
      await transaction.cartItem.create({
        data: { userId: request.user.id, productId, quantity },
      });
    }
    return transaction.cartItem.findMany({
      where: { userId: request.user.id },
      include: includeProduct,
      orderBy: { updatedAt: "desc" },
    });
  });
  response.json(updated.map(cartItemResponse));
});

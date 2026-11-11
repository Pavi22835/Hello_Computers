const prisma = require("../config/database");
const { verifyToken } = require("../utils/token");
const asyncHandler = require("./asyncHandler");

const requireAuth = asyncHandler(async (request, response, next) => {
  const authorization = request.get("authorization") || "";
  const [scheme, token] = authorization.split(" ");
  if (scheme !== "Bearer" || !token) {
    return response.status(401).json({ message: "Authentication is required." });
  }

  const payload = verifyToken(token);
  if (!payload) return response.status(401).json({ message: "Your session is invalid or has expired." });

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, name: true, email: true, phone: true, role: true },
  });
  if (!user) return response.status(401).json({ message: "Your account is no longer available." });
  request.user = user;
  next();
});

function requireAdmin(request, response, next) {
  if (request.user?.role !== "ADMIN") {
    return response.status(403).json({ message: "Administrator access is required." });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
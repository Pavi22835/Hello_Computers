require("dotenv").config();

const prisma = require("../src/config/database");
const { email, requiredString } = require("../src/utils/validation");
const { hashPassword } = require("../src/utils/password");

async function createAdmin() {
  const address = email(process.env.ADMIN_EMAIL);
  const password = process.env.ADMIN_PASSWORD;
  if (typeof password !== "string" || password.length < 12) {
    throw new Error("Set ADMIN_PASSWORD to a password with at least 12 characters.");
  }
  const name = requiredString(process.env.ADMIN_NAME || "Store Administrator", "Admin name", 120);
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.upsert({
    where: { email: address },
    update: { name, passwordHash, role: "ADMIN" },
    create: { name, email: address, passwordHash, role: "ADMIN" },
    select: { email: true, role: true },
  });
  console.log(`Administrator ready: ${user.email}`);
}

createAdmin()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

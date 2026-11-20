require("dotenv").config();

const prisma = require("../src/config/database");
const { email } = require("../src/utils/validation");

async function promoteAdmin() {
  const [emailArgument, confirmation, ...extraArguments] = process.argv.slice(2);
  if (!emailArgument || confirmation !== "--confirm" || extraArguments.length > 0) {
    throw new Error("Usage: npm run admin:promote -- <existing-account-email> --confirm");
  }

  const address = email(emailArgument);
  const matches = await prisma.user.findMany({
    where: { email: { equals: address, mode: "insensitive" } },
    select: { id: true, email: true, role: true },
  });

  if (matches.length === 0) {
    throw new Error("No existing account matches that email. This command never creates accounts.");
  }
  if (matches.length > 1) {
    throw new Error("Multiple accounts match that email ignoring case. Resolve the duplicate records before promoting.");
  }

  const [user] = matches;
  if (user.role === "ADMIN") {
    console.log(`Administrator access is already enabled for ${user.email}.`);
    return;
  }
  if (user.role !== "CUSTOMER") {
    throw new Error(`Account role "${user.role}" is not eligible for promotion.`);
  }

  const result = await prisma.user.updateMany({
    where: { id: user.id, role: "CUSTOMER" },
    data: { role: "ADMIN" },
  });
  if (result.count !== 1) {
    throw new Error("Account role changed during promotion. No account was promoted.");
  }

  console.log(`Administrator access enabled for existing account ${user.email}. Password and other account fields were not changed.`);
}

promoteAdmin()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

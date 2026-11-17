require("dotenv").config();

const app = require("./app");
const prisma = require("./config/database");
const { cleanupExpiredReservations } = require("./controllers/order.controller");

const port = Number(process.env.PORT) || 5000;
const reservationCleanup = setInterval(() => {
  cleanupExpiredReservations().catch((error) => {
    console.error("Expired payment reservation cleanup failed:", error);
  });
}, 60 * 1000);
cleanupExpiredReservations().catch((error) => {
  console.error("Expired payment reservation cleanup failed:", error);
});

const server = app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});

async function shutdown() {
  clearInterval(reservationCleanup);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
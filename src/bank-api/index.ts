import { Elysia } from "elysia";
import type { PrismaClient } from "../../generated/prisma/client";

import { usersRoutes } from "./users";
import { transactionsRoutes } from "./transactions";
import { commitmentsRoutes } from "./commitments";

export default function bankApiRoutes(app: Elysia, prisma: any) {
  // Register all bank-api routes
  usersRoutes(app, prisma);
  transactionsRoutes(app, prisma);
  commitmentsRoutes(app, prisma);

  // Health check endpoint
  app.get("/bank-api/health", () => ({
    status: "ok",
    message: "Bank API is running",
    timestamp: new Date().toISOString(),
  }));

  return app;
}

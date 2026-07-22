import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

// Export the transaction client type directly from the db instance
export type TransactionClient = Parameters<
  Parameters<typeof db["$transaction"]>[0]
>[0];
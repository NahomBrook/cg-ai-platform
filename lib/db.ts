import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set to initialize Prisma.");
}

neonConfig.poolQueryViaFetch = true;

const adapter = new PrismaNeon({ connectionString: databaseUrl });

export const db =
  globalForPrisma.prisma || new PrismaClient({ adapter: adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

// Export the transaction client type directly from the db instance
export type TransactionClient = Parameters<
  Parameters<typeof db["$transaction"]>[0]
>[0];


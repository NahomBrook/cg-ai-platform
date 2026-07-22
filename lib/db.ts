import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

/**
 * Executes a set of Prisma database operations scoped to a specific tenant ID.
 * Sets the `app.current_tenant_id` configuration variable inside a Postgres transaction
 * to enforce Row-Level Security (RLS).
 */
export async function withTenant<T>(
  tenantId: string,
  fn: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>
): Promise<T> {
  return db.$transaction(async (tx) => {
    // Set current tenant context for RLS in PostgreSQL session
    await tx.$executeRawUnsafe(
      `SELECT set_config('app.current_tenant_id', '${tenantId}', true)`
    );
    return fn(tx);
  });
}
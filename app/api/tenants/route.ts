import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { name, ownerEmail, ownerName } = await req.json();

    // TypeScript automatically infers 'tx' as the TransactionClient type here
    const result = await db.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name,
        },
      });

      const user = await tx.appUser.create({
        data: {
          tenantId: tenant.id,
          email: ownerEmail,
          name: ownerName,
          role: "OWNER",
        },
      });

      return { tenant, user };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Failed to create tenant:", error);
    return NextResponse.json(
      { error: "Failed to create tenant" },
      { status: 500 }
    );
  }
}
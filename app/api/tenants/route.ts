import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, ownerEmail, pricingTier, isAgencyClient } = body;

    if (!name || !ownerEmail) {
      return NextResponse.json(
        { error: 'Tenant name and owner email are required.' },
        { status: 400 }
      );
    }

    // Execute atomic creation of Tenant and Initial Owner User
    const result = await db.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name,
          pricingTier: pricingTier || 'standard',
          discountFlag: Boolean(isAgencyClient),
        },
      });

      const owner = await tx.appUser.create({
        data: {
          tenantId: tenant.id,
          email: ownerEmail,
          role: 'TENANT_OWNER',
          authProvider: 'email',
        },
      });

      // Default Billing Entry
      await tx.billingSubscription.create({
        data: {
          tenantId: tenant.id,
          plan: pricingTier || 'standard',
          status: 'TRIALING',
        },
      });

      return { tenant, owner };
    });

    return NextResponse.json(
      {
        message: 'Tenant successfully registered.',
        tenantId: result.tenant.id,
        ownerId: result.owner.id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Tenant Creation Error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'User email already exists.' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
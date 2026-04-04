import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "VENDOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const medicines = await db.medicine.findMany({
      where: { vendorId: session.user.id },
      orderBy: { registeredAt: "desc" },
      select: {
        id: true,
        name: true,
        batchNumber: true,
        manufacturer: true,
        expiryDate: true,
        quantity: true,
        hash: true,
        status: true,
        registeredAt: true,
      },
    });

    return NextResponse.json({ success: true, medicines });
  } catch (error) {
    console.error("Failed to fetch medicines:", error);
    return NextResponse.json(
      { error: "Failed to fetch medicines" },
      { status: 500 }
    );
  }
}

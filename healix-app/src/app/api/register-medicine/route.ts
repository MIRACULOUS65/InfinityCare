import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "VENDOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, manufacturer, batchNumber, expiryDate, quantity, txHash } = body;

    if (!name || !manufacturer || !batchNumber || !expiryDate || !quantity || !txHash) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Save the medicine with its blockchain transaction hash
    const medicine = await db.medicine.create({
      data: {
        vendorId: session.user.id,
        name,
        manufacturer,
        batchNumber,
        expiryDate: new Date(expiryDate),
        quantity: typeof quantity === "string" ? parseInt(quantity, 10) : quantity,
        hash: txHash,
        status: "GENUINE",
      },
    });

    return NextResponse.json({ success: true, medicine });
  } catch (error) {
    console.error("Failed to register medicine:", error);
    return NextResponse.json(
      { error: "Failed to register medicine" },
      { status: 500 }
    );
  }
}

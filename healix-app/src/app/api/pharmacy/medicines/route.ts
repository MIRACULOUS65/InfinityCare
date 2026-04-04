import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "PHARMACY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const medicines = await db.medicine.findMany({
      orderBy: { registeredAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      medicines: medicines.map((m) => ({
        id: m.id,
        name: m.name,
        batchNumber: m.batchNumber,
        manufacturer: m.manufacturer,
        expiryDate: m.expiryDate.toISOString(),
        quantity: m.quantity,
        status: m.status,
        registeredAt: m.registeredAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Get medicines error:", error);
    return NextResponse.json({ error: "Failed to fetch medicines" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "PHARMACY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, batchNumber, manufacturer, expiryDate, quantity } = await req.json();

    if (!name || !batchNumber || !manufacturer || !expiryDate || !quantity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate a unique hash for this medicine entry
    const hashInput = `${name}-${batchNumber}-${manufacturer}-${Date.now()}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(hashInput);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    const medicine = await db.medicine.create({
      data: {
        vendorId: session.user.id,
        name,
        batchNumber,
        manufacturer,
        expiryDate: new Date(expiryDate),
        quantity: parseInt(quantity, 10),
        hash,
        status: "GENUINE",
      },
    });

    return NextResponse.json({
      success: true,
      medicine: {
        id: medicine.id,
        name: medicine.name,
        batchNumber: medicine.batchNumber,
        manufacturer: medicine.manufacturer,
        expiryDate: medicine.expiryDate.toISOString(),
        quantity: medicine.quantity,
        status: medicine.status,
        registeredAt: medicine.registeredAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Add medicine error:", error);
    return NextResponse.json({ error: "Failed to add medicine" }, { status: 500 });
  }
}

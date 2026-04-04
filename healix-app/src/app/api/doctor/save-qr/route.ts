import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || (session.user.role !== "DOCTOR" && session.user.role !== "HOSPITAL")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prescriptionId, qrData } = await req.json();

    if (!prescriptionId || !qrData) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Verify the prescription belongs to this doctor
    const prescription = await db.prescription.findFirst({
      where: { id: prescriptionId, doctorId: session.user.id },
    });

    if (!prescription) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }

    await db.prescription.update({
      where: { id: prescriptionId },
      data: { qrData },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save QR error:", error);
    return NextResponse.json({ error: "Failed to save QR data" }, { status: 500 });
  }
}

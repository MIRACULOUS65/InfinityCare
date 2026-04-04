import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ prescriptionId: string }> }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "PHARMACY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await params in Next.js 15+
    const resolvedParams = await params;
    const { prescriptionId } = resolvedParams;

    if (!prescriptionId) {
      return NextResponse.json({ error: "Missing prescription ID" }, { status: 400 });
    }

    const prescription = await db.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        doctor: { select: { id: true, name: true } },
      },
    });

    if (!prescription) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }

    // Fetch patient details separately since there is no direct relation in Prisma schema
    const patient = await db.user.findUnique({
      where: { id: prescription.patientId },
      select: { id: true, name: true },
    });

    return NextResponse.json({
      success: true,
      prescription: {
        prescriptionId: prescription.id,
        doctorId: prescription.doctor.id,
        doctorName: prescription.doctor.name,
        patientId: prescription.patientId,
        patientName: patient?.name || "Unknown Patient",
        medicines: prescription.medicinesJson,
        instructions: prescription.instructions,
        issuedAt: prescription.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Fetch prescription error:", error);
    return NextResponse.json({ error: "Failed to fetch prescription details" }, { status: 500 });
  }
}

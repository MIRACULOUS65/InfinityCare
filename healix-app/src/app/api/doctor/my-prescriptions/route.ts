import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || (session.user.role !== "DOCTOR" && session.user.role !== "HOSPITAL")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prescriptions = await db.prescription.findMany({
      where: { doctorId: session.user.id },
      include: {
        doctor: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Fetch patient names for each prescription
    const patientIds = [...new Set(prescriptions.map((p: any) => p.patientId))];
    const patients = await db.user.findMany({
      where: { id: { in: patientIds } },
      select: { id: true, name: true, email: true },
    });
    const patientMap = Object.fromEntries(patients.map((p: any) => [p.id, p]));

    return NextResponse.json({
      success: true,
      prescriptions: prescriptions.map((p: any) => ({
        id: p.id,
        patientId: p.patientId,
        patientName: patientMap[p.patientId]?.name || "Unknown",
        patientEmail: patientMap[p.patientId]?.email || "",
        doctorName: p.doctor.name,
        doctorId: p.doctor.id,
        medicines: p.medicinesJson,
        instructions: p.instructions,
        qrData: p.qrData,
        createdAt: p.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Get doctor prescriptions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch prescriptions" },
      { status: 500 }
    );
  }
}

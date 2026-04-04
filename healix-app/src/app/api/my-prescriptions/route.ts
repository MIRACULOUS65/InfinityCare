import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prescriptions = await db.prescription.findMany({
      where: { patientId: session.user.id },
      include: {
        doctor: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      prescriptions: prescriptions.map((p) => ({
        id: p.id,
        doctorName: p.doctor.name,
        doctorId: p.doctor.id,
        medicines: p.medicinesJson,
        instructions: p.instructions,
        createdAt: p.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Get prescriptions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch prescriptions" },
      { status: 500 }
    );
  }
}

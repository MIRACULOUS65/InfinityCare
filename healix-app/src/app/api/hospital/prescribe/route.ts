import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { patientId, medicines, instructions } = await req.json();

    if (!patientId || !medicines || medicines.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Create the Prescription record
    const prescription = await db.prescription.create({
      data: {
        patientId,
        doctorId: session.user.id,
        medicinesJson: medicines,
        instructions: instructions || null,
      },
    });

    // 2. Also create a Document record so the patient can see it in their documents
    await db.document.create({
      data: {
        patientId,
        documentType: "PRESCRIPTION",
        fileUrl: `prescription://${prescription.id}`,
        fileName: `Prescription by Dr. ${session.user.name} — ${new Date().toLocaleDateString()}`,
        accessHospital: true, // Prescriptions are always accessible to hospitals
      },
    });

    // 3. Send a notification to the patient
    await db.notification.create({
      data: {
        patientId,
        message: `Dr. ${session.user.name} has prescribed you new medication.`,
      },
    });

    return NextResponse.json({
      success: true,
      prescription: {
        id: prescription.id,
        createdAt: prescription.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Prescribe error:", error);
    return NextResponse.json(
      { error: "Failed to create prescription" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "PATIENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { summaryId, doctorId } = body;

    if (!summaryId || !doctorId) {
      return NextResponse.json({ error: "summaryId and doctorId are required" }, { status: 400 });
    }

    // Verify this summary belongs to the patient
    const summary = await db.aISummary.findFirst({
      where: { id: summaryId, patientId: session.user.id },
    });

    if (!summary) {
      return NextResponse.json({ error: "Summary not found" }, { status: 404 });
    }

    // Verify the doctorId is a real DOCTOR user
    const doctor = await db.user.findFirst({
      where: { id: doctorId, role: "DOCTOR" },
      select: { id: true, name: true },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    // Share the summary
    const updated = await db.aISummary.update({
      where: { id: summaryId },
      data: { sharedWithDoctorId: doctorId },
    });

    console.log(`[share-summary] Patient ${session.user.id} shared summary ${summaryId} with Dr. ${doctor.name}`);
    return NextResponse.json({ success: true, summary: updated, sharedWith: doctor });
  } catch (error) {
    console.error("[share-summary] Error:", error);
    return NextResponse.json({ error: "Failed to share summary" }, { status: 500 });
  }
}

// Unshare endpoint
export async function DELETE(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "PATIENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { summaryId } = body;

    const summary = await db.aISummary.findFirst({
      where: { id: summaryId, patientId: session.user.id },
    });

    if (!summary) {
      return NextResponse.json({ error: "Summary not found" }, { status: 404 });
    }

    await db.aISummary.update({
      where: { id: summaryId },
      data: { sharedWithDoctorId: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[share-summary unshare] Error:", error);
    return NextResponse.json({ error: "Failed to unshare" }, { status: 500 });
  }
}

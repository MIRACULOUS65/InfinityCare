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

    if (session.user.role !== "DOCTOR" && session.user.role !== "HOSPITAL") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only fetch summaries explicitly shared with this doctor
    const summaries = await db.aISummary.findMany({
      where: { sharedWithDoctorId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    if (summaries.length === 0) {
      return NextResponse.json({ success: true, summaries: [] });
    }

    const uniquePatientIds = [...new Set(summaries.map((s) => s.patientId))];

    const patients = await db.user.findMany({
      where: { id: { in: uniquePatientIds } },
      select: { id: true, name: true, email: true },
    });
    const patientMap = Object.fromEntries(patients.map((p) => [p.id, p]));

    const result = summaries.map((s) => ({
      id: s.id,
      patientId: s.patientId,
      patientName: patientMap[s.patientId]?.name || "Unknown Patient",
      patientEmail: patientMap[s.patientId]?.email || "",
      summaryText: s.summaryText,
      createdAt: s.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, summaries: result });
  } catch (error) {
    console.error("[patient-summaries] Error:", error);
    return NextResponse.json({ error: "Failed to fetch patient summaries" }, { status: 500 });
  }
}

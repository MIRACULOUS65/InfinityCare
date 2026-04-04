import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "PHARMACY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prescriptionId, patientName, patientId, doctorName, doctorId, medicines } = await req.json();

    // Store as a notification/log — using a simple approach with a new table-less approach
    // We'll use the Notification model repurposed, or create a dispensing log
    // For now, store as JSON metadata in a simple approach
    await db.notification.create({
      data: {
        patientId: session.user.id, // Using pharmacy's own ID as the "patient" since we track pharmacy actions
        message: JSON.stringify({
          type: "DISPENSING_LOG",
          prescriptionId,
          patientName,
          patientId,
          doctorName,
          doctorId,
          medicines,
          dispensedAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Log dispensing error:", error);
    return NextResponse.json({ error: "Failed to log dispensing" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "PHARMACY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const logs = await db.notification.findMany({
      where: { patientId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    // Filter only dispensing logs
    const dispensingLogs = logs
      .map((log) => {
        try {
          const data = JSON.parse(log.message);
          if (data.type === "DISPENSING_LOG") {
            return { id: log.id, ...data, createdAt: log.createdAt.toISOString() };
          }
          return null;
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    return NextResponse.json({ success: true, logs: dispensingLogs });
  } catch (error) {
    console.error("Get dispensing logs error:", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}

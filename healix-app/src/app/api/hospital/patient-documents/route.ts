import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "HOSPITAL") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { patientId } = await req.json();

    if (!patientId) {
      return NextResponse.json({ error: "Missing patient ID" }, { status: 400 });
    }

    // Ensure patient exists
    const patient = await db.user.findFirst({
      where: { id: patientId, role: "PATIENT" },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // 1. Fetch only documents explicitly permitted by the patient
    const documents = await db.document.findMany({
      where: {
        patientId: patientId,
        accessHospital: true,
      },
      select: {
        id: true,
        documentType: true,
        fileName: true,
        fileUrl: true,
        createdAt: true,
      },
    });

    // 2. Audit Trail: Only log access & notify if there were NEW documents accessed by this doctor
    if (documents.length > 0) {
      // Find existing logs to prevent duplicates
      const existingLogs = await db.accessLog.findMany({
        where: {
          hospitalId: session.user.id,
          documentId: { in: documents.map((d) => d.id) },
        },
        select: { documentId: true },
      });
      
      const existingDocIds = new Set(existingLogs.map((log) => log.documentId));

      const newDocsToLog = documents.filter((doc) => !existingDocIds.has(doc.id));

      if (newDocsToLog.length > 0) {
        const logEntries = newDocsToLog.map((doc) => ({
          patientId: patientId,
          hospitalId: session.user.id,
          documentId: doc.id,
        }));
        
        await db.accessLog.createMany({
          data: logEntries,
        });

        // Create a single Notification for the patient regarding this NEW access event
        await db.notification.create({
          data: {
            patientId: patientId,
            message: `Your medical vault was accessed by Hospital Doctor: ${session.user.name}. They viewed ${newDocsToLog.length} new permitted document(s).`,
          },
        });
      }
    }

    return NextResponse.json({ success: true, documents });
  } catch (error) {
    console.error("Failed to fetch patient documents:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

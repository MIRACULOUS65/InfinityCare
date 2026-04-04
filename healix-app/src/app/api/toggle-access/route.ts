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

    const { documentId, accessHospital } = await req.json();

    if (typeof documentId !== "string" || typeof accessHospital !== "boolean") {
      return NextResponse.json({ error: "Invalid payload parameters" }, { status: 400 });
    }

    // Verify ownership of the document
    const doc = await db.document.findUnique({
      where: { id: documentId },
    });

    if (!doc || doc.patientId !== session.user.id) {
      return NextResponse.json({ error: "Document not found or unauthorized" }, { status: 404 });
    }

    // Update the accessHospital flag
    const updatedDocument = await db.document.update({
      where: { id: documentId },
      data: { accessHospital },
    });

    return NextResponse.json({ success: true, document: updatedDocument });
  } catch (error) {
    console.error("Failed to toggle hospital access:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

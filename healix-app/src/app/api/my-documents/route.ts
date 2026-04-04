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

    const documents = await db.document.findMany({
      where: { patientId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fileName: true,
        documentType: true,
        fileUrl: true,
        createdAt: true,
        accessHospital: true,
      },
    });

    return NextResponse.json({ success: true, documents });
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

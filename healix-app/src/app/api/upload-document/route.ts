import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { DocumentType } from "@prisma/client";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url, filename, documentType, size } = await req.json();

    if (!url || !filename || !documentType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Map the string documentType to the Prisma enum
    const mapTypeToEnum = (type: string): DocumentType => {
      const typeMap: Record<string, DocumentType> = {
        lab_report: "LAB_REPORT",
        prescription: "PRESCRIPTION",
        insurance: "INSURANCE",
        discharge_summary: "DISCHARGE_SUMMARY",
      };
      return typeMap[type] || "OTHER";
    };

    // Store in Supabase via Prisma
    const document = await db.document.create({
      data: {
        patientId: session.user.id,
        documentType: mapTypeToEnum(documentType),
        fileUrl: url,
        fileName: filename,
        accessHospital: false, // Default is false, user must manually grant access
      },
    });

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        url: document.fileUrl,
        name: document.fileName,
        documentType: documentType,
        uploadedAt: document.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Save document error:", error);
    return NextResponse.json(
      { error: "Failed to save document record" },
      { status: 500 }
    );
  }
}

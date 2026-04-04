import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "HOSPITAL") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const logs = await db.accessLog.findMany({
      where: { hospitalId: session.user.id },
      orderBy: { accessedAt: "desc" },
      include: {
        document: {
          select: {
            fileName: true,
            documentType: true,
            patient: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, logs });
  } catch (error) {
    console.error("Failed to fetch access logs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "PATIENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const summaries = await db.aISummary.findMany({
      where: { patientId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, summaries });
  } catch (error) {
    console.error("[my-summaries] Error:", error);
    return NextResponse.json({ error: "Failed to fetch summaries" }, { status: 500 });
  }
}

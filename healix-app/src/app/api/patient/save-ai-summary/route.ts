import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      console.warn("[save-ai-summary] Blocked: No active session found.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    if (session.user.role !== "PATIENT") {
      console.warn("[save-ai-summary] Blocked: Role mismatch.", session.user.role);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { summaryText } = body;

    if (!summaryText) {
      return NextResponse.json({ error: "Summary text is required" }, { status: 400 });
    }

    const aiSummary = await db.aISummary.create({
      data: {
        patientId: session.user.id,
        summaryText,
      },
    });

    console.log("[save-ai-summary] Success! Created ID:", aiSummary.id);
    return NextResponse.json({ success: true, aiSummary });
  } catch (error: any) {
    console.error("[save-ai-summary] DB Persist error:", {
      message: error?.message,
      stack: error?.stack,
      raw: error
    });
    return NextResponse.json({ error: "Failed to save summary" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || (session.user.role !== "HOSPITAL" && session.user.role !== "DOCTOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ success: true, patients: [] });
    }

    // Search specifically for Patients by name or ID
    const patients = await db.user.findMany({
      where: {
        role: "PATIENT",
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { id: { equals: query } },
          { email: { contains: query, mode: "insensitive" } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
      take: 20
    });

    return NextResponse.json({ success: true, patients });
  } catch (error) {
    console.error("Failed to search patients:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

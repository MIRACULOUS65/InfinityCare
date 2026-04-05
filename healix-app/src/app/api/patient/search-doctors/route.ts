import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "PATIENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim() || "";

    // If no query, return ALL doctors from the database
    const doctors = await db.user.findMany({
      where: {
        role: "DOCTOR",
        ...(query.length > 0
          ? {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { email: { contains: query, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      take: 20,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, doctors });
  } catch (error) {
    console.error("[search-doctors] Error:", error);
    return NextResponse.json({ error: "Failed to search doctors" }, { status: 500 });
  }
}

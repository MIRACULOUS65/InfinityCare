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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { hash } = body;

    if (!hash) {
      return NextResponse.json({ error: "Missing transaction hash in QR payload" }, { status: 400 });
    }

    // Lookup the medicine globally by hash
    const medicine = await db.medicine.findFirst({
      where: { hash },
      select: {
        id: true,
        name: true,
        batchNumber: true,
        manufacturer: true,
        expiryDate: true,
        quantity: true,
        hash: true,
        status: true,
        registeredAt: true,
        vendor: {
          select: {
            name: true,
            email: true,
          }
        }
      },
    });

    if (!medicine) {
      return NextResponse.json({ 
        success: false, 
        message: "No such medicine batch exists in the registry. Possible counterfeit!" 
      }, { status: 404 });
    }

    return NextResponse.json({ success: true, medicine });
  } catch (error) {
    console.error("Failed to verify medicine:", error);
    return NextResponse.json(
      { error: "Internal server error during verification" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    let folder = "healix/uploads";

    if (type !== "signup") {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      folder = `healix/patients/${session.user.id}`;
    } else {
      folder = "healix/signups";
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Generate signature
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
      },
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      signature,
      timestamp,
      folder,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    });
  } catch (error) {
    console.error("Signature error:", error);
    return NextResponse.json(
      { error: "Failed to generate signature" },
      { status: 500 }
    );
  }
}

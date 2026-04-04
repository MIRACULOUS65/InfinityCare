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

    const notifications = await db.notification.findMany({
      where: { patientId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return NextResponse.json({ success: true, notifications, unreadCount });
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "PATIENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notificationId } = await req.json();

    if (notificationId === "ALL") {
      await db.notification.updateMany({
        where: { patientId: session.user.id, isRead: false },
        data: { isRead: true },
      });
    } else {
      await db.notification.updateMany({
        where: { id: notificationId, patientId: session.user.id },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update definitions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

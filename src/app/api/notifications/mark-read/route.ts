import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  await connectDB();

  const { user_id } = await req.json();

  if (!user_id) {
    return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
  }

  try {
    const result = await Notification.updateMany(
      { user_id, isRead: false },
      { $set: { isRead: true } }
    );

    return NextResponse.json({
      ok: true,
      updatedCount: result.modifiedCount,
      message: `${result.modifiedCount} notifications marked as read`
    });
  } catch (err) {
    console.error("Erro ao marcar notificações como lidas:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

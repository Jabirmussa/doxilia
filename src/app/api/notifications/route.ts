
import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await connectDB();

  const userId = req.headers.get("x-user-id");

  if (!userId) {
    return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
  }

  try {
    const notifs = await Notification.find({ user_id: userId, isRead: false }).sort({ createdAt: -1 });

    return NextResponse.json({ count: notifs.length, notifications: notifs });
  } catch (err) {
    console.error("Erro ao buscar notificações:", err);
    return NextResponse.json({ error: "Erro interno ao buscar notificações" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  await connectDB();

  try {
    const body = await req.json();
    const userId = body.user_id;

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const result = await Notification.updateMany(
      { user_id: userId, isRead: false },
      { $set: { isRead: true } }
    );

    return NextResponse.json({ updatedCount: result.modifiedCount });
  } catch (err) {
    console.error("Erro ao marcar notificações como lidas:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

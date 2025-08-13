import { connectDB } from "@/lib/mongodb";
import Task from "@/models/Task";
import Notification from "@/models/Notification";
import { NextRequest, NextResponse } from "next/server";

type ContextType = {
  params: Promise<{
    id: string;
    payment_id: string;
  }>;
};

export async function PUT(req: NextRequest, context: ContextType) {
  await connectDB();

  try {
    const params = await context.params; // await aqui, porque é Promise
    const { reason } = await req.json();

    const updatedTask = await Task.findByIdAndUpdate(
      params.payment_id,
      {
        $set: {
          status: "OPEN",
          description: reason,
          upload: "",
        },
      },
      { new: true }
    );

    if (!updatedTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (updatedTask.client_id) {
      await Notification.create({
        user_id: updatedTask.client_id,
        message: `Your document for "${updatedTask.what}" was rejected. Please reupload.`,
        role: "client",
      });
    }

    return NextResponse.json({ message: "Rejeição registrada", task: updatedTask });
  } catch (err) {
    console.error("Erro ao rejeitar task:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
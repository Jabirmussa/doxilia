import { connectDB } from '@/lib/mongodb';
import Task from '@/models/Task';
import Notification from '@/models/Notification';
import { NextRequest, NextResponse } from 'next/server';

type Context = {
  params: Promise<{ id: string }>;
};

export async function PUT(req: NextRequest, context: Context) {
  await connectDB();

  try {
    const params = await context.params; // await aqui
    const { id } = params;
    const { reason } = await req.json();

    if (!reason) {
      return NextResponse.json({ error: "Missing reason" }, { status: 400 });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      {
        $set: {
          status: "UPLOAD NEW FILE",
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

    return NextResponse.json({
      message: "Rejeição registrada",
      task: updatedTask,
    });
  } catch (err) {
    console.error("Erro ao rejeitar task:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

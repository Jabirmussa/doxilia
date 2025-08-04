import { connectDB } from '@/lib/mongodb';
import Task from '@/models/Task';
import Notification from '@/models/Notification';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  await connectDB();

  try {
    const { id } = context.params;
    const { status } = await req.json();

    if (!status) {
      return NextResponse.json({ error: "Missing status" }, { status: 400 });
    }

    const updated = await Task.findByIdAndUpdate(id, { status }, { new: true });

    if (!updated) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    let message = "";
    if (status === "CHECKING") {
      message = `Document sent for task "${updated.what}" is being verified.`;
    } else if (status === "CLOSE") {
      message = `Document for task "${updated.what}" has been approved and task is now closed.`;
    } else if (status === "OPEN") {
      message = `Task "${updated.what}" reopened. Please reupload the file.`;
    }

    if (message && updated.client_id) {
      await Notification.create({
        user_id: updated.client_id,
        message,
        role: "client",
      });
    }

    return NextResponse.json({ message: "Status updated successfully!" });
  } catch (err) {
    console.error("Error updating status", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

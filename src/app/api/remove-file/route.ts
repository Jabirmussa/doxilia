import { connectDB } from '@/lib/mongodb';
import Task from '@/models/Task';
import { NextResponse } from 'next/server';

export async function DELETE(req: Request) {
  await connectDB();

  try {
    const body = await req.json();
    const { taskId, fileType } = body;

    if (!taskId || !["upload", "guide"].includes(fileType)) {
      return NextResponse.json({ error: "Invalid data." }, { status: 400 });
    }

    await Task.findByIdAndUpdate(taskId, {
      $unset: { [fileType]: "" }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error removing file:", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

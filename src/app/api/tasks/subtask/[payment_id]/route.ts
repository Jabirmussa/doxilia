/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Task from '@/models/Task';
import fs from 'fs';
import path from 'path';

export async function PUT(req: NextRequest, context: any) {
  await connectDB();

  const { payment_id } = await context.params;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ message: 'File not provided' }, { status: 400 });
    }

    // Salvar arquivo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const uploadPath = path.join(process.cwd(), 'public', 'uploads');

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    const filePath = path.join(uploadPath, filename);
    fs.writeFileSync(filePath, buffer);
    const fileUrl = `/uploads/${filename}`;

    // Atualizar subTask
    const taskId = formData.get('taskId') as string;
    if (!taskId) {
      return NextResponse.json({ message: 'Task ID required' }, { status: 400 });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    const subTaskIndex = task.subTasks.findIndex(
      (st: { payment_id: string }) => st.payment_id === payment_id
    );

    if (subTaskIndex === -1) {
      return NextResponse.json({ message: 'SubTask not found' }, { status: 404 });
    }

    task.subTasks[subTaskIndex].upload = fileUrl;
    await task.save();

    return NextResponse.json({ message: 'SubTask upload updated', fileUrl });
  } catch (err) {
    console.error('Error uploading subTask file:', err);
    return NextResponse.json({ message: 'Internal error' }, { status: 500 });
  }
}

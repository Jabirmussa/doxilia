import { connectDB } from '@/lib/mongodb';
import Task from '@/models/Task';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function PUT(req: NextRequest) {
  await connectDB();

  try {
    const id = req.nextUrl.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ message: "Task ID not provided." }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ message: "No files sent." }, { status: 400 });
    }

    // Salvar o arquivo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const uploadPath = path.join(process.cwd(), "public", "uploads");

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    const filePath = path.join(uploadPath, fileName);
    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/${fileName}`;

    const task = await Task.findByIdAndUpdate(
      id,
      { upload: fileUrl },
      { new: true }
    );

    if (!task) {
      return NextResponse.json({ message: "Task not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Upload successful!", uploadLink: fileUrl, task });
  } catch (err) {
    console.error("Error uploading:", err);
    return NextResponse.json({ message: "Internal error while uploading." }, { status: 500 });
  }
}

import { connectDB } from '@/lib/mongodb';
import Task from '@/models/Task';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ message: "Nenhum arquivo enviado." }, { status: 400 });
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

    // Atualizar apenas o campo `upload` da task
    const task = await Task.findByIdAndUpdate(
      params.id,
      { upload: fileUrl },
      { new: true }
    );

    if (!task) {
      return NextResponse.json({ message: "Tarefa não encontrada." }, { status: 404 });
    }

    return NextResponse.json({ message: "Upload feito com sucesso!", uploadLink: fileUrl, task });
  } catch (err) {
    console.error("Erro ao fazer upload:", err);
    return NextResponse.json({ message: "Erro interno ao fazer upload." }, { status: 500 });
  }
}

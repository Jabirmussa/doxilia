import { connectDB } from '@/lib/mongodb';
import Task from '@/models/Task';
import { NextResponse, NextRequest } from 'next/server';

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await connectDB();

  try {
    const params = await context.params; 
    const deleted = await Task.findByIdAndDelete(params.id);

    if (!deleted) {
      return NextResponse.json({ error: "Task não encontrada" }, { status: 404 });
    }

    return NextResponse.json({ message: "Task deletada com sucesso!" });
  } catch (err) {
    console.error("Erro ao deletar task:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await connectDB();

  try {
    const params = await context.params;
    const body = await req.json();

    const updated = await Task.findByIdAndUpdate(params.id, body, { new: true });

    if (!updated) {
      return NextResponse.json({ error: "Task não encontrada" }, { status: 404 });
    }

    return NextResponse.json({ message: "Task atualizada com sucesso!", task: updated });
  } catch (err) {
    console.error("Erro ao atualizar task:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

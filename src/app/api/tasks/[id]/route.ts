import { connectDB } from '@/lib/mongodb';
import Task from '@/models/Task';
import { NextResponse } from 'next/server';

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await connectDB();

  try {
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

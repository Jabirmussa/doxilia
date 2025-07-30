import { connectDB } from '@/lib/mongodb';
import Accountant from '@/models/Accountant';
import { NextResponse } from 'next/server';

// GET
export async function GET(_: Request, { params }: { params: { id: string } }) {
  await connectDB();
  const accountant = await Accountant.findById(params.id);
  if (!accountant) return new Response('Accountant not found', { status: 404 });
  return NextResponse.json(accountant);
}

// PUT
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  const data = await req.json();
  const updated = await Accountant.findByIdAndUpdate(params.id, data, { new: true });
  if (!updated) return new Response('Accountant not found', { status: 404 });
  return NextResponse.json(updated);
}

// DELETE
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await connectDB();
  const deleted = await Accountant.findByIdAndDelete(params.id);
  if (!deleted) return new Response('Accountant not found', { status: 404 });
  return NextResponse.json({ message: 'Accountant deleted successfully' });
}

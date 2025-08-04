import { connectDB } from '@/lib/mongodb';
import Accountant from '@/models/Accountant';
import { NextResponse } from 'next/server';

// GET
export async function GET(request: Request, context: { params: { id: string } }) {
  await connectDB();
  const { id } = context.params;
  const accountant = await Accountant.findById(id);
  if (!accountant) return new Response('Accountant not found', { status: 404 });
  return NextResponse.json(accountant);
}

// PUT
export async function PUT(req: Request, context: { params: { id: string } }) {
  await connectDB();
  const { id } = context.params;
  const data = await req.json();
  const updated = await Accountant.findByIdAndUpdate(id, data, { new: true });
  if (!updated) return new Response('Accountant not found', { status: 404 });
  return NextResponse.json(updated);
}

// DELETE
export async function DELETE(request: Request, context: { params: { id: string } }) {
  await connectDB();
  const { id } = context.params;
  const deleted = await Accountant.findByIdAndDelete(id);
  if (!deleted) return new Response('Accountant not found', { status: 404 });
  return NextResponse.json({ message: 'Accountant deleted successfully' });
}
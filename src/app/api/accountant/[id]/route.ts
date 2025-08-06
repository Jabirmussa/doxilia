import { connectDB } from '@/lib/mongodb';
import Accountant from '@/models/Accountant';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  await connectDB();
  const accountant = await Accountant.findById(params.id);
  if (!accountant) return new NextResponse('Accountant not found', { status: 404 });
  return NextResponse.json(accountant);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  await connectDB();
  const data = await req.json();
  const updated = await Accountant.findByIdAndUpdate(params.id, data, { new: true });
  if (!updated) return new NextResponse('Accountant not found', { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  await connectDB();
  const deleted = await Accountant.findByIdAndDelete(params.id);
  if (!deleted) return new NextResponse('Accountant not found', { status: 404 });
  return NextResponse.json({ message: 'Accountant deleted successfully' });
}

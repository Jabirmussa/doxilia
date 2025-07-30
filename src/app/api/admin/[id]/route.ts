import { connectDB } from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { NextResponse } from 'next/server';

// GET
export async function GET(_: Request, { params }: { params: { id: string } }) {
  await connectDB();
  const admin = await Admin.findById(params.id);
  if (!admin) return new Response('Admin not found', { status: 404 });
  return NextResponse.json(admin);
}

// PUT
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  const data = await req.json();
  const updated = await Admin.findByIdAndUpdate(params.id, data, { new: true });
  if (!updated) return new Response('Admin not found', { status: 404 });
  return NextResponse.json(updated);
}

// DELETE
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await connectDB();
  const deleted = await Admin.findByIdAndDelete(params.id);
  if (!deleted) return new Response('Admin not found', { status: 404 });
  return NextResponse.json({ message: 'Admin deleted successfully' });
}

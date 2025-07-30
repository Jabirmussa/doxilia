import { connectDB } from '@/lib/mongodb';
import Client from '@/models/Client';
import { NextResponse } from 'next/server';

// GET por ID
export async function GET(_: Request, context: { params: { id: string } }) {
  const { params } = await context;
  await connectDB();
  const client = await Client.findById(params.id);
  if (!client) return new Response('Client not found', { status: 404 });
  return NextResponse.json(client);
}

// PUT (update)
export async function PUT(req: Request, context: { params: { id: string } }) {
  const { params } = await context;
  await connectDB();
  const data = await req.json();
  const updated = await Client.findByIdAndUpdate(params.id, data, { new: true });
  if (!updated) return new Response('Client not found', { status: 404 });
  return NextResponse.json(updated);
}

// DELETE
export async function DELETE(_: Request, context: { params: { id: string } }) {
  const { params } = context;
  await connectDB();
  const deleted = await Client.findByIdAndDelete(params.id);
  if (!deleted) return new Response('Client not found', { status: 404 });
  return NextResponse.json({ message: 'Client deleted successfully' });
}

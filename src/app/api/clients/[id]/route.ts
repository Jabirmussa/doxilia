import { connectDB } from '@/lib/mongodb';
import Client from '@/models/Client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await connectDB();

  const params = await context.params;

  const client = await Client.findById(params.id);
  if (!client) return new Response('Client not found', { status: 404 });
  return NextResponse.json(client);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await connectDB();

  const params = await context.params;

  const data = await req.json();
  const updated = await Client.findByIdAndUpdate(params.id, data, { new: true });
  if (!updated) return new Response('Client not found', { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await connectDB();

  const params = await context.params;

  const deleted = await Client.findByIdAndDelete(params.id);
  if (!deleted) return new Response('Client not found', { status: 404 });
  return NextResponse.json({ message: 'Client deleted successfully' });
}


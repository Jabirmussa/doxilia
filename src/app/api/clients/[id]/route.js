import { connectDB } from '@/lib/mongodb';
import Client from '@/models/Client';

// GET por ID (opcional)
export async function GET(_, { params }) {
  await connectDB();
  const client = await Client.findById(params.id);
  if (!client) return new Response('Client not found', { status: 404 });
  return Response.json(client);
}

// PUT (update)
export async function PUT(req, { params }) {
  await connectDB();
  const data = await req.json();
  const updated = await Client.findByIdAndUpdate(params.id, data, { new: true });
  if (!updated) return new Response('Client not found', { status: 404 });
  return Response.json(updated);
}

// DELETE
export async function DELETE(_, { params }) {
  await connectDB();
  const deleted = await Client.findByIdAndDelete(params.id);
  if (!deleted) return new Response('Client not found', { status: 404 });
  return Response.json({ message: 'Client deleted successfully' });
}

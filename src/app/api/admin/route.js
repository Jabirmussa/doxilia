import { connectDB } from '@/lib/mongodb';
import Admin from '@/models/Admin';

export async function POST(req) {
  await connectDB();

  try {
    const data = await req.json();

    const admin = await Admin.create(data);

    return new Response(JSON.stringify(admin), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

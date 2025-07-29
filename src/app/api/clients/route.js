import { connectDB } from '@/lib/mongodb';
import Client from '@/models/Client';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '6880cc252d82d03f0907a642';

// Pega dados do token do cookie
async function getUserFromToken() {
  const cookieStore = await cookies(); // AGORA com await
  const token = cookieStore.get('token')?.value;

  if (!token) throw new Error('Token não encontrado');

  const decoded = jwt.verify(token, JWT_SECRET);
  return { acc_id: decoded.id, role: decoded.role };
}


// POST: Criar novo cliente
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { acc_id: tokenAccId, role } = await getUserFromToken();

    const acc_id = role === 'admin' ? body.acc_id : tokenAccId;

    if (!acc_id) {
      return new Response(JSON.stringify({ message: 'ID do contador (acc_id) é obrigatório' }), { status: 400 });
    }

    const { name, email, nuit, password } = body;

    if (!name || !email || !nuit || !password) {
      return new Response(JSON.stringify({ message: 'Campos obrigatórios faltando' }), { status: 400 });
    }

    const exists = await Client.findOne({ email });
    if (exists) {
      return new Response(JSON.stringify({ message: 'Este e-mail já está associado a um cliente.' }), {
        status: 409,
      });
    }

    const newClient = await Client.create({ name, email, nuit, password, acc_id });

    return new Response(JSON.stringify(newClient), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error("❌ Erro no POST /clients:", err.message);

    return new Response(JSON.stringify({
      message: err.code === 11000 ? 'Email duplicado' : err.message || 'Erro no servidor',
    }), {
      status: err.code === 11000 ? 409 : 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// GET: Listar clientes
export async function GET() {
  try {
    await connectDB();
    const { acc_id, role } = await getUserFromToken();

    const clients = role === 'admin'
      ? await Client.find()
      : await Client.find({ acc_id });

    return new Response(JSON.stringify(clients), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error("❌ Erro no GET /clients:", err.message);
    return new Response(JSON.stringify({ message: err.message || 'Erro no servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// PUT: Atualizar cliente por ID
export async function PUT(req) {
  try {
    await connectDB();
    const data = await req.json();
    const { acc_id, role } = await getUserFromToken();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return new Response(JSON.stringify({ message: 'ID do cliente é obrigatório' }), { status: 400 });

    const query = role === 'admin' ? { _id: id } : { _id: id, acc_id };
    const updated = await Client.findOneAndUpdate(query, data, { new: true });

    if (!updated) {
      return new Response(JSON.stringify({ message: 'Cliente não encontrado ou acesso negado' }), { status: 404 });
    }

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error("❌ Erro no PUT /clients:", err.message);
    return new Response(JSON.stringify({ message: err.message || 'Erro no servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// DELETE: Deletar cliente por ID
export async function DELETE(req) {
  try {
    await connectDB();
    const { acc_id, role } = await getUserFromToken();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return new Response(JSON.stringify({ message: 'ID do cliente é obrigatório' }), { status: 400 });

    const query = role === 'admin' ? { _id: id } : { _id: id, acc_id };
    const deleted = await Client.findOneAndDelete(query);

    if (!deleted) {
      return new Response(JSON.stringify({ message: 'Cliente não encontrado ou acesso negado' }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: 'Cliente deletado com sucesso' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error("❌ Erro no DELETE /clients:", err.message);
    return new Response(JSON.stringify({ message: err.message || 'Erro no servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

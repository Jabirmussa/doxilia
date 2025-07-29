import { connectDB } from '@/lib/mongodb';
import Accountant from '@/models/Accountant';

export async function GET() {
  await connectDB();

  try {
    const accountants = await Accountant.find();
    return new Response(JSON.stringify(accountants), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

export async function POST(req) {
  await connectDB();

  try {
    const data = await req.json();

    if (data.login) {
      const { name, password } = data;
      if (!name || !password) {
        return new Response(JSON.stringify({ error: 'Name and password required' }), { status: 400 });
      }

      const accountant = await Accountant.findOne({ name });
      if (!accountant) {
        return new Response(JSON.stringify({ error: 'Accountant not found' }), { status: 404 });
      }
      const existing = await Accountant.findOne({ email });
      if (existing) {
        return Response.json({ message: "Email já cadastrado" }, { status: 400 });
      }


      const isMatch = await accountant.comparePassword(password);
      if (!isMatch) {
        return new Response(JSON.stringify({ error: 'Invalid password' }), { status: 401 });
      }

      const { _id, name: acctName, nuit } = accountant;
      return new Response(JSON.stringify({ _id, name: acctName, nuit }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      const { name, password, nuit } = data;

      if (!name || !password || !nuit) {
        return new Response(JSON.stringify({ error: 'Name, password and nuit are required' }), { status: 400 });
      }

      const exists = await Accountant.findOne({ name });
      if (exists) {
        return new Response(JSON.stringify({ error: 'Accountant already exists' }), { status: 409 });
      }

      const newAccountant = await Accountant.create(data);
      const { _id, name: acctName, nuit: acctNuit } = newAccountant;

      return new Response(JSON.stringify({ _id, name: acctName, nuit: acctNuit }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PUT(req) {
  await connectDB();

  try {
    const data = await req.json();
    const { _id, ...updateData } = data;

    if (!_id) {
      return new Response(JSON.stringify({ error: 'Accountant ID is required for update' }), {
        status: 400,
      });
    }

    const updated = await Accountant.findByIdAndUpdate(_id, updateData, { new: true });

    if (!updated) {
      return new Response(JSON.stringify({ error: 'Accountant not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(updated), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

export async function DELETE(req) {
  await connectDB();

  try {
    const { _id } = await req.json();

    if (!_id) {
      return new Response(JSON.stringify({ error: 'Accountant ID is required for deletion' }), {
        status: 400,
      });
    }

    const deleted = await Accountant.findByIdAndDelete(_id);

    if (!deleted) {
      return new Response(JSON.stringify({ error: 'Accountant not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: 'Accountant deleted' }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

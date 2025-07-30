import { connectDB } from '@/lib/mongodb';
import Task from '@/models/Task';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request) {
  await connectDB();

  try {
    const formData = await req.formData();

    const status = formData.get('status');
    const client_id = formData.get('client_id');
    const accountant_id = formData.get('accountant_id');
    const amount = parseFloat(formData.get('amount') as string);
    const period = formData.get('period');
    const due_date = formData.get('due_date');
    const what = formData.get('what');
    const who = formData.get('who');
    const payment_id = formData.get('payment_id') || '';

    const guideFile = formData.get('guide') as File | null;
    const uploadFile = formData.get('upload') as File | null;

    if (
      !status || !client_id || !accountant_id || isNaN(amount) ||
      !period || !due_date || !what || !who
    ) {
      return NextResponse.json({
        message: 'Campos obrigatórios em falta!',
      }, { status: 400 });
    }

    const saveFile = async (file: File): Promise<string> => {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const uploadPath = path.join(process.cwd(), 'public', 'uploads');

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      const filePath = path.join(uploadPath, filename);
      fs.writeFileSync(filePath, buffer);

      return `/uploads/${filename}`;
    };

    const guideUrl = guideFile ? await saveFile(guideFile) : '';
    const uploadUrl = uploadFile ? await saveFile(uploadFile) : '';

    const newTask = new Task({
      status,
      client_id,
      accountant_id,
      amount,
      period,
      due_date,
      what,
      who,
      payment_id,
      guide: guideUrl,
      upload: uploadUrl,
    });

    await newTask.save();

    return NextResponse.json({ message: 'Task created successfully!', task: newTask });
  } catch (err) {
    console.error('Error creating task:', err);
    return NextResponse.json({
      message: 'Internal error creating task.',
    }, { status: 500 });
  }
}


// GET - Buscar tasks (pode filtrar por id via query param ?id=xxx)
export async function GET(req: Request) {
  await connectDB();

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (id) {
      // Buscar task específica
      const task = await Task.findById(id);
      if (!task) {
        return NextResponse.json({ message: 'Task not found.' }, { status: 404 });
      }
      return NextResponse.json(task);
    } else {
      // Buscar todas as tasks
      const tasks = await Task.find();
      return NextResponse.json({ tasks });
    }
  } catch (err) {
    console.error('Error fetching tasks:', err);
    return NextResponse.json({ message: 'Internal error while fetching tasks.' }, { status: 500 });
  }
}

// DELETE - Deletar task pelo id enviado no query param ?id=xxx
export async function DELETE(req: Request) {
  await connectDB();

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Mandatory Task ID.' }, { status: 400 });
    }

    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return NextResponse.json({ message: 'Task not found.' }, { status: 404 });
    }

    if(task.guide) fs.unlinkSync(path.join(process.cwd(), 'public', task.guide));

    return NextResponse.json({ message: 'Task deleted successfully!' });
  } catch (err) {
    console.error('Error deleting task:', err);
    return NextResponse.json({ message: 'Internal error while deleting task.' }, { status: 500 });
  }
}

// PUT - Atualizar task 
export async function PUT(req: Request) {
  await connectDB();

  try {
    const body = await req.json();

    const {
      id,
      status,
      client_id,
      accountant_id,
      amount,
      period,
      due_date,
      what,
      who,
      payment_id,
      guide,
      upload,
    } = body;

    if (!id) {
      return NextResponse.json({ message: 'Task ID required for update.' }, { status: 400 });
    }

    const task = await Task.findById(id);
    if (!task) {
      return NextResponse.json({ message: 'Task not founded' }, { status: 404 });
    }

    if (status) task.status = status;
    if (client_id) task.client_id = client_id;
    if (accountant_id) task.accountant_id = accountant_id;
    if (amount !== undefined) task.amount = amount;
    if (period) task.period = period;
    if (due_date) task.due_date = due_date;
    if (what) task.what = what;
    if (who) task.who = who;
    if (payment_id) task.payment_id = payment_id;
    if (guide) task.guide = guide;
    if (upload) task.upload = upload;

    await task.save();

    return NextResponse.json({ message: 'Task updated successfully!', task });
  } catch (err) {
    console.error('Error updating task:', err);
    return NextResponse.json({ message: 'Internal error while updating task.' }, { status: 500 });
  }
}
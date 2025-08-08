import { connectDB } from '@/lib/mongodb';
import File from '@/models/File';
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

    const file = formData.get('file') as File | null;
    const description = formData.get('description') as string | null;
    const client_id = formData.get('client_id') as string | null;

    if (!file || !client_id) {
      return NextResponse.json(
        { message: 'Campos obrigatórios: file e client_id' },
        { status: 400 }
      );
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

    const fileUrl = await saveFile(file);

    const newFile = new File({
      url: fileUrl,
      description: description || "",
      client_id,
    });

    await newFile.save();

    return NextResponse.json({ message: 'File created successfully!', file: newFile });
  } catch (err) {
    console.error('Error creating file:', err);
    return NextResponse.json({ message: 'Internal error creating file.' }, { status: 500 });
  }
}


export async function GET() {
  try {
    await connectDB();

    const files = await File.find({}).lean();

    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json({ message: 'Error fetching files' }, { status: 500 });
  }
}
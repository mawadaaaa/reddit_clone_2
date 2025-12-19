import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ message: 'No file received.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = Date.now() + '-' + file.name.replaceAll(" ", "_");

    // Ensure we are writing to the public/uploads directory
    // Note: In local dev, writing to public works. In Vercel, this won't persist, 
    // but the user's requirements imply local dev/persistent storage is assumed or cloud storage comes later.
    // Given the constraints, we write to the local filesystem.
    const uploadDir = path.join(process.cwd(), 'public/uploads');

    try {
      await writeFile(path.join(uploadDir, filename), buffer);
    } catch (err) {
      console.error("Error writing file:", err);
      return NextResponse.json({ message: 'Failed to save file.' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Upload successful',
      url: `/uploads/${filename}`
    }, { status: 201 });

  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

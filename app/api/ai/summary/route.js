import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { content } = await req.json();

        // In a real app, call OpenAI or Gemini API here.
        // For this project, we'll mock the summary.

        const summary = `AI Summary: This post discusses the following key points: \n1. Main topic extracted from content nearby "${content.substring(0, 20)}..."\n2. The user is asking/sharing information about the topic.\n3. The sentiment appears to be neutral/positive.`;

        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        return NextResponse.json({ summary });
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

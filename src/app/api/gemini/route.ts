import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const topic = searchParams.get('topic');

  if (!topic) {
    return NextResponse.json(
      { error: 'Missing "topic" query parameter' },
      { status: 400 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY not found in env' },
      { status: 500 }
    );
  }

  const ai = new GoogleGenAI({ apiKey });
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });


  const prompt =`Please provide detailed, structured notes covering the entire topic of ${topic} from start to finish. Include major concepts, important subtopics, definitions, explanations, and examples where applicable. Make the notes clear and organized for easy understanding and revision`;

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    const notes = result.text;
    return NextResponse.json({ notes });
  } catch (error) {
    console.error('[Gemini Error]', error);
    return NextResponse.json(
      { error: 'Failed to generate notes' },
      { status: 500 }
    );
  }
}

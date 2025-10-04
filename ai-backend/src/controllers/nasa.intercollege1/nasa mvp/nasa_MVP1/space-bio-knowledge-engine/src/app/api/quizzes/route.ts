import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongo';
import Publication from '@/lib/models/Publication';
import Quiz from '@/lib/models/Quiz';
import { generateMCQs } from '@/lib/quiz';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    try {
      await connectToDatabase();
    } catch {}
    const body = await req.json();
    const ids: string[] = body.publicationIds || [];
    const title: string = body.title || 'Auto Quiz';
    if (!ids.length) return NextResponse.json({ error: 'publicationIds required' }, { status: 400 });
    let context = '';
    try {
      const pubs = await Publication.find({ _id: { $in: ids } }, { title: 1, summary: 1 }).lean();
      context = pubs.map((p: any) => `${p.title}\n${p.summary}`).join('\n\n');
    } catch {
      context = title;
    }
    const questions = await generateMCQs(title, context, 5);
    try {
      const quiz = await Quiz.create({ title, publicationIds: ids, questions });
      return NextResponse.json({ item: quiz });
    } catch {
      return NextResponse.json({ item: { _id: 'ephemeral', title, questions }, warning: 'Saved ephemerally (DB unavailable)' });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to generate quiz' }, { status: 200 });
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    const quizzes = await Quiz.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ items: quizzes });
  } catch (e: any) {
    return NextResponse.json({ items: [], warning: 'DB unavailable', error: e?.message }, { status: 200 });
  }
}

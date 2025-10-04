import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongo';
import Publication from '@/lib/models/Publication';
import pdf from 'pdf-parse';
import { summarizeAndExtract } from '@/lib/summarize';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const sortBy = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    const limit = Number(searchParams.get('limit') || '50');

    let cursor = Publication.find({});

    if (q) {
      cursor = Publication.find({ $text: { $search: q } }, { score: { $meta: 'textScore' } }).sort({
        score: { $meta: 'textScore' },
      });
    } else {
      const sortMap: any = {
        year: { year: order === 'desc' ? -1 : 1 },
        author: { 'authors.0': order === 'desc' ? -1 : 1 },
        institution: { institution: order === 'desc' ? -1 : 1 },
        alphabetical: { title: order === 'desc' ? -1 : 1 },
        createdAt: { createdAt: order === 'desc' ? -1 : 1 },
        relevance: { createdAt: -1 },
      };
      cursor = cursor.sort(sortMap[sortBy] || sortMap.createdAt);
    }
    const items = await cursor.limit(limit).lean();
    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ items: [], error: e?.message || 'Failed to list publications' }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
  } catch {}
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    const createdBy = (form.get('createdBy') as string) || 'anonymous';
    if (!file) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }
    const ab = await file.arrayBuffer();
    const buf = Buffer.from(ab);
    const data = await pdf(buf).catch(() => ({ text: '' as string }));
    const text = (data as any).text || '';
    const meta = await summarizeAndExtract(text);

    // Try DB persist, else return ephemeral item
    try {
      const doc = await Publication.create({
        title: (text.split('\n').find(Boolean) || 'Untitled').slice(0, 180),
        authors: meta.authors,
        year: meta.year,
        institution: meta.institution,
        source: 'upload',
        url: undefined,
        summary: meta.summary,
        extractedKeywords: meta.extractedKeywords,
        rawTextLength: text.length,
        createdBy,
      });
      return NextResponse.json({ item: doc });
    } catch {
      const item = {
        _id: 'ephemeral',
        title: (text.split('\n').find(Boolean) || 'Untitled').slice(0, 180),
        authors: meta.authors,
        year: meta.year,
        institution: meta.institution,
        source: 'upload',
        url: undefined,
        summary: meta.summary,
        extractedKeywords: meta.extractedKeywords,
        rawTextLength: text.length,
        createdBy,
      };
      return NextResponse.json({ item, warning: 'Saved ephemerally (DB unavailable)' });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to process PDF' }, { status: 200 });
  }
}

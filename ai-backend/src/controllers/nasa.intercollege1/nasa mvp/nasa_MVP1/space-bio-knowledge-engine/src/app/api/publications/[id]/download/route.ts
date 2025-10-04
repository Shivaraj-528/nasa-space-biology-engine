import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongo';
import Publication from '@/lib/models/Publication';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const doc = await Publication.findById(params.id).lean();
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ item: doc });
  } catch (e: any) {
    return NextResponse.json({ error: 'Unavailable', detail: e?.message }, { status: 200 });
  }
}

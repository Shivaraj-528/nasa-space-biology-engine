import { NextResponse } from 'next/server';
import { buildGraph } from '@/lib/graph';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const g = await buildGraph();
    return NextResponse.json(g);
  } catch (e: any) {
    return NextResponse.json({ nodes: [], links: [], warning: 'DB unavailable', error: e?.message }, { status: 200 });
  }
}

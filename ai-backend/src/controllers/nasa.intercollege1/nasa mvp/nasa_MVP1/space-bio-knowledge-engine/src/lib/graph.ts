import Publication from './models/Publication';
import { connectToDatabase } from './mongo';

export async function buildGraph() {
  await connectToDatabase();
  const pubs = await Publication.find({}, { title: 1, extractedKeywords: 1 }).lean();
  const nodes: any[] = [];
  const links: any[] = [];
  const nodeIndex = new Map<string, number>();

  function addNode(id: string, type: string, label: string) {
    if (nodeIndex.has(id)) return nodeIndex.get(id)!;
    const idx = nodes.length;
    nodes.push({ id, type, label });
    nodeIndex.set(id, idx);
    return idx;
  }

  for (const p of pubs) {
    const pid = String((p as any)._id);
    addNode(pid, 'publication', (p as any).title || 'Publication');
    for (const k of (p as any).extractedKeywords || []) {
      const kid = `kw:${String(k).toLowerCase()}`;
      addNode(kid, 'keyword', String(k));
      links.push({ source: pid, target: kid });
    }
  }
  return { nodes, links };
}

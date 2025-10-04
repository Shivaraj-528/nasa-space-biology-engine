"use client";

import { useEffect, useState } from 'react';
import KnowledgeGraph from '@/components/KnowledgeGraph';

export default function GraphsPage() {
  const [data, setData] = useState<{ nodes: any[]; links: any[] }>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/graphs');
    const j = await res.json();
    setData(j);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <section className="card space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Knowledge Graph</h2>
          <button className="btn" onClick={load} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
        <KnowledgeGraph nodes={data.nodes} links={data.links} />
      </section>
    </div>
  );
}

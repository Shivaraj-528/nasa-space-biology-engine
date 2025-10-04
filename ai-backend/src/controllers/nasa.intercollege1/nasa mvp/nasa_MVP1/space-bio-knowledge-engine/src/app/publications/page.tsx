"use client";

import { useEffect, useState } from 'react';

export default function PublicationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  async function refresh() {
    setLoading(true);
    const params = new URLSearchParams({ sort, order });
    if (q) params.set('q', q);
    const res = await fetch(`/api/publications?${params.toString()}`);
    const j = await res.json();
    setItems(j.items || []);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    await fetch('/api/publications', { method: 'POST', body: fd });
    setLoading(false);
    (e.currentTarget as any).reset();
    refresh();
  }

  return (
    <div className="space-y-6">
      <section className="card">
        <h2 className="text-xl font-semibold mb-2">Upload Publication PDF</h2>
        <form onSubmit={onUpload} className="flex flex-col sm:flex-row items-center gap-3">
          <input className="input" type="file" name="file" accept="application/pdf" required />
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Processing…' : 'Upload & Summarize'}
          </button>
        </form>
      </section>

      <section className="card space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <input className="input max-w-sm" placeholder="Search text (relevance)" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="input max-w-xs" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="relevance">Relevance (when searching)</option>
            <option value="year">Year</option>
            <option value="author">First Author</option>
            <option value="institution">Institution</option>
            <option value="alphabetical">Alphabetical</option>
            <option value="createdAt">Recently Added</option>
          </select>
          <select className="input max-w-[120px]" value={order} onChange={(e) => setOrder(e.target.value)}>
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
          <button className="btn" onClick={refresh}>Apply</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((p) => (
            <article key={p._id} className="card">
              <h3 className="text-lg font-semibold">{p.title}</h3>
              <p className="text-sm text-slate-400">{(p.authors || []).join(', ')} {p.year ? `• ${p.year}` : ''} {p.institution ? `• ${p.institution}` : ''}</p>
              <p className="mt-2 text-slate-300 line-clamp-4">{p.summary}</p>
              <div className="mt-3 flex gap-2 flex-wrap">
                {(p.extractedKeywords || []).slice(0, 8).map((k: string) => (
                  <span key={k} className="px-2 py-1 rounded bg-slate-800/60 text-slate-300 text-xs">
                    {k}
                  </span>
                ))}
              </div>
              <div className="mt-3">
                <a className="link text-sm" href={`/api/publications/${p._id}/download`} target="_blank" rel="noreferrer">
                  Download processed JSON
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

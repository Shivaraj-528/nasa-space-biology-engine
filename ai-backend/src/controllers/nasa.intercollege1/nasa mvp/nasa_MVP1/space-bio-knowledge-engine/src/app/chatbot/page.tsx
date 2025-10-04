"use client";

import { useState } from 'react';

const roles = ['student', 'teacher', 'researcher', 'scientist'] as const;
const sourceList = ['nasa', 'arxiv', 'pubmed', 'crossref'] as const;

export default function ChatbotPage() {
  const [question, setQuestion] = useState('How does microgravity affect gene expression in plants?');
  const [role, setRole] = useState<typeof roles[number]>('student');
  const [sources, setSources] = useState<string[]>(['nasa', 'arxiv', 'pubmed', 'crossref']);
  const [urls, setUrls] = useState('');
  const [answer, setAnswer] = useState('');
  const [refs, setRefs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  function toggleSource(s: string) {
    setSources((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  async function ask() {
    setLoading(true);
    setAnswer('');
    setRefs([]);
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, role, sources, urls: urls.split(/\s+/).filter(Boolean) }),
    });
    const j = await res.json();
    setAnswer(j.answer);
    setRefs(j.references || []);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <section className="card space-y-3">
        <h2 className="text-xl font-semibold">Role-aware Chatbot</h2>
        <textarea className="input min-h-[100px]" value={question} onChange={(e) => setQuestion(e.target.value)} />
        <div className="flex flex-wrap items-center gap-3">
          <select className="input max-w-xs" value={role} onChange={(e) => setRole(e.target.value as any)}>
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-3">
            {sourceList.map((s) => (
              <label key={s} className="flex items-center gap-1 text-sm">
                <input type="checkbox" checked={sources.includes(s)} onChange={() => toggleSource(s)} /> {s}
              </label>
            ))}
            <label className="flex items-center gap-1 text-sm">
              <input type="checkbox" checked={urls.trim().length > 0} onChange={(e) => !e.target.checked && setUrls('')} /> URL(s)
            </label>
          </div>
        </div>
        <input className="input" placeholder="Paste URLs separated by space (optional)" value={urls} onChange={(e) => setUrls(e.target.value)} />
        <button className="btn" onClick={ask} disabled={loading}>
          {loading ? 'Thinking…' : 'Ask'}
        </button>
      </section>

      {answer && (
        <section className="card space-y-3">
          <h3 className="text-lg font-semibold">Answer</h3>
          <div className="prose prose-invert max-w-none">
            <pre className="whitespace-pre-wrap">{answer}</pre>
          </div>
          <div>
            <h4 className="font-semibold mb-2">References</h4>
            <ul className="list-disc pl-6 text-slate-300">
              {refs.map((r) => (
                <li key={r.index}>
                  [{r.index}] <a className="link" href={r.url} target="_blank" rel="noreferrer">{r.title}</a> <span className="text-xs">({r.source})</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}

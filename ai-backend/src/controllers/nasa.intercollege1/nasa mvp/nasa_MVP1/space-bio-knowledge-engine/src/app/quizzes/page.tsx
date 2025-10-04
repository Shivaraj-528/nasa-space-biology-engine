"use client";

import { useEffect, useState } from 'react';

type Pub = { _id: string; title: string; summary?: string };

type Quiz = {
  _id: string;
  title: string;
  questions: { question: string; options: string[]; answerIndex: number; explanation?: string }[];
  createdAt: string;
};

export default function QuizzesPage() {
  const [pubs, setPubs] = useState<Pub[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [title, setTitle] = useState('Space Biology Quiz');
  const [loading, setLoading] = useState(false);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  async function loadPubs() {
    const res = await fetch('/api/publications?limit=50&sort=createdAt&order=desc');
    const j = await res.json();
    setPubs(j.items || []);
  }

  async function loadQuizzes() {
    const res = await fetch('/api/quizzes');
    const j = await res.json();
    setQuizzes(j.items || []);
  }

  useEffect(() => {
    loadPubs();
    loadQuizzes();
  }, []);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function generate() {
    if (!selected.length) return;
    setLoading(true);
    const res = await fetch('/api/quizzes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, publicationIds: selected }),
    });
    const j = await res.json();
    setLoading(false);
    setSelected([]);
    setTitle('Space Biology Quiz');
    await loadQuizzes();
  }

  return (
    <div className="space-y-6">
      <section className="card space-y-3">
        <h2 className="text-xl font-semibold">Generate Quiz</h2>
        <input className="input" placeholder="Quiz title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="max-h-64 overflow-auto border border-slate-700/60 rounded p-2">
          {pubs.map((p) => (
            <label key={p._id} className="flex items-start gap-2 py-2">
              <input type="checkbox" checked={selected.includes(p._id)} onChange={() => toggle(p._id)} />
              <div>
                <div className="font-medium">{p.title}</div>
                <div className="text-xs text-slate-400 line-clamp-2">{p.summary}</div>
              </div>
            </label>
          ))}
        </div>
        <button className="btn" disabled={loading || selected.length === 0} onClick={generate}>
          {loading ? 'Generating…' : `Generate (${selected.length})`}
        </button>
      </section>

      <section className="card space-y-4">
        <h3 className="text-lg font-semibold">Recent Quizzes</h3>
        {quizzes.length === 0 && <p className="text-slate-400">No quizzes yet.</p>}
        {quizzes.map((q) => (
          <article key={q._id} className="border-t border-slate-700/50 pt-4">
            <h4 className="font-semibold">{q.title}</h4>
            <ol className="list-decimal pl-6 space-y-3 mt-2">
              {q.questions.map((qq, i) => (
                <li key={i}>
                  <div className="font-medium">{qq.question}</div>
                  <ul className="mt-1 space-y-1">
                    {qq.options.map((opt, oi) => (
                      <li key={oi} className={`text-sm ${oi === qq.answerIndex ? 'text-space-neon' : 'text-slate-300'}`}>
                        {String.fromCharCode(65 + oi)}. {opt}
                      </li>
                    ))}
                  </ul>
                  {qq.explanation && <div className="mt-1 text-xs text-slate-400">Explanation: {qq.explanation}</div>}
                </li>
              ))}
            </ol>
          </article>
        ))}
      </section>
    </div>
  );
}

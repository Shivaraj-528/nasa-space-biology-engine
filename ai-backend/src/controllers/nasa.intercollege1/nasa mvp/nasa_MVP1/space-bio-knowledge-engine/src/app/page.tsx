export default function HomePage() {
  return (
    <div className="space-y-6">
      <section className="card">
        <h1 className="text-3xl font-bold text-space-light">Space Biology Knowledge Engine</h1>
        <p className="mt-2 text-slate-300">
          Discover publications, visualize knowledge graphs, chat with a role-aware assistant, and generate quizzes to learn faster.
        </p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <a href="/publications" className="card hover:shadow-glow">
            <h3 className="text-lg font-semibold">Publications</h3>
            <p className="text-sm text-slate-400">Upload PDFs, auto-extract metadata, and sort.</p>
          </a>
          <a href="/chatbot" className="card hover:shadow-glow">
            <h3 className="text-lg font-semibold">Chatbot</h3>
            <p className="text-sm text-slate-400">RAG over NASA, ArXiv, PubMed, CrossRef with role-aware explanations.</p>
          </a>
          <a href="/graphs" className="card hover:shadow-glow">
            <h3 className="text-lg font-semibold">Graphs</h3>
            <p className="text-sm text-slate-400">Interactive knowledge graphs of genes, experiments, conditions.</p>
          </a>
          <a href="/quizzes" className="card hover:shadow-glow">
            <h3 className="text-lg font-semibold">Quizzes</h3>
            <p className="text-sm text-slate-400">Auto-generate MCQs with feedback from selected publications.</p>
          </a>
        </div>
      </section>
    </div>
  );
}

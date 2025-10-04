# 🚀 Space Biology Knowledge Engine (MVP)

RAG-powered full-stack SaaS MVP for exploring space biology publications, building interactive knowledge graphs, chatting with role-aware explanations, and generating quizzes.

## Tech Stack
- Frontend: Next.js 14 (App Router), React 18, TailwindCSS, D3
- Backend: Next.js API Routes (Edge-ready), TypeScript
- Database: MongoDB (Mongoose)
- Auth: NextAuth (Google OAuth + Guest)
- AI: OpenRouter API (GPT/Claude/etc.)

## Quick Start
1. Install deps
```bash
pnpm i # or npm i / yarn
```
2. Configure environment
```bash
cp .env.local.example .env.local
# Fill OPENROUTER_API_KEY, MongoDB, Google OAuth, NEXTAUTH_SECRET
```
3. Run dev
```bash
pnpm dev
```

## Features
- Google OAuth or Guest login
- Upload PDFs → AI summary + metadata extraction
- Publications list with sorting (year, author, institution, alphabetical)
- Role-aware Chatbot (Student/Teacher/Researcher/Scientist) using RAG over NASA/ArXiv/PubMed/CrossRef and optional URLs
- Interactive knowledge graph (D3 force layout)
- Auto-generated MCQ quizzes with feedback

## Deployment
- Vercel: set env vars (see `.env.local.example`)
- MongoDB Atlas: create a free cluster and set `MONGODB_URI`

## Security Notes
- Do not commit `.env.local`
- OpenRouter requires `HTTP-Referer` header; we set a default to localhost

## License
MIT

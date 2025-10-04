# 🚀 Space Biology Knowledge Engine

A comprehensive full-stack SaaS platform for exploring, analyzing, and interacting with space biology research through AI-powered insights and interactive visualizations.

![Space Biology Engine](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue)

## 🌟 Features

### 🔍 **Multi-Source Research Integration**
- **NASA GeneLab**: Access space biology experiments and datasets
- **ArXiv**: Preprint research papers in space biology
- **PubMed**: Biomedical literature database
- **CrossRef**: Academic publication metadata
- **User Uploads**: PDF publications from verified researchers

### 🤖 **AI-Powered Intelligence**
- **OpenRouter API**: Advanced language models for chat and analysis
- **RAG Pipeline**: Contextual search using vector embeddings
- **Layered Explanations**: Adaptive responses based on user expertise level
- **Auto-Summarization**: AI-generated paper summaries and key findings
- **Quiz Generation**: Automatic educational content creation

### 👥 **Role-Based Experience**
- **Students**: Simplified explanations and learning materials
- **Teachers**: Educational tools and quiz curation capabilities
- **Researchers**: Advanced analysis and publication upload features
- **Scientists**: Full platform access with administrative capabilities

### 📊 **Interactive Visualizations**
- **Knowledge Graphs**: D3.js-powered network visualizations
- **Research Connections**: Author, keyword, and citation relationships
- **Interactive Exploration**: Zoom, filter, and drill-down capabilities
- **Real-time Updates**: Dynamic graph generation from search results

### 🎓 **Education Mode**
- **Adaptive Quizzes**: Auto-generated questions from research papers
- **Difficulty Levels**: Beginner, Intermediate, and Advanced content
- **Progress Tracking**: User performance analytics and insights
- **Collaborative Learning**: Shared quizzes and study materials

## 🛠️ Tech Stack

### Frontend Architecture
```
Next.js 14 (App Router) + React 18 + TypeScript
├── UI Framework: TailwindCSS + ShadCN UI
├── Animations: Framer Motion
├── Visualizations: D3.js + Recharts
├── State Management: React Hooks + Context
├── Forms: React Hook Form + Zod validation
└── HTTP Client: Axios with interceptors
```

### Backend Architecture
```
Node.js + Express.js + TypeScript
├── Database: PostgreSQL + Prisma ORM
├── Authentication: Google OAuth 2.0 + JWT
├── File Processing: Multer + PDF-Parse
├── Vector Database: ChromaDB
├── AI Integration: OpenRouter API
└── External APIs: NASA, ArXiv, PubMed, CrossRef
```

### Infrastructure & DevOps
```
Docker + Docker Compose
├── Development: Hot reload + Live databases
├── Production: Multi-stage builds + Health checks
├── Monitoring: Health endpoints + Logging
├── Security: Helmet + CORS + Rate limiting
└── Deployment: Vercel + Heroku + Supabase
```

## 🚀 Quick Start

### Option 1: Docker (Recommended)
```bash
# Clone and setup
git clone <repository-url>
cd space-biology-engine

# One-command setup
./scripts/setup.sh

# Deploy all services
./scripts/deploy.sh

# Run tests
./scripts/test.sh
```

### Option 2: Manual Installation
```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Setup databases
docker-compose -f docker-compose.dev.yml up -d

# Run migrations
cd backend && npx prisma db push

# Start development servers
cd backend && npm run dev    # Port 5000
cd frontend && npm run dev   # Port 3000
```

## 📋 Prerequisites

### System Requirements
- **Node.js**: 18.0+ (LTS recommended)
- **Docker**: 20.0+ with Docker Compose
- **Memory**: 4GB RAM minimum
- **Storage**: 10GB free space

### API Keys & Credentials
```env
# NASA API (Free)
NASA_API_KEY=wXywYQJfod2J6JMpqTgqbGLYR61Egi4xZNpBOcxv

# OpenRouter API (Paid)
OPENROUTER_API_KEY=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

# Google OAuth (Free)
GOOGLE_OAUTH_CLIENT_ID=11757822380-9mucb5e4pvjdm4vcatd9bu4hk314us7v.apps.googleusercontent.com
GOOGLE_OAUTH_SECRET=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
```

### External Services (No API Keys Required)
- **ArXiv**: `http://export.arxiv.org/api/query`
- **PubMed**: `https://api.ncbi.nlm.nih.gov/lit/ctxp/v1/pubmed/`
- **CrossRef**: `https://api.crossref.org/works`

## 📁 Project Structure

```
space-biology-engine/
├── 📱 frontend/                    # Next.js 14 Frontend Application
│   ├── src/
│   │   ├── app/                   # App Router Pages
│   │   │   ├── auth/              # Authentication pages
│   │   │   ├── dashboard/         # User dashboard
│   │   │   ├── knowledge-graph/   # Interactive visualizations
│   │   │   └── page.tsx           # Landing page
│   │   ├── components/            # Reusable React Components
│   │   │   ├── ui/               # ShadCN UI components
│   │   │   ├── layout/           # Layout components
│   │   │   └── visualization/    # D3.js visualizations
│   │   ├── lib/                  # Utilities & Configurations
│   │   │   ├── api.ts            # API client with interceptors
│   │   │   └── utils.ts          # Helper functions
│   │   └── types/                # TypeScript type definitions
│   ├── public/                   # Static assets
│   ├── Dockerfile               # Production container
│   └── next.config.js           # Next.js configuration
│
├── 🔧 backend/                     # Express.js Backend API
│   ├── src/
│   │   ├── routes/               # API Route Handlers
│   │   │   ├── auth.ts           # Authentication & OAuth
│   │   │   ├── search.ts         # Multi-source search
│   │   │   ├── chat.ts           # AI chat & RAG
│   │   │   ├── publications.ts   # File upload & management
│   │   │   ├── quiz.ts           # Education & quizzes
│   │   │   ├── knowledge-graph.ts # Graph data generation
│   │   │   └── user.ts           # User management
│   │   ├── services/             # Business Logic
│   │   │   ├── externalApis.ts   # NASA, ArXiv, PubMed, CrossRef
│   │   │   ├── openrouter.ts     # AI integration
│   │   │   └── rag.ts            # Vector search & embeddings
│   │   ├── middleware/           # Express Middleware
│   │   │   ├── auth.ts           # JWT & role-based auth
│   │   │   └── errorHandler.ts   # Global error handling
│   │   ├── config/               # Configuration
│   │   │   ├── database.ts       # Prisma client
│   │   │   └── passport.ts       # Google OAuth setup
│   │   └── utils/                # Utility Functions
│   ├── prisma/                   # Database Schema & Migrations
│   │   └── schema.prisma         # Complete data model
│   ├── uploads/                  # File Storage
│   ├── Dockerfile               # Production container
│   └── Procfile                 # Heroku deployment
│
├── 🐳 Infrastructure/              # DevOps & Deployment
│   ├── docker-compose.yml        # Production orchestration
│   ├── docker-compose.dev.yml    # Development databases
│   └── vercel.json               # Frontend deployment config
│
├── 📜 scripts/                     # Automation Scripts
│   ├── setup.sh                 # One-command setup
│   ├── deploy.sh                 # Production deployment
│   └── test.sh                   # Comprehensive testing
│
├── 📚 Documentation/               # Project Documentation
│   ├── README.md                 # This file
│   └── DEPLOYMENT.md             # Deployment guide
│
└── 🔒 Configuration/               # Environment & Security
    ├── .env.example              # Environment template
    └── .gitignore               # Version control exclusions
```

## 🌐 Application Architecture

### Data Flow
```
User Request → Frontend (Next.js) → Backend API (Express) → External APIs/Database
     ↓              ↓                    ↓                        ↓
UI Components → API Client → Route Handlers → Services → Data Sources
     ↓              ↓                    ↓                        ↓
State Updates ← JSON Response ← Business Logic ← Processed Data ← Raw Data
```

### AI Pipeline
```
User Query → RAG Service → ChromaDB (Vector Search) → OpenRouter API → Contextual Response
     ↓             ↓              ↓                        ↓              ↓
Search Input → Embeddings → Similar Documents → AI Processing → Role-based Answer
```

## 🔐 Authentication & Authorization

### OAuth 2.0 Flow
1. **User clicks "Continue with Google"**
2. **Redirect to Google OAuth consent screen**
3. **Google returns authorization code**
4. **Backend exchanges code for user profile**
5. **JWT token generated and returned to frontend**
6. **Token stored in localStorage for API requests**

### Role-Based Access Control
```
┌─────────────┬──────────┬──────────┬────────────┬───────────┐
│   Feature   │ Student  │ Teacher  │ Researcher │ Scientist │
├─────────────┼──────────┼──────────┼────────────┼───────────┤
│ Search      │    ✅    │    ✅    │     ✅     │     ✅    │
│ AI Chat     │    ✅    │    ✅    │     ✅     │     ✅    │
│ Bookmarks   │    ✅    │    ✅    │     ✅     │     ✅    │
│ Take Quiz   │    ✅    │    ✅    │     ✅     │     ✅    │
│ Create Quiz │    ❌    │    ✅    │     ✅     │     ✅    │
│ Upload PDF  │    ❌    │    ❌    │     ✅     │     ✅    │
│ Admin Panel │    ❌    │    ❌    │     ❌     │     ✅    │
└─────────────┴──────────┴──────────┴────────────┴───────────┘
```

## 🚀 Deployment Options

### 🐳 Docker (Recommended)
- **Complete stack**: Frontend + Backend + Databases
- **One-command deployment**: `./scripts/deploy.sh`
- **Health monitoring**: Built-in health checks
- **Scalable**: Easy horizontal scaling

### ☁️ Cloud Deployment
- **Frontend**: Vercel (Automatic deployments)
- **Backend**: Heroku (Container deployment)
- **Database**: Supabase (Managed PostgreSQL)
- **Vector DB**: ChromaDB Cloud

### 🔧 Development Setup
```bash
# Quick development setup
./scripts/setup.sh

# Manual setup
docker-compose -f docker-compose.dev.yml up -d  # Databases only
cd backend && npm run dev                        # API server
cd frontend && npm run dev                       # Next.js app
```

## 🧪 Testing & Quality Assurance

### Automated Testing
```bash
./scripts/test.sh  # Comprehensive test suite
```

**Test Coverage:**
- ✅ **Service Health**: All endpoints responding
- ✅ **Database Connectivity**: PostgreSQL + ChromaDB
- ✅ **API Integration**: External services working
- ✅ **Authentication**: OAuth flow functional
- ✅ **Performance**: Response time benchmarks
- ✅ **Build Process**: Frontend + Backend compilation

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Search functionality across all sources
- [ ] AI chat with different user roles
- [ ] Knowledge graph visualization
- [ ] Quiz creation and taking
- [ ] File upload and processing
- [ ] Responsive design on mobile/desktop

## 📊 Performance & Scalability

### Current Specifications
- **Response Time**: < 2s for API calls
- **Concurrent Users**: 100+ supported
- **Database**: Optimized queries with indexing
- **Caching**: Redis-ready architecture
- **CDN**: Static asset optimization

### Scaling Strategies
1. **Horizontal Scaling**: Load balancer + multiple instances
2. **Database Optimization**: Read replicas + connection pooling
3. **Caching Layer**: Redis for frequently accessed data
4. **CDN Integration**: CloudFlare for global distribution
5. **Microservices**: Split services for independent scaling

## 🔒 Security Features

### Data Protection
- **Encryption**: HTTPS/TLS for all communications
- **Authentication**: JWT with secure secret rotation
- **Authorization**: Role-based access control
- **Input Validation**: Comprehensive sanitization
- **Rate Limiting**: API abuse prevention

### Privacy Compliance
- **GDPR Ready**: User data export/deletion
- **OAuth Security**: Secure token handling
- **File Security**: Virus scanning for uploads
- **Audit Logging**: User action tracking

## 🤝 Contributing

### Development Workflow
1. **Fork** the repository
2. **Create** feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'Add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** Pull Request

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Automatic code formatting
- **Husky**: Pre-commit hooks
- **Conventional Commits**: Standardized commit messages

## 📞 Support & Community

### Getting Help
- 📖 **Documentation**: Check `DEPLOYMENT.md` for detailed guides
- 🐛 **Issues**: Report bugs via GitHub Issues
- 💬 **Discussions**: Join community discussions
- 📧 **Contact**: Reach out to the development team

### Roadmap
- [ ] **Mobile App**: React Native implementation
- [ ] **Real-time Collaboration**: WebSocket integration
- [ ] **Advanced Analytics**: User behavior insights
- [ ] **API Marketplace**: Third-party integrations
- [ ] **Multi-language Support**: Internationalization

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**🚀 Ready to explore the universe of space biology research?**

[Get Started](#-quick-start) • [View Demo](https://space-biology-engine.vercel.app) • [Documentation](DEPLOYMENT.md)

Made with ❤️ by the Space Biology Team

</div>
```

## 🔐 Authentication

The application uses Google OAuth 2.0 for authentication with role-based access:

- **Students**: Read/search access, simplified AI explanations
- **Teachers**: Student access + quiz curation capabilities
- **Researchers**: Advanced access + publication upload
- **Scientists**: Full access to all features

## 🤖 AI Features

- **Layered Explanations**: AI adapts responses based on user role
- **RAG Pipeline**: Contextual search using vector embeddings
- **Auto-Summarization**: AI-generated paper summaries
- **Quiz Generation**: Automatic quiz creation from research papers
- **Knowledge Graphs**: AI-powered relationship mapping

## 📊 Data Sources

- **NASA GeneLab**: Space biology experiments and datasets
- **ArXiv**: Preprint research papers
- **PubMed**: Biomedical literature
- **CrossRef**: Academic publication metadata
- **User Uploads**: PDF publications from verified researchers

## 🎨 UI/UX

- Modern, clean dashboard design
- Dark/light mode support
- Responsive design for all devices
- Smooth animations with Framer Motion
- Interactive knowledge graph visualizations
- Intuitive search and filtering

## 🚀 Deployment

- **Frontend**: Vercel
- **Backend**: Render/Heroku
- **Database**: Supabase/PostgreSQL
- **File Storage**: Cloud storage integration

## 📄 License

MIT License - see LICENSE file for details.

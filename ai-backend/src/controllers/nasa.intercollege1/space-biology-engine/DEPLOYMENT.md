# Deployment Guide

This guide covers different deployment options for the Space Biology Knowledge Engine.

## 🐳 Docker Deployment (Recommended)

### Prerequisites
- Docker and Docker Compose installed
- At least 4GB RAM available
- 10GB free disk space

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd space-biology-engine

# Run setup script
./scripts/setup.sh

# Deploy with Docker
./scripts/deploy.sh
```

### Manual Docker Deployment
```bash
# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

## ☁️ Cloud Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set build command: `cd frontend && npm run build`
3. Set output directory: `frontend/.next`
4. Add environment variables:
   - `NEXT_PUBLIC_API_URL`: Your backend API URL

### Backend (Heroku)
1. Create a new Heroku app
2. Add PostgreSQL addon: `heroku addons:create heroku-postgresql:hobby-dev`
3. Set environment variables:
   ```bash
   heroku config:set NASA_API_KEY=your_nasa_key
   heroku config:set OPENROUTER_API_KEY=your_openrouter_key
   heroku config:set GOOGLE_OAUTH_CLIENT_ID=your_google_client_id
   heroku config:set GOOGLE_OAUTH_SECRET=your_google_secret
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set SESSION_SECRET=your_session_secret
   heroku config:set FRONTEND_URL=https://your-frontend-url.vercel.app
   ```
4. Deploy: `git subtree push --prefix backend heroku main`

### Database (Supabase)
1. Create a new Supabase project
2. Copy the connection string
3. Update `DATABASE_URL` in your environment variables
4. Run migrations: `npx prisma migrate deploy`

### Vector Database (ChromaDB Cloud)
1. Sign up for ChromaDB Cloud
2. Create a new collection
3. Update `CHROMA_HOST` and `CHROMA_PORT` in environment variables

## 🔧 Environment Variables

### Backend (.env)
```env
# API Keys
NASA_API_KEY=wXywYQJfod2J6JMpqTgqbGLYR61Egi4xZNpBOcxv
OPENROUTER_API_KEY=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

# Google OAuth
GOOGLE_OAUTH_CLIENT_ID=11757822380-9mucb5e4pvjdm4vcatd9bu4hk314us7v.apps.googleusercontent.com
GOOGLE_OAUTH_SECRET=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

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/space_biology_engine

# Security
JWT_SECRET=your-super-secret-jwt-key
SESSION_SECRET=your-session-secret

# Server
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.com

# ChromaDB
CHROMA_HOST=localhost
CHROMA_PORT=8000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-backend-api-url.com
```

## 🚀 Production Checklist

### Security
- [ ] Change all default secrets and passwords
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable database connection pooling
- [ ] Configure proper logging

### Performance
- [ ] Enable Redis caching
- [ ] Configure CDN for static assets
- [ ] Set up database indexing
- [ ] Enable gzip compression
- [ ] Configure load balancing

### Monitoring
- [ ] Set up health checks
- [ ] Configure error tracking (Sentry)
- [ ] Set up performance monitoring
- [ ] Configure log aggregation
- [ ] Set up uptime monitoring

### Backup
- [ ] Configure database backups
- [ ] Set up file storage backups
- [ ] Test disaster recovery procedures

## 🔍 Troubleshooting

### Common Issues

**Database Connection Failed**
- Check DATABASE_URL format
- Ensure database is running
- Verify network connectivity

**OAuth Not Working**
- Check Google OAuth credentials
- Verify redirect URLs
- Ensure HTTPS in production

**ChromaDB Connection Failed**
- Check ChromaDB service status
- Verify CHROMA_HOST and CHROMA_PORT
- Ensure network connectivity

**File Upload Issues**
- Check upload directory permissions
- Verify file size limits
- Ensure sufficient disk space

### Health Checks
```bash
# Check backend health
curl http://localhost:5000/health

# Check database connection
docker-compose exec postgres pg_isready -U postgres

# Check ChromaDB
curl http://localhost:8000/api/v1/heartbeat

# Check frontend
curl http://localhost:3000
```

### Logs
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
docker-compose logs -f chromadb
```

## 📊 Scaling

### Horizontal Scaling
- Use load balancers for multiple backend instances
- Implement database read replicas
- Use CDN for static content
- Consider microservices architecture

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Optimize database queries
- Implement caching strategies
- Use connection pooling

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit secrets to version control
2. **HTTPS**: Always use HTTPS in production
3. **Authentication**: Implement proper session management
4. **Authorization**: Use role-based access control
5. **Input Validation**: Sanitize all user inputs
6. **Rate Limiting**: Prevent abuse and DoS attacks
7. **CORS**: Configure proper CORS policies
8. **Updates**: Keep dependencies up to date

## 📈 Monitoring and Analytics

### Application Monitoring
- Use APM tools (New Relic, DataDog)
- Set up error tracking (Sentry)
- Monitor API response times
- Track user engagement

### Infrastructure Monitoring
- Monitor server resources
- Track database performance
- Monitor network latency
- Set up alerts for critical issues

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "your-app-name"
          heroku_email: "your-email@example.com"
```

## 📞 Support

For deployment issues:
1. Check the troubleshooting section
2. Review application logs
3. Verify environment configuration
4. Check service health endpoints
5. Contact support team

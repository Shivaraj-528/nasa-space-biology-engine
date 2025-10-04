#!/bin/bash

# Space Biology Knowledge Engine Deployment Script
echo "🚀 Deploying Space Biology Knowledge Engine..."

# Build and start all services
echo "🔨 Building and starting services..."
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service health
echo "🏥 Checking service health..."

# Check PostgreSQL
if docker-compose exec postgres pg_isready -U postgres; then
    echo "✅ PostgreSQL is ready"
else
    echo "❌ PostgreSQL is not ready"
fi

# Check ChromaDB
if curl -f http://localhost:8000/api/v1/heartbeat; then
    echo "✅ ChromaDB is ready"
else
    echo "❌ ChromaDB is not ready"
fi

# Check Backend
if curl -f http://localhost:5000/health; then
    echo "✅ Backend API is ready"
else
    echo "❌ Backend API is not ready"
fi

# Check Frontend
if curl -f http://localhost:3000; then
    echo "✅ Frontend is ready"
else
    echo "❌ Frontend is not ready"
fi

echo "🎉 Deployment completed!"
echo ""
echo "Services are running at:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:5000"
echo "- API Health: http://localhost:5000/health"
echo "- ChromaDB: http://localhost:8000"
echo ""
echo "To view logs: docker-compose logs -f [service_name]"
echo "To stop services: docker-compose down"

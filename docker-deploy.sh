#!/bin/bash

set -e

echo "🐳 Docker Deployment Script"
echo "============================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo "Copy .env.docker to .env and configure it first:"
    echo "  cp .env.docker .env"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Build and start containers
echo -e "${YELLOW}📦 Building Docker images...${NC}"
docker-compose build --no-cache

echo -e "${YELLOW}🚀 Starting containers...${NC}"
docker-compose up -d

# Wait for database to be ready
echo -e "${YELLOW}⏳ Waiting for database...${NC}"
sleep 10

# Run migrations
echo -e "${YELLOW}🔧 Running migrations...${NC}"
docker-compose exec -T php php artisan migrate --force

# Seed database (optional)
read -p "Do you want to seed the database? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🌱 Seeding database...${NC}"
    docker-compose exec -T php php artisan db:seed --force
fi

# Optimize Laravel
echo -e "${YELLOW}⚡ Optimizing Laravel...${NC}"
docker-compose exec -T php php artisan config:cache
docker-compose exec -T php php artisan route:cache
docker-compose exec -T php php artisan view:cache
docker-compose exec -T php php artisan event:cache

# Build frontend
echo -e "${YELLOW}🎨 Building frontend...${NC}"
cd frontend
npm ci
npm run build
cd ..

echo -e "${GREEN}✅ Deployment completed!${NC}"
echo ""
echo "Access your application:"
echo "  Frontend: http://dashboard.localhost"
echo "  Backend API: http://api.localhost"
echo ""
echo "Useful commands:"
echo "  docker-compose ps              - View running containers"
echo "  docker-compose logs -f         - View logs"
echo "  docker-compose exec php bash   - Access PHP container"
echo "  docker-compose down            - Stop containers"
echo "  docker-compose restart         - Restart containers"

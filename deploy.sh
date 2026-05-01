#!/bin/bash

set -e

echo "🚀 Starting deployment..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/var/www/ecommerce-dashboard"
BACKUP_DIR="/var/backups/dashboard"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
echo -e "${YELLOW}📦 Creating backup...${NC}"
mkdir -p $BACKUP_DIR
sudo -u postgres pg_dump ecommerce_dashboard > $BACKUP_DIR/db_$DATE.sql
tar -czf $BACKUP_DIR/files_$DATE.tar.gz -C $APP_DIR backend/storage

# Pull latest code
echo -e "${YELLOW}📥 Pulling latest code...${NC}"
cd $APP_DIR
git pull origin main

# Backend deployment
echo -e "${YELLOW}🔧 Deploying backend...${NC}"
cd $APP_DIR/backend

# Maintenance mode
php artisan down

# Install dependencies
composer install --no-dev --optimize-autoloader

# Run migrations
php artisan migrate --force

# Clear and cache
php artisan config:clear
php artisan cache:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Exit maintenance mode
php artisan up

# Frontend deployment
echo -e "${YELLOW}🎨 Deploying frontend...${NC}"
cd $APP_DIR/frontend
npm ci
npm run build

# Restart services
echo -e "${YELLOW}🔄 Restarting services...${NC}"
sudo supervisorctl restart dashboard-worker:*
sudo systemctl reload php8.2-fpm
sudo systemctl reload nginx

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"

# Cleanup old backups (keep last 7 days)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo -e "${GREEN}🎉 All done!${NC}"

# Deployment Guide

Complete guide for deploying the eCommerce Dashboard to production.

---

## Table of Contents

1. [Server Requirements](#server-requirements)
2. [Server Setup](#server-setup)
3. [Application Deployment](#application-deployment)
4. [CI/CD Pipeline](#cicd-pipeline)
5. [Environment Configuration](#environment-configuration)
6. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Server Requirements

### Minimum Specifications
- **OS**: Ubuntu 22.04 LTS or Amazon Linux 2023
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 50GB SSD
- **Network**: Static IP with SSL certificate

### Software Stack
- **Web Server**: Nginx 1.24+
- **PHP**: 8.2+
- **Database**: PostgreSQL 15+ or MySQL 8.0+
- **Cache**: Redis 7+
- **Node.js**: 20+ LTS (for frontend build)
- **Process Manager**: Supervisor
- **SSL**: Let's Encrypt (Certbot)

---

## Server Setup

### 1. Initial Server Configuration

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y software-properties-common curl wget git unzip

# Add PHP repository
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update

# Install PHP and extensions
sudo apt install -y php8.2-fpm php8.2-cli php8.2-common \
  php8.2-mysql php8.2-pgsql php8.2-redis php8.2-xml \
  php8.2-mbstring php8.2-curl php8.2-zip php8.2-bcmath \
  php8.2-gd php8.2-intl

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Redis
sudo apt install -y redis-server

# Install Nginx
sudo apt install -y nginx

# Install Supervisor
sudo apt install -y supervisor
```

### 2. Database Setup

```bash
# PostgreSQL
sudo -u postgres psql

CREATE DATABASE ecommerce_dashboard;
CREATE USER dashboard_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE ecommerce_dashboard TO dashboard_user;
\q

# Or MySQL
sudo mysql

CREATE DATABASE ecommerce_dashboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'dashboard_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON ecommerce_dashboard.* TO 'dashboard_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Create Application User

```bash
# Create dedicated user
sudo adduser --disabled-password --gecos "" dashboard

# Add to www-data group
sudo usermod -aG www-data dashboard
```

---

## Application Deployment

### 1. Clone Repository

```bash
# Switch to application user
sudo su - dashboard

# Clone repository
cd /var/www
git clone https://github.com/your-org/ecommerce-dashboard.git
cd ecommerce-dashboard

# Set permissions
sudo chown -R dashboard:www-data /var/www/ecommerce-dashboard
sudo chmod -R 755 /var/www/ecommerce-dashboard
```

### 2. Backend Setup

```bash
cd /var/www/ecommerce-dashboard/backend

# Install dependencies
composer install --no-dev --optimize-autoloader

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure .env (see Environment Configuration section)
nano .env

# Run migrations
php artisan migrate --force

# Seed initial data
php artisan db:seed --force

# Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Set permissions
sudo chown -R dashboard:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

### 3. Frontend Setup

```bash
cd /var/www/ecommerce-dashboard/frontend

# Install dependencies
npm ci

# Build for production
npm run build

# Output will be in 'dist' folder
```

### 4. Nginx Configuration

Create `/etc/nginx/sites-available/dashboard`:

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;
    root /var/www/ecommerce-dashboard/backend/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;
}

# Frontend
server {
    listen 80;
    server_name dashboard.yourdomain.com;
    root /var/www/ecommerce-dashboard/frontend/dist;

    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/dashboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificates
sudo certbot --nginx -d api.yourdomain.com -d dashboard.yourdomain.com

# Auto-renewal is configured automatically
sudo certbot renew --dry-run
```

### 6. Queue Worker (Supervisor)

Create `/etc/supervisor/conf.d/dashboard-worker.conf`:

```ini
[program:dashboard-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/ecommerce-dashboard/backend/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=dashboard
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/ecommerce-dashboard/backend/storage/logs/worker.log
stopwaitsecs=3600
```

Start worker:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start dashboard-worker:*
```

### 7. Scheduler (Cron)

```bash
# Edit crontab for dashboard user
sudo crontab -u dashboard -e

# Add this line:
* * * * * cd /var/www/ecommerce-dashboard/backend && php artisan schedule:run >> /dev/null 2>&1
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: testing
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
          extensions: mbstring, xml, bcmath, pgsql, redis
          
      - name: Install Backend Dependencies
        run: |
          cd backend
          composer install --prefer-dist --no-progress
          
      - name: Run Backend Tests
        run: |
          cd backend
          cp .env.example .env
          php artisan key:generate
          php artisan test
        env:
          DB_CONNECTION: pgsql
          DB_HOST: localhost
          DB_PORT: 5432
          DB_DATABASE: testing
          DB_USERNAME: test
          DB_PASSWORD: test
          
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install Frontend Dependencies
        run: |
          cd frontend
          npm ci
          
      - name: Build Frontend
        run: |
          cd frontend
          npm run build
          
      - name: Run Frontend Tests
        run: |
          cd frontend
          npm run test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Deploy to Production
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.PROD_SSH_KEY }}
          script: |
            cd /var/www/ecommerce-dashboard
            
            # Pull latest code
            git pull origin main
            
            # Backend deployment
            cd backend
            composer install --no-dev --optimize-autoloader
            php artisan migrate --force
            php artisan config:cache
            php artisan route:cache
            php artisan view:cache
            php artisan event:cache
            
            # Frontend deployment
            cd ../frontend
            npm ci
            npm run build
            
            # Restart services
            sudo supervisorctl restart dashboard-worker:*
            sudo systemctl reload php8.2-fpm
            sudo systemctl reload nginx
            
      - name: Notify Deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Deployment to production completed!'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        if: always()
```

### Deployment Script

Create `deploy.sh`:

```bash
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
```

Make executable:
```bash
chmod +x deploy.sh
```

---

## Environment Configuration

### Backend `.env` (Production)

```env
APP_NAME="eCommerce Dashboard"
APP_ENV=production
APP_KEY=base64:GENERATE_WITH_php_artisan_key:generate
APP_DEBUG=false
APP_URL=https://api.yourdomain.com

LOG_CHANNEL=stack
LOG_LEVEL=error
LOG_STDERR_FORMATTER=null

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=ecommerce_dashboard
DB_USERNAME=dashboard_user
DB_PASSWORD=your_secure_password

CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis
SESSION_LIFETIME=120

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@yourdomain.com"
MAIL_FROM_NAME="${APP_NAME}"

AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=your_bucket

SANCTUM_STATEFUL_DOMAINS=dashboard.yourdomain.com
SESSION_DOMAIN=.yourdomain.com
```

### Frontend `.env.production`

```env
VITE_API_URL=https://api.yourdomain.com/api/v1
VITE_APP_NAME=eCommerce Dashboard
```

---

## Monitoring & Maintenance

### 1. Log Monitoring

```bash
# Laravel logs
tail -f /var/www/ecommerce-dashboard/backend/storage/logs/laravel.log

# Nginx access logs
tail -f /var/log/nginx/access.log

# Nginx error logs
tail -f /var/log/nginx/error.log

# PHP-FPM logs
tail -f /var/log/php8.2-fpm.log

# Queue worker logs
tail -f /var/www/ecommerce-dashboard/backend/storage/logs/worker.log
```

### 2. Health Checks

Create `backend/routes/web.php`:

```php
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
        'database' => DB::connection()->getPdo() ? 'connected' : 'disconnected',
        'redis' => Redis::connection()->ping() ? 'connected' : 'disconnected',
    ]);
});
```

### 3. Monitoring Tools

**Install Laravel Telescope (Development/Staging only):**
```bash
composer require laravel/telescope --dev
php artisan telescope:install
php artisan migrate
```

**Install Laravel Horizon (Queue monitoring):**
```bash
composer require laravel/horizon
php artisan horizon:install
php artisan migrate
```

### 4. Backup Script

Create `backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/dashboard"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

mkdir -p $BACKUP_DIR

# Database backup
sudo -u postgres pg_dump ecommerce_dashboard | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Files backup
tar -czf $BACKUP_DIR/storage_$DATE.tar.gz -C /var/www/ecommerce-dashboard/backend storage

# Upload to S3 (optional)
# aws s3 cp $BACKUP_DIR/db_$DATE.sql.gz s3://your-bucket/backups/
# aws s3 cp $BACKUP_DIR/storage_$DATE.tar.gz s3://your-bucket/backups/

# Cleanup old backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $DATE"
```

Add to crontab:
```bash
# Daily backup at 2 AM
0 2 * * * /var/www/ecommerce-dashboard/backup.sh >> /var/log/backup.log 2>&1
```

### 5. Performance Optimization

```bash
# Enable OPcache
sudo nano /etc/php/8.2/fpm/php.ini

# Add/modify:
opcache.enable=1
opcache.memory_consumption=256
opcache.interned_strings_buffer=16
opcache.max_accelerated_files=10000
opcache.revalidate_freq=60
opcache.fast_shutdown=1

# Restart PHP-FPM
sudo systemctl restart php8.2-fpm
```

---

## Troubleshooting

### Common Issues

**1. Permission Errors**
```bash
sudo chown -R dashboard:www-data /var/www/ecommerce-dashboard
sudo chmod -R 775 /var/www/ecommerce-dashboard/backend/storage
sudo chmod -R 775 /var/www/ecommerce-dashboard/backend/bootstrap/cache
```

**2. Queue Not Processing**
```bash
sudo supervisorctl status dashboard-worker:*
sudo supervisorctl restart dashboard-worker:*
```

**3. Cache Issues**
```bash
cd /var/www/ecommerce-dashboard/backend
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

**4. Database Connection**
```bash
# Test PostgreSQL connection
psql -h localhost -U dashboard_user -d ecommerce_dashboard

# Check PHP extensions
php -m | grep pdo_pgsql
```

---

## Security Checklist

- [ ] SSL certificate installed and auto-renewal configured
- [ ] Firewall configured (UFW or iptables)
- [ ] SSH key-based authentication only
- [ ] Database user has minimal required permissions
- [ ] `.env` file permissions set to 600
- [ ] APP_DEBUG=false in production
- [ ] Rate limiting configured in Nginx
- [ ] CORS properly configured
- [ ] Security headers added to Nginx
- [ ] Regular security updates scheduled
- [ ] Backup system tested and verified
- [ ] Monitoring and alerting configured

---

## Support

For deployment issues, contact: devops@yourdomain.com

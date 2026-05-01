# Quick Start Guide

Choose your deployment method:

---

## Option 1: Docker Deployment (Recommended for Development/Testing)

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+

### Steps

1. **Clone repository**
   ```bash
   git clone https://github.com/your-org/ecommerce-dashboard.git
   cd ecommerce-dashboard
   ```

2. **Configure environment**
   ```bash
   cp .env.docker .env
   nano .env  # Update database credentials
   ```

3. **Run deployment script**
   ```bash
   ./docker-deploy.sh
   ```

4. **Access application**
   - Frontend: http://dashboard.localhost
   - Backend API: http://api.localhost

### Docker Commands

```bash
# View logs
docker-compose logs -f

# Access PHP container
docker-compose exec php bash

# Run artisan commands
docker-compose exec php php artisan migrate

# Stop containers
docker-compose down

# Restart containers
docker-compose restart
```

---

## Option 2: Traditional Server Deployment (Production)

### Prerequisites
- Ubuntu 22.04 LTS
- Root or sudo access

### Steps

1. **Follow full deployment guide**
   ```bash
   cat DEPLOYMENT.md
   ```

2. **Quick setup (automated)**
   ```bash
   # Clone repository
   git clone https://github.com/your-org/ecommerce-dashboard.git
   cd ecommerce-dashboard
   
   # Run deployment script
   ./deploy.sh
   ```

3. **Manual setup**
   - See `DEPLOYMENT.md` for detailed instructions

---

## Option 3: Local Development

### Backend (Laravel)

```bash
cd backend

# Install dependencies
composer install

# Setup environment
cp .env.example .env
php artisan key:generate

# Configure database in .env
nano .env

# Run migrations
php artisan migrate
php artisan db:seed

# Start server
php artisan serve
```

### Frontend (React)

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

---

## Default Credentials

After seeding the database:

| Role  | Email                | Password    |
|-------|----------------------|-------------|
| Admin | admin@company.com    | Admin@1234  |
| Staff | staff@company.com    | Staff@1234  |

**⚠️ Change these passwords immediately in production!**

---

## Troubleshooting

### Docker Issues

**Containers won't start:**
```bash
docker-compose down -v
docker-compose up -d --build
```

**Database connection error:**
```bash
# Check if postgres is ready
docker-compose exec postgres pg_isready

# View postgres logs
docker-compose logs postgres
```

**Permission errors:**
```bash
docker-compose exec php chown -R www-data:www-data storage bootstrap/cache
docker-compose exec php chmod -R 775 storage bootstrap/cache
```

### Traditional Deployment Issues

**502 Bad Gateway:**
```bash
# Check PHP-FPM status
sudo systemctl status php8.2-fpm

# Check Nginx config
sudo nginx -t

# Restart services
sudo systemctl restart php8.2-fpm nginx
```

**Database connection:**
```bash
# Test connection
php artisan tinker
>>> DB::connection()->getPdo();
```

**Queue not processing:**
```bash
sudo supervisorctl status dashboard-worker:*
sudo supervisorctl restart dashboard-worker:*
```

---

## Next Steps

1. **Configure integrations** (see `INTEGRATIONS.md`)
2. **Set up monitoring** (see `DEPLOYMENT.md` → Monitoring section)
3. **Configure backups** (see `DEPLOYMENT.md` → Backup section)
4. **Set up CI/CD** (see `DEPLOYMENT.md` → CI/CD section)

---

## Support

- Documentation: `DEPLOYMENT.md`
- Integrations: `INTEGRATIONS.md`
- Issues: https://github.com/your-org/ecommerce-dashboard/issues

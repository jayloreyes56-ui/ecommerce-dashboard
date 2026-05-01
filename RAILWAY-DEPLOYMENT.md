# Railway Deployment Guide - Quick Publish

## 🎯 Goal
I-publish ang system para makakuha ng public HTTPS URL for Shopify integration.

**Time:** 15-20 minutes  
**Cost:** FREE (Railway free tier)  
**Result:** `https://yourapp.railway.app`

---

## 📋 Pre-requisites

1. ✅ GitHub account
2. ✅ Railway account (free - sign up with GitHub)
3. ✅ Code ready to push

---

## 🚀 Step 1: Prepare Code for Railway

### 1.1 Create Railway Configuration

Create `railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "php artisan serve --host=0.0.0.0 --port=$PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 1.2 Create Procfile (for Laravel)

Create `Procfile` in backend folder:
```
web: php artisan serve --host=0.0.0.0 --port=$PORT
```

### 1.3 Update Backend .env for Railway

Create `backend/.env.railway`:
```env
APP_NAME="eCommerce Dashboard"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://yourapp.railway.app

LOG_CHANNEL=stack
LOG_LEVEL=error

# Railway provides DATABASE_URL automatically
DB_CONNECTION=pgsql
DB_HOST=${PGHOST}
DB_PORT=${PGPORT}
DB_DATABASE=${PGDATABASE}
DB_USERNAME=${PGUSER}
DB_PASSWORD=${PGPASSWORD}

# Use file-based cache for simplicity
CACHE_DRIVER=file
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

SANCTUM_STATEFUL_DOMAINS=yourapp.railway.app
CORS_ALLOWED_ORIGINS=https://yourapp.railway.app
FRONTEND_URL=https://yourapp.railway.app
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax
```

### 1.4 Create nixpacks.toml (Railway build config)

Create `nixpacks.toml` in root:
```toml
[phases.setup]
nixPkgs = ["php82", "php82Packages.composer", "nodejs-20_x"]

[phases.install]
cmds = [
  "cd backend && composer install --no-dev --optimize-autoloader",
  "cd frontend && npm ci && npm run build"
]

[phases.build]
cmds = [
  "cd backend && php artisan config:cache",
  "cd backend && php artisan route:cache",
  "cd backend && php artisan view:cache"
]

[start]
cmd = "cd backend && php artisan serve --host=0.0.0.0 --port=$PORT"
```

---

## 🚀 Step 2: Push to GitHub

```bash
# Initialize git (if not yet)
git init

# Add all files
git add .

# Commit
git commit -m "Prepare for Railway deployment"

# Create GitHub repo (go to github.com/new)
# Then add remote
git remote add origin https://github.com/YOUR_USERNAME/ecommerce-dashboard.git

# Push
git push -u origin main
```

---

## 🚀 Step 3: Deploy to Railway

### 3.1 Sign Up / Login to Railway

1. Go to https://railway.app/
2. Click "Login"
3. Choose "Login with GitHub"
4. Authorize Railway

### 3.2 Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository: `ecommerce-dashboard`
4. Click "Deploy Now"

### 3.3 Add PostgreSQL Database

1. In your project, click "New"
2. Select "Database"
3. Choose "PostgreSQL"
4. Wait for provisioning (~30 seconds)

### 3.4 Configure Environment Variables

1. Click on your service (web)
2. Go to "Variables" tab
3. Click "Raw Editor"
4. Paste this:

```env
APP_NAME=eCommerce Dashboard
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:GENERATE_THIS_LATER

LOG_CHANNEL=stack
LOG_LEVEL=error

# Database (Railway auto-fills these)
DB_CONNECTION=pgsql
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_DATABASE=${{Postgres.PGDATABASE}}
DB_USERNAME=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}

# Cache & Queue
CACHE_DRIVER=file
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

# CORS (update after getting domain)
SANCTUM_STATEFUL_DOMAINS=yourapp.railway.app
CORS_ALLOWED_ORIGINS=https://yourapp.railway.app
FRONTEND_URL=https://yourapp.railway.app
APP_URL=https://yourapp.railway.app

# Session Security
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax
```

5. Click "Save"

### 3.5 Generate APP_KEY

1. Go to "Settings" tab
2. Scroll to "Deploy Triggers"
3. Click "Deploy"
4. Wait for deployment
5. Go to "Deployments" tab
6. Click latest deployment
7. Click "View Logs"
8. Find the command section
9. Run command: `php artisan key:generate --show`
10. Copy the generated key
11. Go back to "Variables"
12. Update `APP_KEY` with the generated key
13. Redeploy

### 3.6 Generate Domain

1. Go to "Settings" tab
2. Scroll to "Networking"
3. Click "Generate Domain"
4. Copy your URL: `https://yourapp.railway.app`

### 3.7 Update Environment Variables with Domain

1. Go to "Variables" tab
2. Update these variables with your actual domain:
   ```env
   APP_URL=https://yourapp.railway.app
   SANCTUM_STATEFUL_DOMAINS=yourapp.railway.app
   CORS_ALLOWED_ORIGINS=https://yourapp.railway.app
   FRONTEND_URL=https://yourapp.railway.app
   ```
3. Click "Save"
4. Redeploy

### 3.8 Run Migrations

1. Go to "Settings" tab
2. Scroll to "Deploy Triggers"
3. Add custom start command temporarily:
   ```
   php artisan migrate --force --seed && php artisan serve --host=0.0.0.0 --port=$PORT
   ```
4. Deploy
5. After successful migration, change back to:
   ```
   php artisan serve --host=0.0.0.0 --port=$PORT
   ```

---

## ✅ Step 4: Verify Deployment

### 4.1 Test Backend API

```bash
# Test health endpoint
curl https://yourapp.railway.app/api/health

# Should return:
# {"status":"ok","timestamp":"..."}
```

### 4.2 Test Frontend

Open browser:
```
https://yourapp.railway.app
```

Should see the login page!

### 4.3 Test Login

```
Email: admin@example.com
Password: password
```

---

## 🎉 Step 5: Use in Shopify

Now you have a public HTTPS URL!

### Update Shopify App Settings:

```
App URL: https://yourapp.railway.app
Redirect URL: https://yourapp.railway.app/api/v1/shopify/callback
```

### Add Shopify Credentials to Railway:

1. Go to Railway → Variables
2. Add:
   ```env
   SHOPIFY_API_KEY=your_api_key
   SHOPIFY_API_SECRET=your_api_secret
   SHOPIFY_API_VERSION=2024-01
   ```
3. Save and redeploy

---

## 🔧 Troubleshooting

### Problem: "Application Error"

**Check Logs:**
1. Go to Railway project
2. Click on service
3. Go to "Deployments"
4. Click latest deployment
5. View logs

**Common fixes:**
```bash
# Missing APP_KEY
# Solution: Generate and add to variables

# Database connection failed
# Solution: Check database variables are linked

# Permission errors
# Solution: Check storage folder permissions
```

### Problem: "502 Bad Gateway"

**Solution:**
1. Check if service is running
2. Check start command is correct
3. Check PORT variable is used
4. Redeploy

### Problem: "CORS Error"

**Solution:**
1. Update CORS_ALLOWED_ORIGINS in variables
2. Make sure it matches your domain
3. Redeploy

---

## 📊 Railway Free Tier Limits

- ✅ $5 free credit per month
- ✅ 500 hours execution time
- ✅ 1GB RAM
- ✅ 1GB storage
- ✅ Unlimited projects
- ✅ Custom domains

**Enough for testing and small production!**

---

## 🔄 Auto-Deploy from GitHub

Railway automatically deploys when you push to GitHub!

```bash
# Make changes
git add .
git commit -m "Update feature"
git push

# Railway automatically:
# 1. Detects push
# 2. Builds new version
# 3. Runs tests
# 4. Deploys
# 5. Updates URL
```

---

## 📝 Alternative: Simpler Approach (SQLite)

If you want even simpler deployment without PostgreSQL:

### Update `backend/.env.railway`:
```env
DB_CONNECTION=sqlite
DB_DATABASE=/app/database/database.sqlite
```

### Update `nixpacks.toml`:
```toml
[phases.install]
cmds = [
  "cd backend && composer install --no-dev --optimize-autoloader",
  "cd backend && touch database/database.sqlite",
  "cd frontend && npm ci && npm run build"
]
```

**Pros:**
- ✅ Simpler setup
- ✅ No database service needed
- ✅ Faster deployment

**Cons:**
- ❌ Not recommended for production
- ❌ Data lost on redeploy

---

## 🎯 Summary

### What You Did:
1. ✅ Created Railway configuration files
2. ✅ Pushed code to GitHub
3. ✅ Deployed to Railway
4. ✅ Got public HTTPS URL
5. ✅ Ready for Shopify integration!

### Your URLs:
```
Application: https://yourapp.railway.app
API: https://yourapp.railway.app/api/v1
Health: https://yourapp.railway.app/api/health
```

### Next Steps:
1. ✅ Use URL in Shopify app settings
2. ✅ Continue with SHOPIFY-STEP-BY-STEP.md
3. ✅ Complete integration

---

## 🆘 Need Help?

### Railway Support:
- Docs: https://docs.railway.app/
- Discord: https://discord.gg/railway
- Status: https://status.railway.app/

### Common Commands:

```bash
# View logs
railway logs

# Run command
railway run php artisan migrate

# Link project
railway link

# Deploy
git push
```

---

**Congratulations!** 🎉

Your system is now published and accessible at:
**https://yourapp.railway.app**

Use this URL sa Shopify integration! 🚀

**Last Updated:** 2026-05-01

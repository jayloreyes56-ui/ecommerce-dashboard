# Shopify URL Setup - Quick Guide

## ❓ Ano ang "https://yourdomain.com"?

**SAGOT:** Ito ay ang **PUBLIC HTTPS URL** ng system mo na accessible sa internet.

---

## ⚠️ IMPORTANTE: Hindi Pwede ang Localhost!

```
❌ HINDI PWEDE:
   http://localhost:8000
   http://127.0.0.1:8000
   http://192.168.1.100:8000

BAKIT?
- Shopify needs to send data (webhooks) to your server
- Localhost is only accessible sa computer mo
- Internet can't reach localhost
- HTTPS is required for security
```

---

## ✅ 3 Options Para Makakuha ng Public URL

### OPTION 1: Ngrok (Fastest - 5 minutes) ⚡

**Best for:** Testing, development

**Steps:**
```bash
# 1. Install ngrok
# Mac:
brew install ngrok

# Windows:
# Download from https://ngrok.com/download

# 2. Start your Laravel server
cd backend
php artisan serve
# Server running at http://127.0.0.1:8000

# 3. Open NEW terminal, run ngrok
ngrok http 8000

# 4. Copy the HTTPS URL
```

**Output:**
```
ngrok

Session Status                online
Account                       Your Name (Plan: Free)
Version                       3.0.0
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok.io -> http://localhost:8000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**Use this URL:**
```
App URL: https://abc123.ngrok.io
Redirect URL: https://abc123.ngrok.io/api/v1/shopify/callback
```

**Pros:**
- ✅ Super fast setup (5 minutes)
- ✅ No deployment needed
- ✅ Good for testing

**Cons:**
- ❌ URL changes every restart (free plan)
- ❌ Need to keep terminal open
- ❌ Need to update Shopify settings if URL changes

---

### OPTION 2: Railway (Permanent URL - Free) 🚂

**Best for:** Production, permanent setup

**Steps:**

1. **Push code to GitHub**
```bash
# If not yet on GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/yourrepo.git
git push -u origin main
```

2. **Deploy to Railway**
```
1. Go to https://railway.app/
2. Click "Start a New Project"
3. Click "Deploy from GitHub repo"
4. Select your repository
5. Railway auto-detects Laravel
6. Click "Deploy"
7. Wait 2-3 minutes
```

3. **Get your URL**
```
1. Click on your project
2. Go to "Settings" tab
3. Click "Generate Domain"
4. Copy URL: https://yourapp.railway.app
```

4. **Configure environment**
```
1. Go to "Variables" tab
2. Add all .env variables:
   - APP_KEY (generate: php artisan key:generate --show)
   - DB_CONNECTION=sqlite
   - DB_DATABASE=/app/database/database.sqlite
   - etc.
3. Redeploy
```

**Use this URL:**
```
App URL: https://yourapp.railway.app
Redirect URL: https://yourapp.railway.app/api/v1/shopify/callback
```

**Pros:**
- ✅ Permanent URL (doesn't change)
- ✅ Free tier available
- ✅ Auto-deploy from GitHub
- ✅ Production-ready

**Cons:**
- ❌ Takes 10-15 minutes to setup
- ❌ Need GitHub account

---

### OPTION 3: Render (Permanent URL - Free) 🎨

**Best for:** Production, alternative to Railway

**Steps:**

1. **Push code to GitHub** (same as Railway)

2. **Deploy to Render**
```
1. Go to https://render.com/
2. Click "New +"
3. Select "Web Service"
4. Connect GitHub repository
5. Fill settings:
   - Name: ecommerce-dashboard
   - Environment: Docker
   - Plan: Free
6. Click "Create Web Service"
7. Wait 3-5 minutes
```

3. **Get your URL**
```
URL: https://ecommerce-dashboard.onrender.com
```

**Use this URL:**
```
App URL: https://ecommerce-dashboard.onrender.com
Redirect URL: https://ecommerce-dashboard.onrender.com/api/v1/shopify/callback
```

**Pros:**
- ✅ Permanent URL
- ✅ Free tier available
- ✅ Auto-deploy from GitHub
- ✅ Good documentation

**Cons:**
- ❌ Free tier sleeps after 15 min inactivity
- ❌ Takes 10-15 minutes to setup

---

## 🎯 Recommended Approach

### For Testing (Right Now):
```
Use NGROK
- Fastest setup
- Test integration immediately
- Can switch to permanent later
```

### For Production (Later):
```
Use Railway or Render
- Permanent URL
- No need to keep terminal open
- Professional setup
```

---

## 📝 Step-by-Step: Ngrok Setup (Fastest)

### 1. Install Ngrok

**Mac:**
```bash
brew install ngrok
```

**Windows:**
```
1. Download from https://ngrok.com/download
2. Extract ngrok.exe
3. Move to C:\ngrok\
4. Add to PATH
```

**Linux:**
```bash
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok
```

### 2. Sign Up (Optional but Recommended)

```
1. Go to https://dashboard.ngrok.com/signup
2. Sign up (free)
3. Get auth token
4. Run: ngrok config add-authtoken YOUR_TOKEN
```

**Benefits:**
- Longer session time
- More connections
- Better performance

### 3. Start Laravel Server

```bash
cd backend
php artisan serve

# Output:
# Server running on [http://127.0.0.1:8000]
```

### 4. Start Ngrok (New Terminal)

```bash
ngrok http 8000
```

**Output:**
```
ngrok

Forwarding    https://abc123.ngrok.io -> http://localhost:8000
```

### 5. Copy the HTTPS URL

```
https://abc123.ngrok.io
```

### 6. Use in Shopify

```
App URL: https://abc123.ngrok.io
Redirect URL: https://abc123.ngrok.io/api/v1/shopify/callback
```

### 7. Update .env

```bash
# backend/.env
APP_URL=https://abc123.ngrok.io
FRONTEND_URL=https://abc123.ngrok.io
CORS_ALLOWED_ORIGINS=https://abc123.ngrok.io
```

### 8. Test

```bash
# Visit your app
open https://abc123.ngrok.io

# Should see your Laravel app
```

---

## 🔄 What to Do When Ngrok URL Changes

**When you restart ngrok, URL changes:**
```
Old: https://abc123.ngrok.io
New: https://xyz789.ngrok.io
```

**You need to update:**

1. **Shopify App Settings**
```
1. Go to Partner Dashboard
2. Open your app
3. Update App URL
4. Update Redirect URL
5. Save
```

2. **Your .env file**
```bash
APP_URL=https://xyz789.ngrok.io
FRONTEND_URL=https://xyz789.ngrok.io
CORS_ALLOWED_ORIGINS=https://xyz789.ngrok.io
```

3. **Restart Laravel**
```bash
# Stop server (Ctrl+C)
php artisan serve
```

**To avoid this:**
- Use ngrok paid plan ($8/month) for permanent URL
- OR switch to Railway/Render (free, permanent)

---

## ✅ Checklist: Ready for Shopify

Before filling Shopify app form, make sure:

```
☐ Public HTTPS URL ready
☐ URL is accessible from internet
☐ Laravel server is running
☐ .env updated with correct URL
☐ CORS configured for the URL
☐ Firewall allows incoming connections (if using own server)
```

**Test your URL:**
```bash
# From another computer or phone
curl https://your-url.com/api/health

# Should return 200 OK
```

---

## 🎓 Summary

### The Question:
> "https://yourdomain.com eto ay dapat etong system na to"

### The Answer:
**OO, pero hindi pwedeng localhost!**

**Kailangan mo:**
1. Public HTTPS URL (accessible sa internet)
2. Choose one:
   - Ngrok (fast, for testing)
   - Railway (permanent, free)
   - Render (permanent, free)
   - Your own domain (if you have)

**Recommended NOW:**
```bash
# Use ngrok for immediate testing
brew install ngrok
ngrok http 8000

# Copy the https://abc123.ngrok.io URL
# Use it in Shopify app settings
```

**Recommended LATER:**
```
Deploy to Railway or Render
- Get permanent URL
- No need to update Shopify settings
- Production-ready
```

---

## 🆘 Need Help?

### Common Questions:

**Q: Kailangan ba talaga ng HTTPS?**
A: Yes! Shopify requires HTTPS for security.

**Q: Pwede ba ang IP address?**
A: Yes, pero kailangan pa rin ng HTTPS certificate.

**Q: Magkano ang ngrok?**
A: Free for testing, $8/month for permanent URL.

**Q: Magkano ang Railway/Render?**
A: Free tier available, enough for testing.

**Q: Ano ang pinakamabilis?**
A: Ngrok - 5 minutes lang.

**Q: Ano ang best for production?**
A: Railway or Render - permanent URL, free tier.

---

**Ready na? Let's continue with Shopify setup!** 🚀

**Next Step:** Fill the Shopify app form with your public HTTPS URL

**Last Updated:** 2026-05-01

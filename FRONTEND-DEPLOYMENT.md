# Frontend Deployment Guide 🚀

Ang backend mo ay deployed na sa Render. Now i-deploy natin ang React frontend!

---

## 🎯 OPTION 1: VERCEL (RECOMMENDED)

**Why Vercel?**
- ✅ FREE forever
- ✅ Automatic deployments from GitHub
- ✅ Global CDN (super fast)
- ✅ Perfect for React/Vite apps
- ✅ Zero configuration needed

### Steps:

#### 1. Sign Up sa Vercel
1. Pumunta sa https://vercel.com
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub

#### 2. Import Your Project
1. Sa Vercel dashboard, click "Add New..." → "Project"
2. Select your repository: `yloooo12/ecommerce-dashboard`
3. Click "Import"

#### 3. Configure Build Settings
Vercel will auto-detect Vite, pero i-configure mo:

```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

#### 4. Add Environment Variables
Click "Environment Variables" at i-add:

```
Name: VITE_API_BASE_URL
Value: https://ecommerce-dashboard-v4dh.onrender.com/api/v1
```

#### 5. Deploy!
1. Click "Deploy"
2. Maghintay ng 2-3 minuto
3. Makakakuha ka ng URL: `https://ecommerce-dashboard-xxxx.vercel.app`

#### 6. Test Your Frontend
```
https://ecommerce-dashboard-xxxx.vercel.app
```

**DONE! Automatic deployments na every push sa GitHub!** ✅

---

## 🎯 OPTION 2: RENDER STATIC SITE

**Why Render?**
- ✅ Same platform as backend
- ✅ Easy to manage everything in one place
- ✅ FREE tier available

### Steps:

#### 1. Create New Static Site
1. Pumunta sa https://dashboard.render.com
2. Click "New +" → "Static Site"
3. Connect your GitHub repo: `yloooo12/ecommerce-dashboard`

#### 2. Configure Build Settings
```
Name: ecommerce-dashboard-frontend
Branch: main
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: dist
```

#### 3. Add Environment Variables
Sa "Environment" section:

```
VITE_API_BASE_URL=https://ecommerce-dashboard-v4dh.onrender.com/api/v1
```

#### 4. Deploy!
1. Click "Create Static Site"
2. Maghintay ng 3-5 minuto
3. Makakakuha ka ng URL: `https://ecommerce-dashboard-frontend-xxxx.onrender.com`

#### 5. Test Your Frontend
```
https://ecommerce-dashboard-frontend-xxxx.onrender.com
```

**DONE!** ✅

---

## 🔧 BACKEND CORS CONFIGURATION

Para gumana ang frontend-backend connection, kailangan i-update ang CORS settings sa backend.

### Update Backend .env (via Render Dashboard)

1. Pumunta sa Render dashboard
2. I-click ang backend service: `ecommerce-dashboard`
3. Go to "Environment" tab
4. Add/Update these variables:

```bash
# Frontend URL (replace with your actual frontend URL)
FRONTEND_URL=https://ecommerce-dashboard-xxxx.vercel.app

# CORS Allowed Origins
CORS_ALLOWED_ORIGINS=https://ecommerce-dashboard-xxxx.vercel.app

# Sanctum Stateful Domains
SANCTUM_STATEFUL_DOMAINS=ecommerce-dashboard-xxxx.vercel.app
```

5. Click "Save Changes"
6. Backend will automatically redeploy

---

## 🧪 TESTING

### 1. Test Frontend
```
https://your-frontend-url.vercel.app
```
Dapat makita mo ang dashboard UI

### 2. Test API Connection
Open browser console (F12) at check kung:
- ✅ No CORS errors
- ✅ API calls successful
- ✅ Data loading properly

### 3. Test Authentication
Try to login/register:
- ✅ Login form works
- ✅ Token stored properly
- ✅ Protected routes accessible

---

## 📝 DEPLOYMENT FILES CREATED

Nag-create ako ng deployment config files:

### 1. `vercel.json`
- Vercel deployment configuration
- API proxy setup
- Routing rules

### 2. `render-frontend.yaml`
- Render static site configuration
- Alternative to Vercel

### 3. `frontend/.env.production`
- Production environment variables
- Backend API URL

---

## 🔄 AUTOMATIC DEPLOYMENTS

### Vercel:
- ✅ Auto-deploys on every push to `main` branch
- ✅ Preview deployments for pull requests
- ✅ Instant rollbacks

### Render:
- ✅ Auto-deploys on every push to `main` branch
- ✅ Manual deploy option available

---

## 🎯 RECOMMENDED SETUP

**Best Practice:**
```
Frontend: Vercel (free, fast, reliable)
Backend: Render (already deployed)
Database: SQLite (included in backend)
```

**Why?**
- Frontend on Vercel = Global CDN, super fast
- Backend on Render = Easy deployment, free tier
- Separate services = Better scalability

---

## 🚨 COMMON ISSUES

### Issue 1: CORS Error
**Error:** "Access to fetch at '...' from origin '...' has been blocked by CORS policy"

**Solution:**
1. Update backend CORS_ALLOWED_ORIGINS
2. Add frontend URL to SANCTUM_STATEFUL_DOMAINS
3. Redeploy backend

### Issue 2: API Calls Failing
**Error:** "Network Error" or "Failed to fetch"

**Solution:**
1. Check VITE_API_BASE_URL in frontend
2. Verify backend is running
3. Check browser console for errors

### Issue 3: 404 on Refresh
**Error:** Page not found when refreshing on a route

**Solution:**
- ✅ Already fixed in vercel.json (rewrites to /index.html)
- ✅ Already fixed in render-frontend.yaml

---

## 📊 DEPLOYMENT SUMMARY

### ✅ Backend (DONE):
- URL: https://ecommerce-dashboard-v4dh.onrender.com
- Status: ✅ Running
- Platform: Render

### 🎯 Frontend (TODO):
- Platform: Choose Vercel or Render
- Status: Ready to deploy
- Config files: ✅ Created

---

## 🔗 USEFUL LINKS

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Render Dashboard:** https://dashboard.render.com
- **Backend API:** https://ecommerce-dashboard-v4dh.onrender.com
- **GitHub Repo:** https://github.com/yloooo12/ecommerce-dashboard

---

## 🎉 NEXT STEPS

1. **Choose deployment platform** (Vercel recommended)
2. **Follow the steps above** for your chosen platform
3. **Update backend CORS settings** with frontend URL
4. **Test the connection** between frontend and backend
5. **Configure Shopify** with both URLs

---

**READY TO DEPLOY FRONTEND! Choose Vercel or Render and follow the steps!** 🚀

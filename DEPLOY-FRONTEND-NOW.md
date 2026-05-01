# I-Deploy ang Frontend NGAYON! 🚀

## ✅ BACKEND IS LIVE!
Backend URL: https://ecommerce-dashboard-v4dh.onrender.com

Now i-deploy natin ang frontend!

---

## 🎯 RECOMMENDED: VERCEL (5 MINUTES LANG!)

### Step 1: Sign Up sa Vercel
1. Pumunta sa **https://vercel.com**
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel

### Step 2: Import Project
1. Sa Vercel dashboard, click **"Add New..."** → **"Project"**
2. Find and select: **`yloooo12/ecommerce-dashboard`**
3. Click **"Import"**

### Step 3: Configure
**IMPORTANTE:** I-configure ng tama:

```
Framework Preset: Vite (auto-detected)
Root Directory: frontend
Build Command: npm run build (auto-detected)
Output Directory: dist (auto-detected)
Install Command: npm install (auto-detected)
```

**NOTE:** Vercel will auto-detect most settings. Just make sure **Root Directory** is set to `frontend`!

### Step 4: Add Environment Variable
Click **"Environment Variables"**:
```
Name: VITE_API_BASE_URL
Value: https://ecommerce-dashboard-v4dh.onrender.com/api/v1
```

### Step 5: Deploy!
1. Click **"Deploy"**
2. Maghintay ng 2-3 minuto
3. **DONE!** ✅

---

## 🔧 AFTER DEPLOYMENT

### 1. Get Your Frontend URL
```
https://ecommerce-dashboard-xxxx.vercel.app
```

### 2. Update Backend CORS
1. Pumunta sa **https://dashboard.render.com**
2. Click ang backend service: **`ecommerce-dashboard`**
3. Go to **"Environment"** tab
4. Add these variables:

```
FRONTEND_URL=https://ecommerce-dashboard-xxxx.vercel.app
CORS_ALLOWED_ORIGINS=https://ecommerce-dashboard-xxxx.vercel.app
SANCTUM_STATEFUL_DOMAINS=ecommerce-dashboard-xxxx.vercel.app
```

5. Click **"Save Changes"**
6. Backend will auto-redeploy (2-3 minutes)

### 3. Test!
Open your frontend URL:
```
https://ecommerce-dashboard-xxxx.vercel.app
```

**Dapat makita mo ang dashboard!** ✅

---

## 📊 COMPLETE DEPLOYMENT

### ✅ Backend:
- **URL:** https://ecommerce-dashboard-v4dh.onrender.com
- **Status:** Running
- **Platform:** Render

### 🎯 Frontend:
- **URL:** https://ecommerce-dashboard-xxxx.vercel.app
- **Status:** Deploy now!
- **Platform:** Vercel

---

## 🛍️ SHOPIFY CONFIGURATION

After both frontend and backend are deployed:

### Shopify App Settings:
```
App URL: https://ecommerce-dashboard-xxxx.vercel.app

Redirect URL: https://ecommerce-dashboard-v4dh.onrender.com/api/v1/shopify/callback

Webhook URLs: https://ecommerce-dashboard-v4dh.onrender.com/api/v1/shopify/webhooks/*
```

---

## 🔗 LINKS

- **Vercel:** https://vercel.com
- **Render:** https://dashboard.render.com
- **GitHub:** https://github.com/yloooo12/ecommerce-dashboard
- **Complete Guide:** Read `FRONTEND-DEPLOYMENT.md`

---

## ⏱️ TIME ESTIMATE

- Vercel signup: 1 minute
- Import project: 1 minute
- Configure: 1 minute
- Deploy: 2-3 minutes
- Update backend CORS: 2 minutes

**TOTAL: 7-8 MINUTES** ⚡

---

**DEPLOY MO NA! SUPER EASY LANG SA VERCEL!** 🚀

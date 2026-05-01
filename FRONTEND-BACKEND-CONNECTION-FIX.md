# Frontend-Backend Connection Fix 🔧

## 🔴 PROBLEM: Network Error on Login

Ang frontend ay hindi maka-connect sa backend API.

---

## ✅ SOLUTION: 3-Step Fix

### STEP 1: Add Environment Variable sa Vercel

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard
   - Click your project

2. **Settings → Environment Variables**

3. **Add Variable:**
   ```
   Name: VITE_API_BASE_URL
   Value: https://ecommerce-dashboard-v4dh.onrender.com/api/v1
   ```

4. **Select ALL environments:**
   - ✅ Production
   - ✅ Preview
   - ✅ Development

5. **Click "Save"**

6. **Redeploy:**
   - Deployments tab
   - Latest deployment → "..." → "Redeploy"

---

### STEP 2: Update Backend CORS Settings

1. **Go to Render Dashboard**
   - https://dashboard.render.com
   - Click backend service: `ecommerce-dashboard`

2. **Environment tab**

3. **Add/Update these variables:**

Get your Vercel URL first (e.g., `https://ecommerce-dashboard-abc123.vercel.app`)

Then add:
```bash
FRONTEND_URL=https://your-vercel-url.vercel.app
CORS_ALLOWED_ORIGINS=https://your-vercel-url.vercel.app
SANCTUM_STATEFUL_DOMAINS=your-vercel-url.vercel.app
SESSION_DOMAIN=.vercel.app
SESSION_SECURE_COOKIE=true
```

**IMPORTANTE:** Replace `your-vercel-url` with your actual Vercel URL!

4. **Click "Save Changes"**
   - Backend will auto-redeploy (2-3 minutes)

---

### STEP 3: Verify Connection

1. **Wait for both deployments to complete:**
   - ✅ Vercel frontend redeployed
   - ✅ Render backend redeployed

2. **Open frontend URL**

3. **Open Browser Console (F12)**
   - Go to "Network" tab
   - Try to login

4. **Check the request:**
   - Should see: `POST https://ecommerce-dashboard-v4dh.onrender.com/api/v1/auth/login`
   - Status should be: `422` (validation error) or `401` (wrong credentials)
   - **NOT:** Network error or CORS error

---

## 🔍 DIAGNOSTIC: Check What's Wrong

### Open Browser Console (F12)

#### Check 1: Network Tab
1. Open "Network" tab
2. Try to login
3. Look for the login request

**What to look for:**
```
✅ GOOD: POST .../api/v1/auth/login → Status 422 or 401
❌ BAD: (failed) net::ERR_FAILED
❌ BAD: CORS error
```

#### Check 2: Console Tab
Look for errors:

**CORS Error:**
```
Access to fetch at 'https://...' from origin 'https://...' 
has been blocked by CORS policy
```
**Solution:** Update backend CORS_ALLOWED_ORIGINS

**Network Error:**
```
Network error — check your connection and try again
```
**Solution:** Add VITE_API_BASE_URL to Vercel

**Wrong URL:**
```
POST http://localhost:8000/api/v1/auth/login (failed)
```
**Solution:** VITE_API_BASE_URL not set correctly

---

## 📋 CHECKLIST

### ☐ Vercel Configuration
- ☐ Environment variable `VITE_API_BASE_URL` added
- ☐ Value: `https://ecommerce-dashboard-v4dh.onrender.com/api/v1`
- ☐ All environments selected (Production, Preview, Development)
- ☐ Redeployed after adding variable

### ☐ Render Configuration
- ☐ `FRONTEND_URL` set to Vercel URL
- ☐ `CORS_ALLOWED_ORIGINS` set to Vercel URL
- ☐ `SANCTUM_STATEFUL_DOMAINS` set to Vercel domain
- ☐ Backend redeployed after changes

### ☐ Testing
- ☐ Both deployments completed
- ☐ Frontend loads without errors
- ☐ Login shows "Login failed" (not "Network error")
- ☐ Browser console shows API request to correct URL

---

## 🎯 EXPECTED BEHAVIOR AFTER FIX

### Before Fix:
```
❌ Network error — check your connection and try again
```

### After Fix:
```
✅ Login failed. Check your credentials.
   (This means connection works! Just need valid credentials)
```

---

## 🔗 QUICK REFERENCE

### Your URLs:
```
Frontend: https://your-app.vercel.app (get from Vercel dashboard)
Backend: https://ecommerce-dashboard-v4dh.onrender.com
Backend API: https://ecommerce-dashboard-v4dh.onrender.com/api/v1
```

### Environment Variables Needed:

**Vercel (Frontend):**
```
VITE_API_BASE_URL=https://ecommerce-dashboard-v4dh.onrender.com/api/v1
```

**Render (Backend):**
```
FRONTEND_URL=https://your-vercel-url.vercel.app
CORS_ALLOWED_ORIGINS=https://your-vercel-url.vercel.app
SANCTUM_STATEFUL_DOMAINS=your-vercel-url.vercel.app
SESSION_DOMAIN=.vercel.app
SESSION_SECURE_COOKIE=true
```

---

## 🚨 STILL NOT WORKING?

### Screenshot These:
1. Vercel → Settings → Environment Variables
2. Render → Environment tab (blur sensitive values)
3. Browser Console (F12) → Network tab during login
4. Browser Console (F12) → Console tab (any errors)

Send screenshots para makita ko kung ano ang issue!

---

## 💡 COMMON MISTAKES

### Mistake 1: Wrong Environment Variable Name
❌ `VITE_BASE_URL`
❌ `API_BASE_URL`
✅ `VITE_API_BASE_URL` ← Must start with VITE_

### Mistake 2: Forgot to Redeploy
- Adding environment variable is not enough
- Must redeploy for changes to take effect

### Mistake 3: Wrong CORS URL
- Must include `https://`
- Must match exactly (no trailing slash)
- Must be the Vercel URL, not localhost

### Mistake 4: Typo in URL
❌ `https://ecommerce-dashboard-v4dh.onrender.com/api/v1/` (trailing slash)
✅ `https://ecommerce-dashboard-v4dh.onrender.com/api/v1`

---

**FOLLOW THE 3 STEPS ABOVE!** 🚀

Kung may tanong or screenshot ng errors, send mo dito!

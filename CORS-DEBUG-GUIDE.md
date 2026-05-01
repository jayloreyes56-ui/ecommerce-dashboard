# CORS Debug Guide - FINAL FIX! 🔧

## 🔴 PROBLEMA: Network Error / CORS Error

---

## ✅ STEP-BY-STEP FIX (GUARANTEED!)

### STEP 1: Check Current CORS Settings

**Test kung ano ang actual CORS setting ng backend:**

Open browser console (F12) and run:
```javascript
fetch('https://ecommerce-dashboard-v4dh.onrender.com/api/v1/health')
  .then(r => r.text())
  .then(t => console.log('Response:', t))
  .catch(e => console.error('Error:', e))
```

Kung may CORS error, proceed to Step 2.

---

### STEP 2: Add CORS Settings sa Render (EXACT STEPS)

1. **Go to:** https://dashboard.render.com

2. **Click:** `ecommerce-dashboard` service

3. **Click:** "Environment" tab (left sidebar)

4. **Scroll down** and click **"Add Environment Variable"**

5. **Add EACH of these ONE BY ONE:**

#### Variable 1:
```
Key: CORS_ALLOWED_ORIGINS
Value: https://ecommerce-dashboard-sigma-one.vercel.app
```
Click "Save Changes"

#### Variable 2:
```
Key: FRONTEND_URL
Value: https://ecommerce-dashboard-sigma-one.vercel.app
```
Click "Save Changes"

#### Variable 3:
```
Key: SANCTUM_STATEFUL_DOMAINS
Value: ecommerce-dashboard-sigma-one.vercel.app
```
Click "Save Changes"

#### Variable 4:
```
Key: SESSION_DOMAIN
Value: .vercel.app
```
Click "Save Changes"

#### Variable 5:
```
Key: SESSION_SECURE_COOKIE
Value: true
```
Click "Save Changes"

6. **After adding ALL variables, backend will auto-redeploy**

---

### STEP 3: Wait for Redeploy

1. **Go to "Events" tab**
2. **Wait for "Deploy live" event** (5-8 minutes)
3. **Status should be green "Live"**

---

### STEP 4: Clear Cache and Test

1. **Go to frontend:** https://ecommerce-dashboard-sigma-one.vercel.app

2. **Hard refresh:** 
   - Windows: Ctrl + Shift + R
   - Mac: Cmd + Shift + R

3. **Open Console (F12)**

4. **Run this test:**
```javascript
fetch('https://ecommerce-dashboard-v4dh.onrender.com/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({
    email: 'test@test.com',
    password: 'test123'
  })
})
.then(r => r.json())
.then(d => console.log('✅ CORS FIXED! Response:', d))
.catch(e => console.error('❌ Still error:', e))
```

**Expected result:**
```
✅ CORS FIXED! Response: {message: "These credentials do not match our records."}
```

This means CORS is working! Just need valid credentials.

---

## 🚨 IF STILL NOT WORKING:

### Option A: Check if Variables are Actually Saved

1. Render Dashboard → Environment tab
2. **Screenshot ALL environment variables**
3. Verify these exist:
   - CORS_ALLOWED_ORIGINS
   - FRONTEND_URL
   - SANCTUM_STATEFUL_DOMAINS

### Option B: Manual Deploy with Cache Clear

1. Render Dashboard
2. Click **"Manual Deploy"** button (top right)
3. Select **"Clear build cache & deploy"**
4. Wait 5-8 minutes

### Option C: Check Render Logs

1. Render Dashboard → "Logs" tab
2. Look for errors
3. Search for "CORS" in logs

---

## 🎯 ALTERNATIVE: Use Wildcard CORS (Quick Test)

**Temporarily allow all origins to test:**

Render → Environment → Add:
```
CORS_ALLOWED_ORIGINS=*
```

Save and wait for redeploy.

**If this works:**
- ✅ CORS config is working
- ❌ Just need correct frontend URL

**Then change back to:**
```
CORS_ALLOWED_ORIGINS=https://ecommerce-dashboard-sigma-one.vercel.app
```

---

## 📋 FINAL CHECKLIST

### ☐ Render Environment Variables:
- ☐ CORS_ALLOWED_ORIGINS = `https://ecommerce-dashboard-sigma-one.vercel.app`
- ☐ FRONTEND_URL = `https://ecommerce-dashboard-sigma-one.vercel.app`
- ☐ SANCTUM_STATEFUL_DOMAINS = `ecommerce-dashboard-sigma-one.vercel.app`
- ☐ SESSION_DOMAIN = `.vercel.app`
- ☐ SESSION_SECURE_COOKIE = `true`

### ☐ Deployment:
- ☐ All variables saved
- ☐ Backend redeployed
- ☐ Status is "Live" (green)
- ☐ Recent "Deploy live" event in Events tab

### ☐ Testing:
- ☐ Hard refresh frontend (Ctrl+Shift+R)
- ☐ Test fetch in console
- ☐ No CORS error
- ☐ Login shows "credentials do not match" (not network error)

---

## 💡 COMMON MISTAKES:

1. **Typo in URL**
   - ❌ `https://ecommerce-dashboard-sigma-one.vercel.app/` (trailing slash)
   - ✅ `https://ecommerce-dashboard-sigma-one.vercel.app`

2. **Wrong domain for SANCTUM**
   - ❌ `https://ecommerce-dashboard-sigma-one.vercel.app`
   - ✅ `ecommerce-dashboard-sigma-one.vercel.app` (no https://)

3. **Didn't wait for redeploy**
   - Must wait 5-8 minutes after saving
   - Check Events tab for "Deploy live"

4. **Browser cache**
   - Must hard refresh (Ctrl+Shift+R)
   - Or open incognito/private window

---

## 🎉 SUCCESS INDICATORS:

### ✅ CORS is Fixed When:
- No "blocked by CORS policy" error in console
- Fetch request completes (even if 401/422 error)
- Login shows "Check your credentials" (not "Network error")

### ❌ CORS Still Broken When:
- "Access to XMLHttpRequest... blocked by CORS policy"
- "net::ERR_FAILED" in Network tab
- "Network error — check your connection"

---

**FOLLOW STEP 2 EXACTLY!** 

Add each environment variable ONE BY ONE, then wait for redeploy!

This WILL work! 💪🚀

# 🧪 Backend Test Guide

## Test 1: Check if Backend is Alive

Open this URL in your browser:
```
https://ecommerce-dashboard-v4dh.onrender.com/
```

**Expected**: Should see API info JSON  
**If 500 error**: Backend has issues  
**If timeout/can't connect**: Backend is down

---

## Test 2: Check Health Endpoint

```
https://ecommerce-dashboard-v4dh.onrender.com/up
```

**Expected**: Should return health status

---

## Test 3: Test Login Endpoint

Use Postman or curl:

```bash
curl -X POST https://ecommerce-dashboard-v4dh.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"admin@company.com","password":"Admin@1234"}'
```

**Expected Success**:
```json
{
  "success": true,
  "data": {
    "token": "...",
    "user": {...}
  }
}
```

**If you get**:
- `500 Server Error` → Backend config issue
- `Network error` → Backend is down or not accessible
- `CORS error` → CORS not configured
- `401 Unauthorized` → Wrong credentials or no data in database

---

## 🔍 Current Status Check:

### Step 1: Check Render Dashboard
1. Go to https://dashboard.render.com
2. Find: **ecommerce-dashboard-v4dh**
3. Check status: Should be **"Live"** (green)
4. Check logs for errors

### Step 2: Check Render Logs
Look for these errors:
- ❌ `SQLSTATE[08006]` → Can't connect to Supabase
- ❌ `No application encryption key` → Missing APP_KEY
- ❌ `Class not found` → Composer issue
- ❌ `Connection refused` → Port issue

### Step 3: Verify Environment Variables
Make sure ALL these are set in Render:

```
APP_KEY=base64:ZkyoqTAQdM+AyCSOUJQYSFd2pM3eZKfAttR1x86eGBE=
APP_ENV=production
APP_DEBUG=false
APP_URL=https://ecommerce-dashboard-v4dh.onrender.com

DB_CONNECTION=pgsql
DB_HOST=db.nsloktulxhqajnixvcim.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=fBQBULI6kAjatufJ
DB_SSLMODE=require
```

---

## 🆘 Common Issues:

### Issue 1: Backend Returns 500
**Solution**: Check Render logs for the actual error

### Issue 2: Network Error / Timeout
**Solution**: 
- Check if Render service is "Live"
- Check if service is sleeping (free tier sleeps after inactivity)
- Wait 30-60 seconds for it to wake up

### Issue 3: CORS Error
**Solution**: Backend needs CORS configured for Vercel domain

### Issue 4: Empty Response
**Solution**: Database has no data - need to seed

---

## 🎯 Next Steps:

1. **Check Render Status** - Is it "Live"?
2. **Check Render Logs** - Any errors?
3. **Test Root URL** - Does it respond?
4. **Share the Error** - What exactly do you see?

---

**Try these tests and share what you see!** 🔍

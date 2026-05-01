# Shopify Integration - URL Flow Diagram

## 🔴 MALI: Using Localhost (Hindi Gagana!)

```
┌─────────────────────────────────────────────────────────────┐
│                    SHOPIFY SERVERS                           │
│                  (sa internet/cloud)                         │
│                                                               │
│  Trying to send webhook...                                   │
│  POST http://localhost:8000/api/v1/webhooks/shopify/...     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ ❌ HINDI MAABOT!
                         │ (localhost is private)
                         │
                         ▼
                    ❌ FAILED
                    
┌─────────────────────────────────────────────────────────────┐
│                  YOUR COMPUTER                               │
│                                                               │
│  http://localhost:8000                                       │
│  ↑                                                            │
│  Only accessible sa computer mo lang                         │
│  Hindi makita ng internet                                    │
└─────────────────────────────────────────────────────────────┘
```

**Result:** ❌ Webhooks fail, integration doesn't work

---

## ✅ TAMA: Using Public HTTPS URL (Gagana!)

### Option 1: Ngrok (For Testing)

```
┌─────────────────────────────────────────────────────────────┐
│                    SHOPIFY SERVERS                           │
│                  (sa internet/cloud)                         │
│                                                               │
│  Sending webhook...                                          │
│  POST https://abc123.ngrok.io/api/v1/webhooks/shopify/...   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ ✅ SUCCESS!
                         │ (public URL, accessible)
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    NGROK TUNNEL                              │
│                  https://abc123.ngrok.io                     │
│                                                               │
│  Receives request from Shopify                               │
│  Forwards to localhost                                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Tunnel/Forward
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  YOUR COMPUTER                               │
│                                                               │
│  http://localhost:8000                                       │
│  ↑                                                            │
│  Receives request via ngrok tunnel                           │
│  Processes webhook                                           │
│  Saves to database                                           │
└─────────────────────────────────────────────────────────────┘
```

**Result:** ✅ Webhooks work, integration successful!

---

### Option 2: Railway/Render (For Production)

```
┌─────────────────────────────────────────────────────────────┐
│                    SHOPIFY SERVERS                           │
│                  (sa internet/cloud)                         │
│                                                               │
│  Sending webhook...                                          │
│  POST https://yourapp.railway.app/api/v1/webhooks/...       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ ✅ SUCCESS!
                         │ (public URL, accessible)
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    RAILWAY/RENDER                            │
│              https://yourapp.railway.app                     │
│                                                               │
│  Your Laravel app running sa cloud                           │
│  Receives request from Shopify                               │
│  Processes webhook                                           │
│  Saves to database                                           │
│                                                               │
│  ✅ Always online                                            │
│  ✅ Permanent URL                                            │
│  ✅ No need for local server                                 │
└─────────────────────────────────────────────────────────────┘
```

**Result:** ✅ Production-ready, always accessible!

---

## 🔄 Complete Integration Flow

### 1. Customer Orders sa Shopify

```
┌─────────────────────────────────────────────────────────────┐
│                    SHOPIFY STORE                             │
│              https://my-store.myshopify.com                  │
│                                                               │
│  Customer:                                                   │
│  1. Browse products                                          │
│  2. Add to cart                                              │
│  3. Checkout                                                 │
│  4. Pay ✅                                                   │
│                                                               │
│  Order #1001 created!                                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Trigger webhook
                         │
                         ▼
```

### 2. Shopify Sends Webhook

```
┌─────────────────────────────────────────────────────────────┐
│                    SHOPIFY WEBHOOK                           │
│                                                               │
│  POST https://yourapp.railway.app/api/v1/webhooks/shopify/  │
│       orders/create                                          │
│                                                               │
│  Headers:                                                    │
│    X-Shopify-Topic: orders/create                           │
│    X-Shopify-Hmac-Sha256: abc123...                         │
│                                                               │
│  Body:                                                       │
│  {                                                            │
│    "id": 1001,                                               │
│    "email": "customer@example.com",                          │
│    "total_price": "99.99",                                   │
│    "line_items": [...]                                       │
│  }                                                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP POST
                         │
                         ▼
```

### 3. Your System Receives & Processes

```
┌─────────────────────────────────────────────────────────────┐
│              YOUR DASHBOARD (Railway/Ngrok)                  │
│                                                               │
│  ShopifyWebhookController:                                   │
│                                                               │
│  1. ✅ Verify HMAC signature                                 │
│  2. ✅ Validate webhook data                                 │
│  3. ✅ Create customer (if new)                              │
│  4. ✅ Create order                                          │
│  5. ✅ Create order items                                    │
│  6. ✅ Update inventory                                      │
│  7. ✅ Send notification                                     │
│  8. ✅ Log sync                                              │
│                                                               │
│  Return: 200 OK                                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Success response
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    SHOPIFY SERVERS                           │
│                                                               │
│  ✅ Webhook delivered successfully                           │
│  ✅ Mark as processed                                        │
└─────────────────────────────────────────────────────────────┘
```

### 4. Admin Sees Order sa Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│              DASHBOARD UI (Browser)                          │
│                                                               │
│  Orders Page:                                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Order #1001                          ₱99.99  Confirmed │ │
│  │ customer@example.com                                   │ │
│  │ 2 items • Paid • From Shopify                         │ │
│  │ [View Details] [Process] [Cancel]                     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ✅ Real-time update (via webhook)                           │
│  ✅ No manual import needed                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 URL Comparison Table

| Feature | Localhost | Ngrok | Railway/Render | Own Domain |
|---------|-----------|-------|----------------|------------|
| **URL Example** | `http://localhost:8000` | `https://abc123.ngrok.io` | `https://app.railway.app` | `https://yourdomain.com` |
| **Accessible from Internet** | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes |
| **HTTPS** | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes |
| **Shopify Compatible** | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes |
| **Setup Time** | 0 min | 5 min | 15 min | 30+ min |
| **Cost** | Free | Free* | Free* | $10-50/mo |
| **Permanent URL** | N/A | ❌ No (free) | ✅ Yes | ✅ Yes |
| **Always Online** | ❌ No | ❌ No | ✅ Yes | ✅ Yes |
| **Best For** | Local dev | Testing | Production | Production |

*Free tier available with limitations

---

## 🎯 Decision Tree: Which URL to Use?

```
START: Need to connect Shopify
│
├─ Testing only? (for now)
│  │
│  └─ YES → Use NGROK
│           ✅ Fast setup (5 min)
│           ✅ Test immediately
│           ⚠️ URL changes on restart
│           
└─ Production ready? (permanent)
   │
   ├─ Have own domain?
   │  │
   │  ├─ YES → Use Own Domain
   │  │         ✅ Professional
   │  │         ✅ Custom branding
   │  │         ⚠️ Need SSL certificate
   │  │         ⚠️ More setup
   │  │
   │  └─ NO → Use Railway/Render
   │            ✅ Free tier
   │            ✅ Permanent URL
   │            ✅ Auto-deploy
   │            ✅ Easy setup
```

---

## 🚀 Quick Start Commands

### Ngrok Setup (5 minutes)

```bash
# Terminal 1: Start Laravel
cd backend
php artisan serve

# Terminal 2: Start Ngrok
ngrok http 8000

# Copy the HTTPS URL
# Example: https://abc123.ngrok.io

# Terminal 3: Update .env
echo "APP_URL=https://abc123.ngrok.io" >> backend/.env
echo "FRONTEND_URL=https://abc123.ngrok.io" >> backend/.env

# Restart Laravel (Terminal 1)
# Ctrl+C, then:
php artisan serve
```

**Use in Shopify:**
```
App URL: https://abc123.ngrok.io
Redirect URL: https://abc123.ngrok.io/api/v1/shopify/callback
```

---

### Railway Setup (15 minutes)

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git push origin main

# 2. Go to railway.app
# 3. Click "New Project"
# 4. Select "Deploy from GitHub"
# 5. Choose your repo
# 6. Wait for deploy
# 7. Click "Generate Domain"
# 8. Copy URL: https://yourapp.railway.app
```

**Use in Shopify:**
```
App URL: https://yourapp.railway.app
Redirect URL: https://yourapp.railway.app/api/v1/shopify/callback
```

---

## ✅ Verification Checklist

Before using URL in Shopify, verify:

```bash
# 1. Check if URL is accessible
curl https://your-url.com

# Should return HTML or JSON (not error)

# 2. Check if HTTPS works
curl -I https://your-url.com

# Should return: HTTP/2 200

# 3. Check if API endpoint exists
curl https://your-url.com/api/health

# Should return: {"status":"ok"}

# 4. Check from external network
# Use phone (disconnect from WiFi, use mobile data)
# Visit: https://your-url.com
# Should load the app
```

---

## 📝 Summary

### The Question:
> "https://yourdomain.com eto ay dapat etong system na to"

### The Answer:

**YES**, pero:

1. **Hindi pwede ang localhost** ❌
   - `http://localhost:8000` - Won't work
   - `http://127.0.0.1:8000` - Won't work

2. **Kailangan ng public HTTPS URL** ✅
   - `https://abc123.ngrok.io` - Works (testing)
   - `https://yourapp.railway.app` - Works (production)
   - `https://yourdomain.com` - Works (own domain)

3. **Choose based on need:**
   - **Now/Testing:** Ngrok (5 min setup)
   - **Production:** Railway/Render (15 min setup)
   - **Professional:** Own domain (30+ min setup)

### Recommended Path:

```
1. Start with Ngrok (today)
   → Test integration
   → Verify everything works

2. Deploy to Railway (tomorrow)
   → Get permanent URL
   → Update Shopify settings
   → Production ready!
```

---

**Ready to proceed?** Choose your URL option and let's continue! 🚀

**Last Updated:** 2026-05-01

# Shopify Integration - Quick Reference Card

## 🎯 Your Question
> "https://yourdomain.com eto ay dapat etong system na to"

## ✅ Short Answer
**YES**, pero kailangan ng **PUBLIC HTTPS URL** (hindi localhost!)

---

## 🚀 Fastest Solution (5 minutes)

### Step 1: Install Ngrok
```bash
# Mac
brew install ngrok

# Windows
# Download from https://ngrok.com/download

# Linux
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc
sudo apt update && sudo apt install ngrok
```

### Step 2: Start Laravel
```bash
cd backend
php artisan serve
# Keep this terminal open
```

### Step 3: Start Ngrok (New Terminal)
```bash
ngrok http 8000
```

### Step 4: Copy URL
```
Forwarding: https://abc123.ngrok.io -> http://localhost:8000
            ↑
            Copy this URL
```

### Step 5: Update .env
```bash
cd backend
nano .env

# Add these lines:
APP_URL=https://abc123.ngrok.io
FRONTEND_URL=https://abc123.ngrok.io
CORS_ALLOWED_ORIGINS=https://abc123.ngrok.io

# Save: Ctrl+O, Enter, Ctrl+X
```

### Step 6: Restart Laravel
```bash
# In Laravel terminal (Ctrl+C to stop)
php artisan serve
```

### Step 7: Fill Shopify Form
```
App URL: https://abc123.ngrok.io
Redirect URL: https://abc123.ngrok.io/api/v1/shopify/callback
```

**DONE!** ✅

---

## 📊 URL Options Comparison

| Option | Time | Cost | Permanent | Best For |
|--------|------|------|-----------|----------|
| **Ngrok** | 5 min | Free | ❌ No | Testing NOW |
| **Railway** | 15 min | Free | ✅ Yes | Production |
| **Render** | 15 min | Free | ✅ Yes | Production |
| **Own Domain** | 30+ min | $10-50/mo | ✅ Yes | Professional |

---

## ❌ Common Mistakes

### MALI (Won't Work):
```
❌ http://localhost:8000
❌ http://127.0.0.1:8000
❌ http://192.168.1.100:8000
❌ http://yourdomain.com (no HTTPS)
```

### TAMA (Will Work):
```
✅ https://abc123.ngrok.io
✅ https://yourapp.railway.app
✅ https://yourapp.onrender.com
✅ https://yourdomain.com (with SSL)
```

---

## 🔄 What Happens After Setup

```
Customer orders sa Shopify
         ↓
Shopify sends webhook
         ↓
https://abc123.ngrok.io/api/v1/webhooks/shopify/orders/create
         ↓
Ngrok forwards to localhost:8000
         ↓
Your Laravel app receives order
         ↓
Order appears sa dashboard
```

**Result:** ✅ Automatic order sync!

---

## 📚 Full Documentation

### Start Here:
1. **ANSWER-TO-YOUR-QUESTION.md** - Direct answer to your question
2. **SHOPIFY-README.md** - Documentation index

### Detailed Guides:
3. **SHOPIFY-URL-SETUP.md** - How to get public URL
4. **SHOPIFY-URL-DIAGRAM.md** - Visual diagrams
5. **SHOPIFY-STEP-BY-STEP.md** - Complete integration guide
6. **INTEGRATION-GUIDE-TAGALOG.md** - Shopify & Amazon overview

---

## 🆘 Troubleshooting

### Problem: "Ngrok URL keeps changing"
**Solution:** 
- Free ngrok changes URL every restart
- Upgrade to paid ($8/mo) for permanent URL
- OR use Railway/Render (free, permanent)

### Problem: "Webhooks not received"
**Solution:**
- Check if ngrok is running
- Check if Laravel is running
- Check .env has correct URL
- Test: `curl https://your-ngrok-url.com`

### Problem: "Invalid signature"
**Solution:**
- Check SHOPIFY_API_SECRET in .env
- Verify webhook verification code
- Check HTTPS (required)

---

## ✅ Checklist

Before filling Shopify form:
```
☐ Ngrok installed
☐ Laravel running (php artisan serve)
☐ Ngrok running (ngrok http 8000)
☐ HTTPS URL copied
☐ .env updated with URL
☐ Laravel restarted
☐ URL accessible (test in browser)
```

After filling Shopify form:
```
☐ App created successfully
☐ API credentials copied
☐ API scopes configured
☐ Webhooks registered
☐ Test order created
☐ Order appears in dashboard
```

---

## 🎯 Next Steps

### Now (5 minutes):
1. ✅ Install ngrok
2. ✅ Get public URL
3. ✅ Fill Shopify form

### Later (2-3 hours):
4. ✅ Complete Shopify integration
5. ✅ Test order sync
6. ✅ Setup webhooks

### Future (optional):
7. ✅ Deploy to Railway (permanent URL)
8. ✅ Update Shopify settings
9. ✅ Production ready!

---

## 💡 Pro Tips

### Tip 1: Keep Terminals Open
```
Terminal 1: php artisan serve (Laravel)
Terminal 2: ngrok http 8000 (Ngrok)
Terminal 3: Your commands
```

### Tip 2: Bookmark Ngrok URL
```
# Ngrok web interface
http://127.0.0.1:4040

# Shows all requests
# Useful for debugging webhooks
```

### Tip 3: Test Before Shopify
```bash
# Test if URL is accessible
curl https://your-ngrok-url.com

# Should return HTML (not error)
```

### Tip 4: Save Ngrok URL
```bash
# Create a file to remember URL
echo "https://abc123.ngrok.io" > ngrok-url.txt

# Later, read it
cat ngrok-url.txt
```

---

## 🔗 Quick Links

### Tools:
- **Ngrok:** https://ngrok.com/
- **Railway:** https://railway.app/
- **Render:** https://render.com/

### Shopify:
- **Partner Dashboard:** https://partners.shopify.com/
- **API Docs:** https://shopify.dev/docs/api

### Your System:
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:8000
- **Ngrok Web UI:** http://127.0.0.1:4040

---

## 📞 Need Help?

### Read These:
1. **ANSWER-TO-YOUR-QUESTION.md** - Direct answer
2. **SHOPIFY-URL-SETUP.md** - Detailed setup
3. **SHOPIFY-STEP-BY-STEP.md** - Complete guide

### Common Questions:
- **Q:** Kailangan ba talaga ng HTTPS?
  **A:** Yes! Shopify requires HTTPS for security.

- **Q:** Pwede ba ang localhost?
  **A:** No! Shopify can't reach localhost.

- **Q:** Magkano ang ngrok?
  **A:** Free for testing, $8/month for permanent URL.

- **Q:** Ano ang pinakamabilis?
  **A:** Ngrok - 5 minutes lang!

---

## 🎉 Summary

```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│  YOUR QUESTION:                                              │
│  "https://yourdomain.com eto ay dapat etong system na to"   │
│                                                               │
│  ANSWER:                                                     │
│  YES, pero kailangan ng PUBLIC HTTPS URL                    │
│                                                               │
│  SOLUTION:                                                   │
│  1. Install ngrok (5 min)                                   │
│  2. Get URL: https://abc123.ngrok.io                        │
│  3. Use sa Shopify form                                     │
│                                                               │
│  RESULT:                                                     │
│  ✅ Shopify integration working!                            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

**Ready?** Install ngrok and let's go! 🚀

**Last Updated:** 2026-05-01

# Shopify Setup Quick Checklist ✅

## 📋 BEFORE YOU START

Get these URLs ready:
- ✅ Backend: `https://ecommerce-dashboard-v4dh.onrender.com`
- ✅ Frontend: `https://your-frontend-url.vercel.app` (from Vercel dashboard)

---

## ⚡ QUICK SETUP (15 MINUTES)

### ☐ STEP 1: Shopify Partner Account (2 min)
1. Go to https://partners.shopify.com
2. Sign up / Log in
3. Verify email

### ☐ STEP 2: Create App (3 min)
1. Partners → Apps → Create app
2. App name: `eCommerce Dashboard`
3. App URL: `https://your-frontend-url.vercel.app`
4. **SAVE API KEY & SECRET!**

### ☐ STEP 3: Configure App (2 min)
1. Configuration → App URL: `https://your-frontend-url.vercel.app`
2. Redirect URL: `https://ecommerce-dashboard-v4dh.onrender.com/api/v1/shopify/callback`
3. API Scopes: Select all (products, orders, customers, inventory, analytics)
4. Save

### ☐ STEP 4: Update Backend (3 min)
1. Go to https://dashboard.render.com
2. Click backend service
3. Environment tab → Add:
   ```
   SHOPIFY_API_KEY=your_key
   SHOPIFY_API_SECRET=your_secret
   FRONTEND_URL=https://your-frontend-url.vercel.app
   CORS_ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
   SANCTUM_STATEFUL_DOMAINS=your-frontend-url.vercel.app
   ```
4. Save (auto-redeploys)

### ☐ STEP 5: Create Development Store (2 min)
1. Partners → Stores → Add store
2. Development store
3. Store name: `my-test-store`
4. Create

### ☐ STEP 6: Install App (1 min)
1. Partners → Your App → Test your app
2. Select your store
3. Install app
4. Authorize

### ☐ STEP 7: Setup Webhooks (2 min)
Add these 4 webhooks in App Configuration:

```
1. orders/create → .../api/v1/shopify/webhooks/orders/create
2. orders/updated → .../api/v1/shopify/webhooks/orders/update
3. products/create → .../api/v1/shopify/webhooks/products/create
4. products/update → .../api/v1/shopify/webhooks/products/update
```

### ☐ STEP 8: Test! (2 min)
1. Open frontend dashboard
2. Create test product in Shopify
3. Check if it appears in dashboard
4. ✅ DONE!

---

## 🎯 QUICK REFERENCE

### Your URLs:
```
Frontend: https://your-frontend-url.vercel.app
Backend: https://ecommerce-dashboard-v4dh.onrender.com
Shopify Store: https://your-store.myshopify.com
```

### API Scopes Needed:
- read_products, write_products
- read_orders, write_orders
- read_customers
- read_inventory
- read_analytics

### Webhook Events:
- orders/create
- orders/updated
- products/create
- products/update

---

## 🚨 TROUBLESHOOTING

**App won't install?**
→ Check API key/secret in Render

**CORS errors?**
→ Update CORS_ALLOWED_ORIGINS and redeploy

**Webhooks failing?**
→ Check webhook URLs are correct

**Dashboard not loading data?**
→ Check browser console for errors

---

## 📚 DETAILED GUIDE

For step-by-step instructions with screenshots, read:
**`SHOPIFY-SETUP-COMPLETE.md`**

---

**TOTAL TIME: 15 MINUTES** ⚡

**START NOW!** 🚀

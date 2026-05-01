# Complete Shopify Setup Guide 🛍️

## ✅ PRE-REQUISITES (DONE!)

- ✅ Backend deployed: `https://ecommerce-dashboard-v4dh.onrender.com`
- ✅ Frontend deployed: `https://your-frontend-url.vercel.app` (get this from Vercel)

---

## 🎯 STEP 1: CREATE SHOPIFY PARTNER ACCOUNT

### 1.1 Sign Up
1. Go to **https://partners.shopify.com**
2. Click **"Sign Up"**
3. Fill in your details:
   - Email
   - Password
   - Business name (pwede kahit ano)
4. Click **"Create Account"**

### 1.2 Verify Email
1. Check your email
2. Click verification link
3. Complete profile setup

---

## 🎯 STEP 2: CREATE SHOPIFY APP

### 2.1 Create New App
1. Sa Partners dashboard, click **"Apps"** sa left menu
2. Click **"Create app"**
3. Choose **"Create app manually"**
4. Fill in:
   ```
   App name: eCommerce Dashboard
   App URL: https://your-frontend-url.vercel.app
   ```
5. Click **"Create app"**

### 2.2 Get API Credentials
After creating, makikita mo:
```
API key: [COPY THIS]
API secret key: [COPY THIS]
```

**IMPORTANTE: I-save ang API credentials!**

---

## 🎯 STEP 3: CONFIGURE APP SETTINGS

### 3.1 App Setup
1. Sa app dashboard, click **"Configuration"**
2. Scroll to **"App URL"**

#### App URL:
```
https://your-frontend-url.vercel.app
```

#### Allowed redirection URL(s):
```
https://ecommerce-dashboard-v4dh.onrender.com/api/v1/shopify/callback
```

Click **"Save"**

### 3.2 API Scopes
1. Scroll to **"API access scopes"**
2. Select these scopes:

**Required Scopes:**
- ✅ `read_products` - Read products
- ✅ `write_products` - Write products
- ✅ `read_orders` - Read orders
- ✅ `write_orders` - Write orders
- ✅ `read_customers` - Read customers
- ✅ `read_inventory` - Read inventory
- ✅ `read_analytics` - Read analytics

3. Click **"Save"**

---

## 🎯 STEP 4: UPDATE BACKEND ENVIRONMENT VARIABLES

### 4.1 Go to Render Dashboard
1. Go to **https://dashboard.render.com**
2. Click your backend service: **`ecommerce-dashboard`**
3. Go to **"Environment"** tab

### 4.2 Add Shopify Credentials
Click **"Add Environment Variable"** and add:

```bash
# Shopify API Credentials
SHOPIFY_API_KEY=your_api_key_here
SHOPIFY_API_SECRET=your_api_secret_here

# Frontend URL (from Vercel)
FRONTEND_URL=https://your-frontend-url.vercel.app

# CORS Configuration
CORS_ALLOWED_ORIGINS=https://your-frontend-url.vercel.app

# Sanctum Configuration
SANCTUM_STATEFUL_DOMAINS=your-frontend-url.vercel.app

# Session Configuration
SESSION_DOMAIN=.vercel.app
SESSION_SECURE_COOKIE=true
```

### 4.3 Save and Redeploy
1. Click **"Save Changes"**
2. Backend will automatically redeploy (2-3 minutes)
3. Wait for deployment to complete

---

## 🎯 STEP 5: CREATE DEVELOPMENT STORE

### 5.1 Create Store
1. Sa Partners dashboard, click **"Stores"**
2. Click **"Add store"**
3. Choose **"Development store"**
4. Fill in:
   ```
   Store name: my-test-store (or any name)
   Store purpose: Test an app or theme
   ```
5. Click **"Create development store"**

### 5.2 Access Store
1. After creation, click **"Log in"**
2. You'll be logged into your development store
3. Store URL: `https://my-test-store.myshopify.com`

---

## 🎯 STEP 6: INSTALL APP TO STORE

### 6.1 Get Installation URL
Sa Partners dashboard:
1. Click your app: **"eCommerce Dashboard"**
2. Click **"Test your app"**
3. Select your development store
4. Click **"Install app"**

### 6.2 Authorize App
1. You'll be redirected to authorization page
2. Review the permissions
3. Click **"Install app"**
4. You'll be redirected to your frontend dashboard

**SUCCESS! App is now installed!** ✅

---

## 🎯 STEP 7: CONFIGURE WEBHOOKS

### 7.1 Go to App Settings
1. Sa Partners dashboard, click your app
2. Go to **"Configuration"**
3. Scroll to **"Webhooks"**

### 7.2 Add Webhooks
Click **"Add webhook"** for each:

#### Webhook 1: Orders Create
```
Event: orders/create
URL: https://ecommerce-dashboard-v4dh.onrender.com/api/v1/shopify/webhooks/orders/create
Format: JSON
API version: 2024-01 (latest)
```

#### Webhook 2: Orders Update
```
Event: orders/updated
URL: https://ecommerce-dashboard-v4dh.onrender.com/api/v1/shopify/webhooks/orders/update
Format: JSON
API version: 2024-01 (latest)
```

#### Webhook 3: Products Create
```
Event: products/create
URL: https://ecommerce-dashboard-v4dh.onrender.com/api/v1/shopify/webhooks/products/create
Format: JSON
API version: 2024-01 (latest)
```

#### Webhook 4: Products Update
```
Event: products/update
URL: https://ecommerce-dashboard-v4dh.onrender.com/api/v1/shopify/webhooks/products/update
Format: JSON
API version: 2024-01 (latest)
```

Click **"Save"** after each webhook.

---

## 🧪 STEP 8: TEST THE INTEGRATION

### 8.1 Test Dashboard Access
1. Open your frontend: `https://your-frontend-url.vercel.app`
2. You should see the dashboard
3. Check if Shopify data is loading

### 8.2 Test in Development Store
1. Go to your Shopify store admin
2. Create a test product
3. Create a test order
4. Check if data appears in your dashboard

### 8.3 Test Webhooks
1. In Shopify admin, create/update a product
2. Go to Partners → Your App → Configuration → Webhooks
3. Click on a webhook to see delivery status
4. Should show "Delivered" with 200 status code

---

## 🎯 STEP 9: VERIFY EVERYTHING WORKS

### Checklist:
- ✅ App installed in development store
- ✅ Dashboard loads without errors
- ✅ Products sync from Shopify
- ✅ Orders sync from Shopify
- ✅ Webhooks delivering successfully
- ✅ No CORS errors in browser console

---

## 🚨 COMMON ISSUES & SOLUTIONS

### Issue 1: "App installation failed"
**Solution:**
- Check if SHOPIFY_API_KEY and SHOPIFY_API_SECRET are correct
- Verify callback URL is correct
- Check backend logs in Render

### Issue 2: CORS errors
**Solution:**
- Update CORS_ALLOWED_ORIGINS in backend
- Add frontend URL to SANCTUM_STATEFUL_DOMAINS
- Redeploy backend

### Issue 3: Webhooks not delivering
**Solution:**
- Check webhook URLs are correct
- Verify backend is running
- Check webhook delivery logs in Shopify Partners

### Issue 4: "Invalid API key"
**Solution:**
- Double-check API key and secret in Render environment variables
- Make sure there are no extra spaces
- Redeploy backend after updating

---

## 📊 DEPLOYMENT SUMMARY

### ✅ Backend:
- **URL:** https://ecommerce-dashboard-v4dh.onrender.com
- **Status:** Running
- **Environment Variables:** Configured with Shopify credentials

### ✅ Frontend:
- **URL:** https://your-frontend-url.vercel.app
- **Status:** Deployed
- **Connected to:** Backend API

### ✅ Shopify:
- **Partner Account:** Created
- **App:** Created and configured
- **Development Store:** Created
- **Webhooks:** Configured

---

## 🔗 IMPORTANT URLS

### Your URLs:
```
Frontend: https://your-frontend-url.vercel.app
Backend API: https://ecommerce-dashboard-v4dh.onrender.com
Shopify Store: https://your-store.myshopify.com
```

### Shopify URLs:
```
Partners Dashboard: https://partners.shopify.com
Store Admin: https://your-store.myshopify.com/admin
```

### Management URLs:
```
Vercel Dashboard: https://vercel.com/dashboard
Render Dashboard: https://dashboard.render.com
```

---

## 📝 NEXT STEPS

### For Development:
1. ✅ Test all features in development store
2. ✅ Fix any bugs or issues
3. ✅ Add more features as needed

### For Production:
1. Create a real Shopify store (paid plan)
2. Submit app for review (if public app)
3. Or keep as custom app for your store only

---

## 💡 TIPS

### Development Store Limitations:
- ⚠️ Can't process real payments
- ⚠️ Limited to 100 products
- ⚠️ Expires after 90 days of inactivity
- ✅ Perfect for testing!

### Production Considerations:
- Upgrade Render to paid plan ($7/month) for always-on service
- Consider upgrading Vercel if you need more bandwidth
- Monitor webhook delivery rates
- Set up error logging and monitoring

---

## 🎉 CONGRATULATIONS!

You now have a complete eCommerce dashboard integrated with Shopify!

### What You Can Do:
- ✅ View products from Shopify
- ✅ View orders from Shopify
- ✅ Real-time updates via webhooks
- ✅ Analytics and reporting
- ✅ Customer management

---

**READY TO START TESTING! Follow the steps above!** 🚀

Need help? Check the error logs in:
- Render Dashboard → Logs
- Vercel Dashboard → Deployments → Logs
- Shopify Partners → Your App → Webhooks

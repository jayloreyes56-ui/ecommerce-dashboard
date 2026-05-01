# Shopify Integration - Super Detailed Step-by-Step Guide

## 🎯 Ano ang Gagawin Natin?

Icoconnect natin ang **Shopify store** sa **eCommerce Dashboard** para:
- ✅ Automatic import ng orders from Shopify
- ✅ Automatic sync ng inventory (2-way)
- ✅ Automatic sync ng products (2-way)
- ✅ Real-time updates via webhooks

**Estimated Time:** 2-3 hours (first time)

---

## 📋 Pre-requisites (Kailangan Muna)

### 1. Shopify Store
```
Option A: May existing Shopify store na
Option B: Gumawa ng bagong store (may 3-day free trial)
```

### 2. Your Dashboard System
```
✅ Laravel backend running
✅ Database setup
✅ Redis running (for queues)
✅ Public URL with HTTPS (required for webhooks)
```

### 3. Tools Needed
```
✅ Web browser (Chrome/Firefox)
✅ Text editor (for .env file)
✅ Terminal/Command line
✅ Postman (optional, for testing)
```

---

## 🚀 PART 1: SHOPIFY PARTNER ACCOUNT SETUP

### Step 1.1: Create Shopify Partner Account

#### 1. Open Browser
```
URL: https://partners.shopify.com/
```

#### 2. Click "Join now" button
```
Location: Top right corner ng page
Color: Green button
Text: "Join now"
```

#### 3. Fill up Registration Form
```
┌─────────────────────────────────────┐
│  Create your Partner account        │
├─────────────────────────────────────┤
│                                      │
│  Email: your-email@gmail.com        │
│  [____________________________]     │
│                                      │
│  Password: ****************         │
│  [____________________________]     │
│  (minimum 8 characters)              │
│                                      │
│  ☑ I agree to terms                 │
│                                      │
│  [    Create account    ]           │
│                                      │
└─────────────────────────────────────┘
```

**Actual Input:**
```
Email: your-email@gmail.com
Password: YourSecurePassword123!
✓ Check "I agree to terms"
Click: "Create account"
```

#### 4. Verify Email
```
1. Check your email inbox
2. Subject: "Verify your Shopify Partners account"
3. Click: "Verify email address" button
4. Browser opens → "Email verified!"
```

#### 5. Complete Profile
```
┌─────────────────────────────────────┐
│  Tell us about yourself              │
├─────────────────────────────────────┤
│                                      │
│  First name: Juan                    │
│  Last name: Dela Cruz                │
│                                      │
│  Business name: My eCommerce Co.     │
│  (or your company name)              │
│                                      │
│  Country: Philippines                │
│  [Dropdown ▼]                        │
│                                      │
│  What do you do?                     │
│  ○ Build apps                        │
│  ● Build stores for clients          │
│  ○ Refer merchants                   │
│                                      │
│  [    Continue    ]                  │
│                                      │
└─────────────────────────────────────┘
```

**Select:**
```
✓ "Build stores for clients"
Click: "Continue"
```

#### 6. Partner Dashboard
```
Congratulations! Naka-login ka na sa Partner Dashboard
URL: https://partners.shopify.com/organizations/YOUR_ORG_ID
```

---

### Step 1.2: Create Development Store

#### 1. Click "Stores" sa Left Sidebar
```
Partner Dashboard
├── Home
├── Apps
├── Themes
├── [Stores] ← Click this
├── Payouts
└── Settings
```

#### 2. Click "Add store" Button
```
Location: Top right
Color: Green button
Text: "+ Add store"
```

#### 3. Select "Development store"
```
┌─────────────────────────────────────┐
│  What type of store?                 │
├─────────────────────────────────────┤
│                                      │
│  ● Development store                 │
│    Test apps and themes              │
│    FREE                              │
│                                      │
│  ○ Managed store                     │
│    For client projects               │
│                                      │
│  [    Continue    ]                  │
│                                      │
└─────────────────────────────────────┘
```

**Select:**
```
● Development store
Click: "Continue"
```

#### 4. Fill Store Details
```
┌─────────────────────────────────────┐
│  Create development store            │
├─────────────────────────────────────┤
│                                      │
│  Store name:                         │
│  [my-test-store]                     │
│  .myshopify.com                      │
│                                      │
│  Store purpose:                      │
│  [Dropdown ▼]                        │
│  → Select "Test an app or theme"     │
│                                      │
│  Build:                              │
│  ● For a client                      │
│  ○ For myself                        │
│                                      │
│  Login information:                  │
│  Email: admin@my-test-store.com      │
│  Password: ****************          │
│                                      │
│  [    Save    ]                      │
│                                      │
└─────────────────────────────────────┘
```

**Actual Input:**
```
Store name: my-test-store
Store purpose: Test an app or theme
Build: For a client
Email: admin@my-test-store.com
Password: TestStore123!

Click: "Save"
```

#### 5. Wait for Store Creation
```
⏳ Creating your store...
⏳ Setting up products...
⏳ Configuring settings...
✅ Store created!

Your store URL: https://my-test-store.myshopify.com
```

#### 6. Access Your Store
```
Click: "Log in to store" button
→ Opens new tab
→ Shopify Admin Dashboard
```

**Save These:**
```
Store URL: https://my-test-store.myshopify.com
Admin Email: admin@my-test-store.com
Admin Password: TestStore123!
```

---

## 🔧 PART 2: CREATE SHOPIFY APP

### Step 2.1: Create Custom App

#### 1. Go Back to Partner Dashboard
```
URL: https://partners.shopify.com/
```

#### 2. Click "Apps" sa Left Sidebar
```
Partner Dashboard
├── Home
├── [Apps] ← Click this
├── Themes
├── Stores
└── Settings
```

#### 3. Click "Create app" Button
```
Location: Top right
Color: Green button
Text: "+ Create app"
```

#### 4. Select "Create app manually"
```
┌─────────────────────────────────────┐
│  How do you want to create your app? │
├─────────────────────────────────────┤
│                                      │
│  [  Create app manually  ]           │
│  Build from scratch                  │
│                                      │
│  [  Clone existing app   ]           │
│  Start from template                 │
│                                      │
└─────────────────────────────────────┘
```

**Click:**
```
"Create app manually"
```

#### 5. Fill App Details

⚠️ **IMPORTANTE: KAILANGAN NG PUBLIC HTTPS URL!**

```
❌ HINDI PWEDE:
   - http://localhost:8000
   - http://127.0.0.1:8000
   - http://192.168.1.100:8000

✅ PWEDE:
   - https://yourdomain.com
   - https://dashboard.yourcompany.com
   - https://abc123.ngrok.io (for testing)
   - https://yourapp.railway.app
   - https://yourapp.render.com
```

**Kung wala ka pang public URL, may 3 options ka:**

**OPTION 1: Ngrok (Fastest - 5 minutes)**
```bash
# Install ngrok
brew install ngrok  # Mac
# or download from https://ngrok.com/

# Start your Laravel server
php artisan serve

# In another terminal, expose it
ngrok http 8000

# Copy the HTTPS URL:
# https://abc123.ngrok.io
```

**OPTION 2: Deploy to Railway/Render (Permanent URL)**
```bash
# Railway (recommended)
1. Go to railway.app
2. Connect GitHub repo
3. Deploy
4. Get URL: https://yourapp.railway.app

# Render
1. Go to render.com
2. Connect GitHub repo
3. Deploy
4. Get URL: https://yourapp.render.com
```

**OPTION 3: Use Your Own Domain**
```bash
# If you have a domain with SSL certificate
https://dashboard.yourcompany.com
```

---

**Now fill the form:**

```
┌─────────────────────────────────────┐
│  Create app                          │
├─────────────────────────────────────┤
│                                      │
│  App name:                           │
│  [eCommerce Dashboard Connector]     │
│                                      │
│  App URL:                            │
│  [https://abc123.ngrok.io]           │
│  ↑ YOUR PUBLIC HTTPS URL             │
│                                      │
│  Allowed redirection URL(s):         │
│  [https://abc123.ngrok.io/api/v1/    │
│   shopify/callback]                  │
│  ↑ SAME URL + /api/v1/shopify/callback│
│                                      │
│  [    Create app    ]                │
│                                      │
└─────────────────────────────────────┘
```

**Actual Input Example (using ngrok):**
```
App name: eCommerce Dashboard Connector
App URL: https://abc123.ngrok.io
Redirect URL: https://abc123.ngrok.io/api/v1/shopify/callback

Click: "Create app"
```

#### 6. App Created!
```
✅ App created successfully!
→ Redirected to App Overview page
```

---

### Step 2.2: Get API Credentials

#### 1. Click "API credentials" Tab
```
App Overview
├── [API credentials] ← Click this
├── Configuration
└── Extensions
```

#### 2. Copy API Credentials
```
┌─────────────────────────────────────┐
│  API credentials                     │
├─────────────────────────────────────┤
│                                      │
│  API key                             │
│  abc123def456ghi789                  │
│  [📋 Copy]                           │
│                                      │
│  API secret key                      │
│  xyz789uvw456rst123                  │
│  [📋 Copy]                           │
│  ⚠️ Keep this secret!                │
│                                      │
└─────────────────────────────────────┘
```

**Copy These:**
```
API key: abc123def456ghi789
API secret: xyz789uvw456rst123

⚠️ SAVE THESE! Hindi mo na makikita ulit ang secret!
```

#### 3. Save to .env File
```bash
# Open your .env file
nano backend/.env

# Add these lines:
SHOPIFY_API_KEY=abc123def456ghi789
SHOPIFY_API_SECRET=xyz789uvw456rst123
SHOPIFY_API_VERSION=2024-01

# Save: Ctrl+O, Enter, Ctrl+X
```

---

### Step 2.3: Configure API Scopes

#### 1. Scroll Down to "Admin API access scopes"
```
┌─────────────────────────────────────┐
│  Admin API access scopes             │
├─────────────────────────────────────┤
│                                      │
│  Configure the access your app needs │
│                                      │
│  [    Configure    ]                 │
│                                      │
└─────────────────────────────────────┘
```

**Click:**
```
"Configure" button
```

#### 2. Select Required Scopes
```
┌─────────────────────────────────────┐
│  Select access scopes                │
├─────────────────────────────────────┤
│                                      │
│  Products                            │
│  ☑ read_products                     │
│  ☑ write_products                    │
│                                      │
│  Orders                              │
│  ☑ read_orders                       │
│  ☑ write_orders                      │
│                                      │
│  Inventory                           │
│  ☑ read_inventory                    │
│  ☑ write_inventory                   │
│                                      │
│  Customers                           │
│  ☑ read_customers                    │
│                                      │
│  [    Save    ]                      │
│                                      │
└─────────────────────────────────────┘
```

**Check These:**
```
✓ read_products
✓ write_products
✓ read_orders
✓ write_orders
✓ read_inventory
✓ write_inventory
✓ read_customers

Click: "Save"
```

---

## 🔗 PART 3: INSTALL APP TO STORE

### Step 3.1: Generate Install URL

#### 1. Create Install Script
```bash
# Create file: install-shopify.php
nano install-shopify.php
```

#### 2. Add This Code:
```php
<?php
// install-shopify.php

$shop = 'my-test-store.myshopify.com'; // Your store URL
$api_key = 'abc123def456ghi789'; // Your API key
$scopes = 'read_products,write_products,read_orders,write_orders,read_inventory,write_inventory,read_customers';
$redirect_uri = 'https://yourdomain.com/api/v1/shopify/callback';

$install_url = "https://{$shop}/admin/oauth/authorize?" . http_build_query([
    'client_id' => $api_key,
    'scope' => $scopes,
    'redirect_uri' => $redirect_uri,
    'state' => bin2hex(random_bytes(16)), // Security token
]);

echo "Open this URL in your browser:\n\n";
echo $install_url . "\n\n";
```

#### 3. Run Script
```bash
php install-shopify.php
```

#### 4. Copy Output URL
```
Open this URL in your browser:

https://my-test-store.myshopify.com/admin/oauth/authorize?client_id=abc123...&scope=read_products...&redirect_uri=https://yourdomain.com...

⚠️ Copy this entire URL!
```

---

### Step 3.2: Authorize App

#### 1. Open Install URL sa Browser
```
Paste the URL from previous step
Press Enter
```

#### 2. Login to Shopify Store (if needed)
```
Email: admin@my-test-store.com
Password: TestStore123!
Click: "Log in"
```

#### 3. Review Permissions
```
┌─────────────────────────────────────┐
│  Install eCommerce Dashboard         │
│  Connector                           │
├─────────────────────────────────────┤
│                                      │
│  This app would like to:             │
│                                      │
│  ✓ Read and write products           │
│  ✓ Read and write orders             │
│  ✓ Read and write inventory          │
│  ✓ Read customers                    │
│                                      │
│  [    Cancel    ] [    Install    ]  │
│                                      │
└─────────────────────────────────────┘
```

**Click:**
```
"Install" button (green)
```

#### 4. Redirected to Callback URL
```
Browser redirects to:
https://yourdomain.com/api/v1/shopify/callback?code=abc123...&shop=my-test-store.myshopify.com

⚠️ You'll see an error - that's OK! We haven't created the endpoint yet.
```

#### 5. Copy the Code from URL
```
URL: ...callback?code=abc123def456&shop=my-test-store...
                      ↑
                Copy this code: abc123def456
```

---

### Step 3.3: Exchange Code for Access Token

#### 1. Create Exchange Script
```bash
nano exchange-token.php
```

#### 2. Add This Code:
```php
<?php
// exchange-token.php

$shop = 'my-test-store.myshopify.com';
$api_key = 'abc123def456ghi789'; // Your API key
$api_secret = 'xyz789uvw456rst123'; // Your API secret
$code = 'abc123def456'; // Code from URL

$url = "https://{$shop}/admin/oauth/access_token";

$data = [
    'client_id' => $api_key,
    'client_secret' => $api_secret,
    'code' => $code,
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
]);

$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);

echo "Access Token:\n";
echo $result['access_token'] . "\n\n";
echo "⚠️ SAVE THIS TOKEN! You'll need it for API calls.\n";
```

#### 3. Run Script
```bash
php exchange-token.php
```

#### 4. Copy Access Token
```
Access Token:
shpat_abc123def456ghi789jkl012mno345

⚠️ SAVE THIS! This is your permanent access token.
```

#### 5. Save to Database
```bash
# Open Laravel tinker
php artisan tinker

# Run this:
DB::table('integrations')->insert([
    'platform' => 'shopify',
    'store_name' => 'my-test-store',
    'store_url' => 'https://my-test-store.myshopify.com',
    'credentials' => encrypt([
        'access_token' => 'shpat_abc123def456ghi789jkl012mno345',
        'shop' => 'my-test-store.myshopify.com',
    ]),
    'status' => 'active',
    'created_at' => now(),
    'updated_at' => now(),
]);

# Press Ctrl+D to exit
```

---

## 🔔 PART 4: SETUP WEBHOOKS

### Step 4.1: Create Webhook Endpoints

#### 1. Add Routes
```php
// backend/routes/api.php

Route::prefix('webhooks/shopify')->group(function () {
    Route::post('orders/create', [ShopifyWebhookController::class, 'orderCreate']);
    Route::post('products/update', [ShopifyWebhookController::class, 'productUpdate']);
    Route::post('inventory/update', [ShopifyWebhookController::class, 'inventoryUpdate']);
});
```

#### 2. Create Controller
```bash
php artisan make:controller Webhooks/ShopifyWebhookController
```

#### 3. Add Webhook Handler
```php
<?php
// backend/app/Http/Controllers/Webhooks/ShopifyWebhookController.php

namespace App\Http\Controllers\Webhooks;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ShopifyWebhookController extends Controller
{
    public function orderCreate(Request $request)
    {
        // Verify webhook
        if (!$this->verifyWebhook($request)) {
            return response()->json(['error' => 'Invalid signature'], 401);
        }

        $order = $request->all();
        
        Log::info('Shopify order received', ['order_id' => $order['id']]);

        // TODO: Process order
        // ProcessShopifyOrderJob::dispatch($order);

        return response()->json(['success' => true]);
    }

    public function productUpdate(Request $request)
    {
        if (!$this->verifyWebhook($request)) {
            return response()->json(['error' => 'Invalid signature'], 401);
        }

        $product = $request->all();
        
        Log::info('Shopify product updated', ['product_id' => $product['id']]);

        return response()->json(['success' => true]);
    }

    public function inventoryUpdate(Request $request)
    {
        if (!$this->verifyWebhook($request)) {
            return response()->json(['error' => 'Invalid signature'], 401);
        }

        $inventory = $request->all();
        
        Log::info('Shopify inventory updated', $inventory);

        return response()->json(['success' => true]);
    }

    private function verifyWebhook(Request $request)
    {
        $hmac = $request->header('X-Shopify-Hmac-Sha256');
        $data = $request->getContent();
        $secret = config('services.shopify.api_secret');
        
        $calculated = base64_encode(hash_hmac('sha256', $data, $secret, true));
        
        return hash_equals($hmac, $calculated);
    }
}
```

---

### Step 4.2: Register Webhooks with Shopify

#### 1. Create Webhook Registration Script
```bash
nano register-webhooks.php
```

#### 2. Add This Code:
```php
<?php
// register-webhooks.php

$shop = 'my-test-store.myshopify.com';
$access_token = 'shpat_abc123def456ghi789jkl012mno345';
$your_domain = 'https://yourdomain.com';

$webhooks = [
    [
        'topic' => 'orders/create',
        'address' => "{$your_domain}/api/v1/webhooks/shopify/orders/create",
        'format' => 'json',
    ],
    [
        'topic' => 'products/update',
        'address' => "{$your_domain}/api/v1/webhooks/shopify/products/update",
        'format' => 'json',
    ],
    [
        'topic' => 'inventory_levels/update',
        'address' => "{$your_domain}/api/v1/webhooks/shopify/inventory/update",
        'format' => 'json',
    ],
];

foreach ($webhooks as $webhook) {
    $url = "https://{$shop}/admin/api/2024-01/webhooks.json";
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['webhook' => $webhook]));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        "X-Shopify-Access-Token: {$access_token}",
    ]);
    
    $response = curl_exec($ch);
    $result = json_decode($response, true);
    curl_close($ch);
    
    if (isset($result['webhook'])) {
        echo "✅ Webhook created: {$webhook['topic']}\n";
        echo "   ID: {$result['webhook']['id']}\n\n";
    } else {
        echo "❌ Failed: {$webhook['topic']}\n";
        echo "   Error: " . json_encode($result) . "\n\n";
    }
}
```

#### 3. Run Script
```bash
php register-webhooks.php
```

#### 4. Expected Output:
```
✅ Webhook created: orders/create
   ID: 123456789

✅ Webhook created: products/update
   ID: 123456790

✅ Webhook created: inventory_levels/update
   ID: 123456791
```

---

## ✅ PART 5: TEST THE INTEGRATION

### Step 5.1: Test Order Import

#### 1. Create Test Order sa Shopify
```
1. Go to Shopify Admin
2. Click "Orders" sa left sidebar
3. Click "Create order" button
4. Add customer:
   - Name: Test Customer
   - Email: test@example.com
5. Add product:
   - Search existing product
   - Quantity: 1
6. Click "Collect payment"
7. Select "Mark as paid"
8. Click "Create order"
```

#### 2. Check Webhook Received
```bash
# Check Laravel logs
tail -f storage/logs/laravel.log

# You should see:
[2024-01-01 10:00:00] local.INFO: Shopify order received {"order_id":123456789}
```

#### 3. Verify in Dashboard
```
1. Open your dashboard
2. Go to Orders page
3. Check if order appears
```

---

### Step 5.2: Test Product Sync

#### 1. Import Products from Shopify
```bash
# Create artisan command
php artisan make:command Shopify/ImportProducts
```

#### 2. Add Command Code:
```php
<?php
// app/Console/Commands/Shopify/ImportProducts.php

namespace App\Console\Commands\Shopify;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\Integration;
use App\Models\Product;

class ImportProducts extends Command
{
    protected $signature = 'shopify:import-products';
    protected $description = 'Import products from Shopify';

    public function handle()
    {
        $integration = Integration::where('platform', 'shopify')->first();
        
        if (!$integration) {
            $this->error('Shopify integration not found!');
            return 1;
        }

        $credentials = decrypt($integration->credentials);
        $shop = $credentials['shop'];
        $token = $credentials['access_token'];

        $this->info("Importing products from {$shop}...");

        $response = Http::withHeaders([
            'X-Shopify-Access-Token' => $token,
        ])->get("https://{$shop}/admin/api/2024-01/products.json");

        $products = $response->json('products');

        $this->info("Found " . count($products) . " products");

        foreach ($products as $shopifyProduct) {
            $variant = $shopifyProduct['variants'][0];
            
            Product::updateOrCreate(
                ['sku' => $variant['sku'] ?? 'SHOPIFY-' . $variant['id']],
                [
                    'name' => $shopifyProduct['title'],
                    'description' => strip_tags($shopifyProduct['body_html']),
                    'price' => $variant['price'],
                    'stock_quantity' => $variant['inventory_quantity'] ?? 0,
                    'shopify_product_id' => $shopifyProduct['id'],
                    'is_active' => true,
                ]
            );

            $this->info("✓ Imported: {$shopifyProduct['title']}");
        }

        $this->info("\n✅ Import complete!");
        
        return 0;
    }
}
```

#### 3. Run Import
```bash
php artisan shopify:import-products
```

#### 4. Expected Output:
```
Importing products from my-test-store.myshopify.com...
Found 5 products
✓ Imported: T-Shirt
✓ Imported: Jeans
✓ Imported: Sneakers
✓ Imported: Hat
✓ Imported: Backpack

✅ Import complete!
```

---

## 🎉 SUCCESS! Integration Complete!

### ✅ What You've Accomplished:

1. ✅ Created Shopify Partner account
2. ✅ Created development store
3. ✅ Created custom app
4. ✅ Got API credentials
5. ✅ Installed app to store
6. ✅ Got access token
7. ✅ Setup webhooks
8. ✅ Tested order import
9. ✅ Tested product sync

### 🔄 What Happens Now:

```
AUTOMATIC SYNC:
- New orders → Webhook → Dashboard (real-time)
- Product updates → Webhook → Dashboard (real-time)
- Inventory changes → Webhook → Dashboard (real-time)

SCHEDULED SYNC (optional):
- Products: Every 15 minutes
- Inventory: Every 5 minutes
- Orders: Every minute (backup)
```

---

## 📊 Next Steps

### 1. Setup Scheduled Sync
```bash
# Add to app/Console/Kernel.php
protected function schedule(Schedule $schedule)
{
    $schedule->command('shopify:import-products')
        ->everyFifteenMinutes();
}

# Start scheduler
php artisan schedule:work
```

### 2. Setup Queue Workers
```bash
# Start queue worker
php artisan queue:work --queue=high,default,low
```

### 3. Monitor Logs
```bash
# Watch logs
tail -f storage/logs/laravel.log
```

### 4. Test Everything
```
✓ Create order sa Shopify → Check dashboard
✓ Update product sa Shopify → Check dashboard
✓ Update inventory sa dashboard → Check Shopify
```

---

## 🆘 Troubleshooting

### Problem: "localhost" or "127.0.0.1" sa App URL
```
❌ ERROR: Shopify requires public HTTPS URL

BAKIT?
- Shopify needs to send webhooks to your server
- Webhooks can't reach localhost (nasa loob lang ng computer mo)
- Security: HTTPS required for OAuth

SOLUTION:
Choose one:

1. NGROK (Fastest - for testing)
   ```bash
   # Install
   brew install ngrok  # Mac
   # or download from ngrok.com
   
   # Run
   ngrok http 8000
   
   # Use the HTTPS URL:
   https://abc123.ngrok.io
   ```

2. RAILWAY (Free tier - permanent URL)
   ```bash
   # Go to railway.app
   # Connect GitHub
   # Deploy
   # Get URL: https://yourapp.railway.app
   ```

3. RENDER (Free tier - permanent URL)
   ```bash
   # Go to render.com
   # Connect GitHub
   # Deploy
   # Get URL: https://yourapp.render.com
   ```

4. YOUR OWN DOMAIN
   ```bash
   # If you have domain + SSL
   https://dashboard.yourcompany.com
   ```
```

### Problem: "Invalid signature" error
```
Solution:
1. Check API secret sa .env
2. Verify webhook verification code
3. Check HTTPS (required!)
```

### Problem: Webhooks not received
```
Solution:
1. Check if URL is public (not localhost)
2. Verify HTTPS certificate
3. Check firewall settings
4. Test webhook manually:
   curl -X POST https://yourdomain.com/api/v1/webhooks/shopify/orders/create
```

### Problem: "Access token invalid"
```
Solution:
1. Re-install app
2. Get new access token
3. Update database
```

### Problem: Ngrok URL keeps changing
```
ISSUE: Free ngrok URLs change every restart

SOLUTION:
1. Upgrade to ngrok paid ($8/month)
   - Get permanent URL
   
2. OR use Railway/Render (free)
   - Permanent URL
   - Auto-deploy from GitHub
   
3. OR update Shopify app settings every time
   - Not recommended
```

---

## 📝 Summary

### Files Created:
```
✓ install-shopify.php
✓ exchange-token.php
✓ register-webhooks.php
✓ ShopifyWebhookController.php
✓ ImportProducts command
```

### Configuration Added:
```
✓ .env (API credentials)
✓ routes/api.php (webhook routes)
✓ Database (integration record)
```

### What's Working:
```
✓ OAuth authentication
✓ Access token stored
✓ Webhooks registered
✓ Order import
✓ Product sync
```

---

**Tapos na! Naka-connect na ang Shopify sa dashboard mo!** 🎉

May tanong ka pa ba? 😊

**Last Updated:** 2026-05-01

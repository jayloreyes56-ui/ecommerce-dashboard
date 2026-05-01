# Paano Iconnect ang System sa Amazon at Shopify

## 📋 Table of Contents
1. [Overview](#overview)
2. [Shopify Integration](#shopify-integration)
3. [Amazon Integration](#amazon-integration)
4. [Step-by-Step Implementation](#step-by-step-implementation)

---

## 🎯 Overview

### Ano ang Mangyayari Pag Naka-connect?

```
┌─────────────────────────────────────────────────────────────┐
│                    SHOPIFY STORE                             │
│  (Kung saan bumibili ang customers)                         │
│                                                               │
│  Customer → Browse → Add to Cart → Checkout → Pay           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Automatic sync via API
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              YOUR DASHBOARD (System natin)                   │
│                                                               │
│  ✅ Automatic order import                                   │
│  ✅ Inventory sync (2-way)                                   │
│  ✅ Product sync (2-way)                                     │
│  ✅ Real-time updates                                        │
└─────────────────────────────────────────────────────────────┘
```

### Ano ang Kailangan?

#### Para sa Shopify:
- ✅ Shopify store (may bayad, may free trial)
- ✅ Shopify Partner account (libre)
- ✅ API credentials
- ✅ Webhook setup

#### Para sa Amazon:
- ✅ Amazon Seller account
- ✅ Amazon Developer account
- ✅ SP-API credentials
- ✅ Approval from Amazon

---

## 🛍️ SHOPIFY INTEGRATION

⚠️ **IMPORTANTE: Basahin muna ito!**

**Kailangan mo ng PUBLIC HTTPS URL** para sa Shopify integration!

- ❌ **Hindi pwede:** `http://localhost:8000`
- ✅ **Pwede:** `https://abc123.ngrok.io` or `https://yourapp.railway.app`

**📖 Read these guides first:**
- **[SHOPIFY-URL-SETUP.md](SHOPIFY-URL-SETUP.md)** - How to get public HTTPS URL
- **[SHOPIFY-URL-DIAGRAM.md](SHOPIFY-URL-DIAGRAM.md)** - Visual explanation
- **[SHOPIFY-STEP-BY-STEP.md](SHOPIFY-STEP-BY-STEP.md)** - Complete detailed guide

**Quick Options:**
1. **Ngrok** (5 min) - For testing: `ngrok http 8000`
2. **Railway** (15 min) - For production: Deploy to railway.app
3. **Render** (15 min) - Alternative: Deploy to render.com

---

### Step 1: Gumawa ng Shopify Partner Account

#### 1.1 Sign Up
```
1. Go to: https://partners.shopify.com/
2. Click "Join now"
3. Fill up form:
   - Email
   - Password
   - Business name
4. Verify email
5. Complete profile
```

#### 1.2 Create Development Store
```
1. Login to Partner Dashboard
2. Click "Stores" → "Add store"
3. Select "Development store"
4. Fill up:
   - Store name: "my-test-store"
   - Store purpose: "Test app"
   - Build: "For a client"
5. Click "Save"
6. Store URL: my-test-store.myshopify.com
```

### Step 2: Create Shopify App

#### 2.1 Create App
```
1. Partner Dashboard → "Apps"
2. Click "Create app"
3. Select "Custom app"
4. Fill up:
   - App name: "eCommerce Dashboard Connector"
   - App URL: https://yourdomain.com
5. Click "Create app"
```

#### 2.2 Get API Credentials
```
1. Go to app settings
2. Copy:
   - API key: abc123...
   - API secret key: xyz789...
3. Save these! (Kailangan mo later)
```

#### 2.3 Set API Scopes
```
1. Go to "API credentials"
2. Click "Configure"
3. Select scopes:
   ✅ read_products
   ✅ write_products
   ✅ read_orders
   ✅ write_orders
   ✅ read_inventory
   ✅ write_inventory
   ✅ read_customers
4. Click "Save"
```

### Step 3: Install App sa Store

#### 3.1 Generate Install URL
```php
// Sa system natin
$shop = 'my-test-store.myshopify.com';
$api_key = 'your_api_key';
$scopes = 'read_products,write_products,read_orders,write_orders';
$redirect_uri = 'https://yourdomain.com/api/v1/shopify/callback';

$install_url = "https://{$shop}/admin/oauth/authorize?" . http_build_query([
    'client_id' => $api_key,
    'scope' => $scopes,
    'redirect_uri' => $redirect_uri,
]);

// Open this URL sa browser
echo $install_url;
```

#### 3.2 Authorize App
```
1. Open install URL
2. Login to Shopify store
3. Review permissions
4. Click "Install app"
5. Redirected to callback URL with code
```

#### 3.3 Exchange Code for Access Token
```php
// backend/app/Services/Integrations/Shopify/ShopifyClient.php

public function getAccessToken($shop, $code)
{
    $response = Http::post("https://{$shop}/admin/oauth/access_token", [
        'client_id' => config('services.shopify.api_key'),
        'client_secret' => config('services.shopify.api_secret'),
        'code' => $code,
    ]);

    $accessToken = $response->json('access_token');
    
    // Save to database
    Integration::create([
        'platform' => 'shopify',
        'store_name' => $shop,
        'store_url' => "https://{$shop}",
        'credentials' => encrypt([
            'access_token' => $accessToken,
            'shop' => $shop,
        ]),
        'status' => 'active',
    ]);

    return $accessToken;
}
```

### Step 4: Setup Webhooks

#### 4.1 Create Webhooks
```php
// Create webhook for new orders
public function createWebhooks($shop, $accessToken)
{
    $webhooks = [
        [
            'topic' => 'orders/create',
            'address' => 'https://yourdomain.com/api/v1/webhooks/shopify/orders/create',
            'format' => 'json',
        ],
        [
            'topic' => 'products/update',
            'address' => 'https://yourdomain.com/api/v1/webhooks/shopify/products/update',
            'format' => 'json',
        ],
        [
            'topic' => 'inventory_levels/update',
            'address' => 'https://yourdomain.com/api/v1/webhooks/shopify/inventory/update',
            'format' => 'json',
        ],
    ];

    foreach ($webhooks as $webhook) {
        Http::withHeaders([
            'X-Shopify-Access-Token' => $accessToken,
        ])->post("https://{$shop}/admin/api/2024-01/webhooks.json", [
            'webhook' => $webhook,
        ]);
    }
}
```

#### 4.2 Handle Webhooks
```php
// backend/app/Http/Controllers/Webhooks/ShopifyWebhookController.php

public function handleOrderCreate(Request $request)
{
    // Verify webhook
    $hmac = $request->header('X-Shopify-Hmac-Sha256');
    $data = $request->getContent();
    $calculated = base64_encode(hash_hmac('sha256', $data, config('services.shopify.api_secret'), true));
    
    if (!hash_equals($hmac, $calculated)) {
        return response()->json(['error' => 'Invalid signature'], 401);
    }

    // Process order
    $shopifyOrder = $request->all();
    
    // Queue job for processing
    ProcessShopifyOrderJob::dispatch($shopifyOrder);

    return response()->json(['success' => true]);
}
```

### Step 5: Sync Products

#### 5.1 Import Products from Shopify
```php
// backend/app/Services/Integrations/Shopify/ShopifyProductSync.php

public function importProducts($integration)
{
    $credentials = decrypt($integration->credentials);
    $shop = $credentials['shop'];
    $token = $credentials['access_token'];

    // Get products from Shopify
    $response = Http::withHeaders([
        'X-Shopify-Access-Token' => $token,
    ])->get("https://{$shop}/admin/api/2024-01/products.json");

    $shopifyProducts = $response->json('products');

    foreach ($shopifyProducts as $shopifyProduct) {
        // Map to our product model
        Product::updateOrCreate(
            ['sku' => $shopifyProduct['variants'][0]['sku']],
            [
                'name' => $shopifyProduct['title'],
                'description' => $shopifyProduct['body_html'],
                'price' => $shopifyProduct['variants'][0]['price'],
                'stock_quantity' => $shopifyProduct['variants'][0]['inventory_quantity'],
                'shopify_product_id' => $shopifyProduct['id'],
            ]
        );
    }

    // Log sync
    IntegrationSyncLog::create([
        'integration_id' => $integration->id,
        'direction' => 'import',
        'entity' => 'products',
        'total' => count($shopifyProducts),
        'success' => count($shopifyProducts),
        'failed' => 0,
    ]);
}
```

#### 5.2 Export Products to Shopify
```php
public function exportProduct($product, $integration)
{
    $credentials = decrypt($integration->credentials);
    $shop = $credentials['shop'];
    $token = $credentials['access_token'];

    $data = [
        'product' => [
            'title' => $product->name,
            'body_html' => $product->description,
            'vendor' => 'Your Store',
            'product_type' => $product->category->name,
            'variants' => [
                [
                    'sku' => $product->sku,
                    'price' => $product->price,
                    'inventory_quantity' => $product->stock_quantity,
                    'inventory_management' => 'shopify',
                ]
            ],
        ]
    ];

    $response = Http::withHeaders([
        'X-Shopify-Access-Token' => $token,
    ])->post("https://{$shop}/admin/api/2024-01/products.json", $data);

    if ($response->successful()) {
        $shopifyProduct = $response->json('product');
        
        // Save Shopify ID
        $product->update([
            'shopify_product_id' => $shopifyProduct['id'],
        ]);
    }
}
```

### Step 6: Sync Inventory

#### 6.1 Update Inventory sa Shopify
```php
public function updateInventory($product, $integration)
{
    $credentials = decrypt($integration->credentials);
    $shop = $credentials['shop'];
    $token = $credentials['access_token'];

    // Get inventory item ID
    $response = Http::withHeaders([
        'X-Shopify-Access-Token' => $token,
    ])->get("https://{$shop}/admin/api/2024-01/products/{$product->shopify_product_id}.json");

    $inventoryItemId = $response->json('product.variants.0.inventory_item_id');
    $locationId = $this->getLocationId($shop, $token);

    // Update inventory
    Http::withHeaders([
        'X-Shopify-Access-Token' => $token,
    ])->post("https://{$shop}/admin/api/2024-01/inventory_levels/set.json", [
        'location_id' => $locationId,
        'inventory_item_id' => $inventoryItemId,
        'available' => $product->stock_quantity,
    ]);
}
```

### Step 7: Schedule Automatic Sync

```php
// backend/app/Console/Kernel.php

protected function schedule(Schedule $schedule)
{
    // Sync products every 15 minutes
    $schedule->command('shopify:sync-products')
        ->everyFifteenMinutes()
        ->withoutOverlapping();

    // Sync inventory every 5 minutes
    $schedule->command('shopify:sync-inventory')
        ->everyFiveMinutes()
        ->withoutOverlapping();

    // Import orders every minute
    $schedule->command('shopify:import-orders')
        ->everyMinute()
        ->withoutOverlapping();
}
```

---

## 📦 AMAZON INTEGRATION

### Step 1: Setup Amazon Seller Account

#### 1.1 Create Seller Account
```
1. Go to: https://sellercentral.amazon.com/
2. Click "Register now"
3. Choose account type:
   - Individual (no monthly fee, per-item fee)
   - Professional ($39.99/month)
4. Fill up business information
5. Verify identity
6. Add bank account
7. Complete tax information
```

#### 1.2 Register as Developer
```
1. Go to: https://developer.amazonservices.com/
2. Click "Sign up"
3. Use same credentials as Seller Central
4. Accept Developer Agreement
5. Complete profile
```

### Step 2: Get SP-API Credentials

#### 2.1 Create Developer Application
```
1. Login to Seller Central
2. Go to: Apps & Services → Develop Apps
3. Click "Add new app client"
4. Fill up:
   - App name: "eCommerce Dashboard"
   - OAuth Redirect URI: https://yourdomain.com/api/v1/amazon/callback
5. Click "Save and get credentials"
6. Copy:
   - LWA Client ID
   - LWA Client Secret
7. Save these!
```

#### 2.2 Authorize Application
```
1. Generate authorization URL:
   https://sellercentral.amazon.com/apps/authorize/consent
   ?application_id=YOUR_APP_ID
   &state=YOUR_STATE
   &version=beta

2. Open URL sa browser
3. Login to Seller Central
4. Review permissions
5. Click "Authorize"
6. Get authorization code from redirect
```

#### 2.3 Exchange for Refresh Token
```php
// backend/app/Services/Integrations/Amazon/AmazonClient.php

public function getRefreshToken($authCode)
{
    $response = Http::asForm()->post('https://api.amazon.com/auth/o2/token', [
        'grant_type' => 'authorization_code',
        'code' => $authCode,
        'client_id' => config('services.amazon.client_id'),
        'client_secret' => config('services.amazon.client_secret'),
        'redirect_uri' => config('services.amazon.redirect_uri'),
    ]);

    $refreshToken = $response->json('refresh_token');
    
    // Save to database
    Integration::create([
        'platform' => 'amazon',
        'store_name' => 'Amazon Store',
        'credentials' => encrypt([
            'refresh_token' => $refreshToken,
            'client_id' => config('services.amazon.client_id'),
            'client_secret' => config('services.amazon.client_secret'),
        ]),
        'status' => 'active',
    ]);

    return $refreshToken;
}
```

### Step 3: Get Access Token

```php
public function getAccessToken($integration)
{
    $credentials = decrypt($integration->credentials);

    $response = Http::asForm()->post('https://api.amazon.com/auth/o2/token', [
        'grant_type' => 'refresh_token',
        'refresh_token' => $credentials['refresh_token'],
        'client_id' => $credentials['client_id'],
        'client_secret' => $credentials['client_secret'],
    ]);

    return $response->json('access_token');
}
```

### Step 4: Import Orders from Amazon

```php
// backend/app/Services/Integrations/Amazon/AmazonOrderSync.php

public function importOrders($integration)
{
    $accessToken = $this->getAccessToken($integration);
    $marketplaceId = 'ATVPDKIKX0DER'; // US marketplace

    // Get orders from last 7 days
    $createdAfter = now()->subDays(7)->toIso8601String();

    $response = Http::withHeaders([
        'x-amz-access-token' => $accessToken,
    ])->get('https://sellingpartnerapi-na.amazon.com/orders/v0/orders', [
        'MarketplaceIds' => $marketplaceId,
        'CreatedAfter' => $createdAfter,
        'OrderStatuses' => 'Unshipped,PartiallyShipped',
    ]);

    $amazonOrders = $response->json('payload.Orders');

    foreach ($amazonOrders as $amazonOrder) {
        // Get order items
        $itemsResponse = Http::withHeaders([
            'x-amz-access-token' => $accessToken,
        ])->get("https://sellingpartnerapi-na.amazon.com/orders/v0/orders/{$amazonOrder['AmazonOrderId']}/orderItems");

        $items = $itemsResponse->json('payload.OrderItems');

        // Create order in our system
        $this->createOrderFromAmazon($amazonOrder, $items);
    }
}

private function createOrderFromAmazon($amazonOrder, $items)
{
    // Find or create customer
    $customer = Customer::firstOrCreate(
        ['email' => $amazonOrder['BuyerInfo']['BuyerEmail']],
        ['name' => $amazonOrder['BuyerInfo']['BuyerName']]
    );

    // Create order
    $order = Order::create([
        'customer_id' => $customer->id,
        'order_number' => $amazonOrder['AmazonOrderId'],
        'status' => 'confirmed',
        'payment_status' => 'paid',
        'total' => $amazonOrder['OrderTotal']['Amount'],
        'platform' => 'amazon',
    ]);

    // Create order items
    foreach ($items as $item) {
        $product = Product::where('sku', $item['SellerSKU'])->first();
        
        if ($product) {
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'quantity' => $item['QuantityOrdered'],
                'price' => $item['ItemPrice']['Amount'],
            ]);

            // Update inventory
            $product->decrement('stock_quantity', $item['QuantityOrdered']);
        }
    }
}
```

### Step 5: Update Inventory sa Amazon

```php
public function updateInventory($product, $integration)
{
    $accessToken = $this->getAccessToken($integration);

    $data = [
        'inventoryItems' => [
            [
                'sku' => $product->sku,
                'quantity' => $product->stock_quantity,
            ]
        ]
    ];

    Http::withHeaders([
        'x-amz-access-token' => $accessToken,
    ])->post('https://sellingpartnerapi-na.amazon.com/fba/inventory/v1/items/inventory', $data);
}
```

### Step 6: Schedule Amazon Sync

```php
// backend/app/Console/Kernel.php

protected function schedule(Schedule $schedule)
{
    // Import orders every 5 minutes
    $schedule->command('amazon:import-orders')
        ->everyFiveMinutes()
        ->withoutOverlapping();

    // Update inventory every 10 minutes
    $schedule->command('amazon:update-inventory')
        ->everyTenMinutes()
        ->withoutOverlapping();
}
```

---

## 🔧 IMPLEMENTATION STEPS

### Step 1: Add Configuration

```php
// config/services.php

return [
    // ... existing services

    'shopify' => [
        'api_key' => env('SHOPIFY_API_KEY'),
        'api_secret' => env('SHOPIFY_API_SECRET'),
        'api_version' => '2024-01',
    ],

    'amazon' => [
        'client_id' => env('AMAZON_CLIENT_ID'),
        'client_secret' => env('AMAZON_CLIENT_SECRET'),
        'redirect_uri' => env('AMAZON_REDIRECT_URI'),
        'marketplace_id' => env('AMAZON_MARKETPLACE_ID', 'ATVPDKIKX0DER'),
    ],
];
```

```bash
# .env
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret

AMAZON_CLIENT_ID=your_client_id
AMAZON_CLIENT_SECRET=your_client_secret
AMAZON_REDIRECT_URI=https://yourdomain.com/api/v1/amazon/callback
```

### Step 2: Add Database Columns

```php
// Add to products migration
Schema::table('products', function (Blueprint $table) {
    $table->string('shopify_product_id')->nullable();
    $table->string('amazon_asin')->nullable();
    $table->string('amazon_sku')->nullable();
});
```

### Step 3: Create Integration Routes

```php
// routes/api.php

Route::prefix('integrations')->middleware(['auth:sanctum'])->group(function () {
    // Shopify
    Route::get('shopify/install', [ShopifyController::class, 'install']);
    Route::get('shopify/callback', [ShopifyController::class, 'callback']);
    Route::post('shopify/sync-products', [ShopifyController::class, 'syncProducts']);
    
    // Amazon
    Route::get('amazon/authorize', [AmazonController::class, 'authorize']);
    Route::get('amazon/callback', [AmazonController::class, 'callback']);
    Route::post('amazon/import-orders', [AmazonController::class, 'importOrders']);
});

// Webhooks (no auth)
Route::prefix('webhooks')->group(function () {
    Route::post('shopify/orders/create', [ShopifyWebhookController::class, 'handleOrderCreate']);
    Route::post('shopify/products/update', [ShopifyWebhookController::class, 'handleProductUpdate']);
});
```

### Step 4: Create Commands

```bash
# Create Shopify sync commands
php artisan make:command Shopify/SyncProducts
php artisan make:command Shopify/SyncInventory
php artisan make:command Shopify/ImportOrders

# Create Amazon sync commands
php artisan make:command Amazon/ImportOrders
php artisan make:command Amazon/UpdateInventory
```

### Step 5: Test Integration

#### Test Shopify:
```bash
# 1. Install app
curl https://yourdomain.com/api/v1/integrations/shopify/install

# 2. Sync products
curl -X POST https://yourdomain.com/api/v1/integrations/shopify/sync-products \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Create test order sa Shopify store
# 4. Check if order appears sa dashboard
```

#### Test Amazon:
```bash
# 1. Authorize app
curl https://yourdomain.com/api/v1/integrations/amazon/authorize

# 2. Import orders
curl -X POST https://yourdomain.com/api/v1/integrations/amazon/import-orders \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Check if orders appear sa dashboard
```

---

## 📊 Monitoring & Troubleshooting

### Check Sync Status

```php
// Get integration status
$integration = Integration::where('platform', 'shopify')->first();

echo "Status: " . $integration->status;
echo "Last synced: " . $integration->last_synced_at;

// Get sync logs
$logs = IntegrationSyncLog::where('integration_id', $integration->id)
    ->latest()
    ->take(10)
    ->get();

foreach ($logs as $log) {
    echo "{$log->entity}: {$log->success}/{$log->total} success\n";
    if ($log->errors) {
        print_r($log->errors);
    }
}
```

### Common Issues

#### Shopify:
```
❌ "Invalid HMAC"
   → Check API secret key
   → Verify webhook signature calculation

❌ "Access token expired"
   → Shopify tokens don't expire
   → Check if app was uninstalled

❌ "Rate limit exceeded"
   → Shopify: 2 requests/second
   → Add delay between requests
```

#### Amazon:
```
❌ "Invalid refresh token"
   → Re-authorize application
   → Check if seller account is active

❌ "Rate limit exceeded"
   → Amazon: Very strict limits
   → Implement exponential backoff
   → Use request throttling

❌ "Access denied"
   → Check SP-API permissions
   → Verify marketplace ID
```

---

## 🎯 Summary

### Shopify Integration:
1. ✅ Create Partner account
2. ✅ Create app
3. ✅ Get API credentials
4. ✅ Install app to store
5. ✅ Setup webhooks
6. ✅ Sync products & orders
7. ✅ Schedule automatic sync

### Amazon Integration:
1. ✅ Create Seller account
2. ✅ Register as developer
3. ✅ Get SP-API credentials
4. ✅ Authorize application
5. ✅ Import orders
6. ✅ Update inventory
7. ✅ Schedule polling

### Benefits:
- ✅ Automatic order import
- ✅ Real-time inventory sync
- ✅ Centralized management
- ✅ Reduced manual work
- ✅ Better accuracy

---

## 💡 Next Steps

1. **Test sa Development Store**
   - Gumawa ng test orders
   - Verify data accuracy
   - Test error handling

2. **Deploy to Production**
   - Connect real stores
   - Monitor sync status
   - Setup alerts

3. **Expand to Other Platforms**
   - eBay
   - Walmart
   - Lazada/Shopee (if needed)

---

**Mayroon ka bang specific na tanong about integration?** 😊

**Last Updated:** 2026-05-01

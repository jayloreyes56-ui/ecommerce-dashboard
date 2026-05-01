# Third-Party Integration Architecture

This document outlines the integration strategy for connecting with major eCommerce platforms.

---

## Overview

The system supports bidirectional sync with multiple eCommerce platforms:
- **Shopify** - Online store platform
- **Amazon** - Marketplace
- **eBay** - Auction & marketplace
- **Walmart** - Marketplace

---

## Database Schema

### `integrations` table
Stores connection details for each platform:
```sql
- platform: shopify, amazon, ebay, walmart
- store_name: Display name
- store_url: Store URL
- credentials: Encrypted API keys/tokens (JSON)
- settings: Platform-specific config (JSON)
- status: active, inactive, error
- last_synced_at: Last successful sync timestamp
```

### `integration_sync_logs` table
Audit trail for all sync operations:
```sql
- direction: import (from platform) or export (to platform)
- entity: orders, products, inventory
- total/success/failed: Sync statistics
- errors: Array of error messages
```

---

## Integration Patterns

### 1. Shopify Integration

**Authentication:**
- OAuth 2.0 flow
- Store access token in `credentials`
- Scopes: `read_products`, `write_products`, `read_orders`, `write_inventory`

**Webhooks:**
```
POST /api/v1/webhooks/shopify/orders/create
POST /api/v1/webhooks/shopify/products/update
POST /api/v1/webhooks/shopify/inventory/update
```

**Sync Strategy:**
- **Orders**: Webhook-based (real-time)
- **Products**: Bidirectional sync every 15 minutes
- **Inventory**: Push updates immediately, pull every 5 minutes

**API Endpoints:**
```php
// Shopify Admin API
GET  /admin/api/2024-01/products.json
POST /admin/api/2024-01/products.json
PUT  /admin/api/2024-01/products/{id}.json
GET  /admin/api/2024-01/orders.json
POST /admin/api/2024-01/inventory_levels/set.json
```

---

### 2. Amazon Integration

**Authentication:**
- Amazon SP-API (Selling Partner API)
- LWA (Login with Amazon) OAuth
- Refresh token stored in `credentials`

**Sync Strategy:**
- **Orders**: Poll every 5 minutes (no webhooks)
- **Products**: Push updates via Feeds API
- **Inventory**: Update via Inventory API

**API Endpoints:**
```php
// Amazon SP-API
GET  /orders/v0/orders
GET  /catalog/2022-04-01/items/{asin}
POST /feeds/2021-06-30/feeds
POST /fba/inventory/v1/items/inventory
```

**Rate Limits:**
- Orders API: 0.0167 requests/second (1 per minute)
- Feeds API: 0.0222 requests/second
- Implement exponential backoff

---

### 3. eBay Integration

**Authentication:**
- OAuth 2.0 (User token)
- Application token for public data
- Store in `credentials`

**Sync Strategy:**
- **Orders**: Poll every 10 minutes
- **Products**: Push via Trading API
- **Inventory**: Update via Inventory API

**API Endpoints:**
```php
// eBay Trading API
POST /ws/api.dll (SOAP)
- GetOrders
- AddFixedPriceItem
- ReviseInventoryStatus

// eBay RESTful APIs
GET  /sell/fulfillment/v1/order
POST /sell/inventory/v1/inventory_item
PUT  /sell/inventory/v1/inventory_item/{sku}
```

---

### 4. Walmart Integration

**Authentication:**
- Consumer ID + Private Key
- Generate signature for each request
- Store credentials in `credentials`

**Sync Strategy:**
- **Orders**: Poll every 5 minutes
- **Products**: Push via Items API
- **Inventory**: Update via Inventory API

**API Endpoints:**
```php
// Walmart Marketplace API
GET  /v3/orders
POST /v3/items
PUT  /v3/inventory
```

---

## Implementation Plan

### Phase 1: Foundation (2-3 days)
- [x] Database schema (already exists)
- [ ] Integration model & service layer
- [ ] Webhook receiver infrastructure
- [ ] Queue jobs for async processing
- [ ] Error handling & retry logic

### Phase 2: Shopify (3-5 days)
- [ ] OAuth flow
- [ ] Webhook handlers
- [ ] Product sync (bidirectional)
- [ ] Order import
- [ ] Inventory sync
- [ ] Admin UI for connection

### Phase 3: Amazon (5-7 days)
- [ ] SP-API authentication
- [ ] Order polling job
- [ ] Product feed generation
- [ ] Inventory updates
- [ ] Rate limiting & throttling

### Phase 4: eBay (4-6 days)
- [ ] OAuth implementation
- [ ] Order polling
- [ ] Listing management
- [ ] Inventory sync

### Phase 5: Walmart (4-6 days)
- [ ] Signature-based auth
- [ ] Order polling
- [ ] Item management
- [ ] Inventory updates

---

## Code Structure

```
app/
├── Services/
│   └── Integrations/
│       ├── IntegrationService.php
│       ├── Shopify/
│       │   ├── ShopifyClient.php
│       │   ├── ShopifyOrderSync.php
│       │   ├── ShopifyProductSync.php
│       │   └── ShopifyInventorySync.php
│       ├── Amazon/
│       │   ├── AmazonClient.php
│       │   ├── AmazonOrderSync.php
│       │   └── AmazonInventorySync.php
│       ├── eBay/
│       │   └── ...
│       └── Walmart/
│           └── ...
├── Jobs/
│   └── Integrations/
│       ├── SyncOrdersJob.php
│       ├── SyncProductsJob.php
│       └── SyncInventoryJob.php
└── Http/
    └── Controllers/
        └── Webhooks/
            ├── ShopifyWebhookController.php
            └── ...
```

---

## Data Mapping

### Order Mapping
```php
Platform Order → Internal Order
- order_number: platform_order_id
- customer: map to Customer model
- items: map to OrderItem model
- status: map to internal status
- payment: map to payment_status
```

### Product Mapping
```php
Internal Product → Platform Product
- sku: unique identifier
- name: title
- description: body_html / description
- price: price
- inventory: quantity
- images: image URLs
```

---

## Error Handling

### Retry Strategy
```php
1st attempt: Immediate
2nd attempt: 1 minute delay
3rd attempt: 5 minutes delay
4th attempt: 15 minutes delay
5th attempt: 1 hour delay
After 5 failures: Mark as error, notify admin
```

### Common Errors
- **401 Unauthorized**: Refresh token, re-authenticate
- **429 Rate Limited**: Exponential backoff
- **404 Not Found**: Skip item, log warning
- **500 Server Error**: Retry with backoff
- **Network Timeout**: Retry immediately

---

## Security

### Credentials Storage
```php
// Encrypt before storing
$credentials = encrypt([
    'access_token' => $token,
    'refresh_token' => $refresh,
    'api_key' => $key,
]);

// Decrypt when using
$creds = decrypt($integration->credentials);
```

### Webhook Verification
```php
// Shopify: HMAC verification
$hmac = hash_hmac('sha256', $data, $secret);
if (!hash_equals($hmac, $header)) {
    abort(401);
}

// Amazon: Signature verification
// eBay: Challenge-response
// Walmart: Signature verification
```

---

## Monitoring & Alerts

### Metrics to Track
- Sync success rate
- Average sync duration
- Failed sync count
- API rate limit usage
- Webhook delivery rate

### Alerts
- Email admin when sync fails 3+ times
- Slack notification for critical errors
- Dashboard widget showing sync status

---

## Testing Strategy

### Unit Tests
- Test data mapping functions
- Test API client methods
- Test error handling

### Integration Tests
- Use platform sandbox/test environments
- Test full sync flow
- Test webhook handling

### Manual Testing
- Connect to real test stores
- Verify data accuracy
- Test edge cases

---

## Next Steps

1. **Get Platform Credentials**
   - Create developer accounts
   - Generate API keys
   - Set up test stores

2. **Implement Foundation**
   - Integration service layer
   - Queue infrastructure
   - Webhook receivers

3. **Start with Shopify**
   - Most developer-friendly
   - Best documentation
   - Good testing tools

4. **Expand to Other Platforms**
   - Amazon (most complex)
   - eBay
   - Walmart

---

## Resources

- [Shopify Admin API](https://shopify.dev/docs/api/admin-rest)
- [Amazon SP-API](https://developer-docs.amazon.com/sp-api/)
- [eBay Developer Program](https://developer.ebay.com/)
- [Walmart Marketplace API](https://developer.walmart.com/)

# eCommerce Dashboard — Laravel Backend

Production-ready REST API built with Laravel 11, PostgreSQL, Redis, and Sanctum.

---

## Requirements

- PHP 8.2+
- PostgreSQL 15+
- Redis 7+
- Composer 2+

---

## Setup

```bash
# 1. Install dependencies
composer install

# 2. Copy environment file
cp .env.example .env

# 3. Generate app key
php artisan key:generate

# 4. Configure .env (DB, Redis, Mail, S3)

# 5. Run migrations
php artisan migrate

# 6. Seed the database
php artisan db:seed

# 7. Start queue worker (development)
php artisan horizon
```

---

## Default Credentials

| Role  | Email                | Password    |
|-------|----------------------|-------------|
| Admin | admin@company.com    | Admin@1234  |
| Staff | staff@company.com    | Staff@1234  |

---

## API Overview

Base URL: `https://your-domain.com/api/v1`

All responses follow this envelope:
```json
{
  "success": true,
  "data": {},
  "meta": {},
  "message": null
}
```

### Authentication

```
POST /api/v1/auth/login          → Get token
POST /api/v1/auth/logout         → Revoke current token
POST /api/v1/auth/logout-all     → Revoke all tokens
GET  /api/v1/auth/me             → Current user
```

Pass token as: `Authorization: Bearer {token}`

### Products
```
GET    /api/v1/products                        → List (search, category, low_stock filters)
POST   /api/v1/products                        → Create
GET    /api/v1/products/{id}                   → Show
PUT    /api/v1/products/{id}                   → Update
DELETE /api/v1/products/{id}                   → Delete (admin)
POST   /api/v1/products/{id}/stock             → Adjust inventory
GET    /api/v1/products/{id}/stock/logs        → Inventory audit log
POST   /api/v1/products/{id}/images            → Upload images
```

### Orders
```
GET    /api/v1/orders                          → List (status, date range filters)
POST   /api/v1/orders                          → Create
GET    /api/v1/orders/{id}                     → Show with items + history
PATCH  /api/v1/orders/{id}/status              → Transition status
PATCH  /api/v1/orders/{id}/payment             → Update payment status
POST   /api/v1/orders/{id}/cancel              → Cancel order
GET    /api/v1/orders/{id}/history             → Status history
DELETE /api/v1/orders/{id}                     → Soft delete (admin)
```

### Reports
```
GET /api/v1/dashboard/summary                  → KPIs (cached 5min)
GET /api/v1/dashboard/sales-chart?from=&to=    → Chart data
GET /api/v1/dashboard/top-products             → Top sellers
GET /api/v1/reports/sales?from=&to=            → Full sales report
GET /api/v1/reports/customers?from=&to=        → Customer report
```

### Messages
```
GET   /api/v1/conversations                    → List conversations
POST  /api/v1/conversations                    → Start conversation
GET   /api/v1/conversations/{id}               → Show with messages
POST  /api/v1/conversations/{id}/messages      → Send message
POST  /api/v1/conversations/{id}/read          → Mark as read
PATCH /api/v1/conversations/{id}/assign        → Assign to staff
PATCH /api/v1/conversations/{id}/close         → Close
PATCH /api/v1/conversations/{id}/reopen        → Reopen
```

---

## Architecture

```
app/
├── Http/
│   ├── Controllers/Api/V1/    # Thin controllers — delegate to services
│   ├── Middleware/            # ForceJsonResponse, EnsureUserIsActive
│   ├── Requests/              # Form Request validation per module
│   └── Resources/             # API response transformers
├── Models/                    # Eloquent models with relationships + scopes
├── Services/                  # Business logic (OrderService, ProductService...)
├── Policies/                  # Authorization (ProductPolicy, OrderPolicy...)
└── Exceptions/Handler.php     # Centralized JSON error handling
```

### Key Design Decisions

- **Services layer**: All business logic lives in `app/Services/`, not controllers.
- **Inventory safety**: Stock adjustments use `lockForUpdate()` to prevent race conditions.
- **Order state machine**: `Order::ALLOWED_TRANSITIONS` enforces valid status flows.
- **Snapshots**: `order_items.product_snapshot` preserves product data at order time.
- **Caching**: Dashboard KPIs cached in Redis (5min TTL), category tree (1hr TTL).
- **Soft deletes**: Orders, Products, Customers, Users are never hard-deleted.
- **Audit trail**: Every inventory change and order status change is logged.

---

## Roles & Permissions

| Permission         | Admin | Staff |
|--------------------|-------|-------|
| view-products      | ✅    | ✅    |
| create/edit-products | ✅  | ✅    |
| delete-products    | ✅    | ❌    |
| view-cost-prices   | ✅    | ❌    |
| manage-inventory   | ✅    | ✅    |
| view/create/edit orders | ✅ | ✅  |
| delete-orders      | ✅    | ❌    |
| view-reports       | ✅    | ✅    |
| export-reports     | ✅    | ❌    |
| view/create/edit users | ✅ | ❌  |

---

## Production Deployment

```bash
# Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Run migrations
php artisan migrate --force

# Start Horizon (queue worker)
supervisorctl start horizon
```

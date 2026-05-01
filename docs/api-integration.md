# API Integration Reference

Complete request/response examples for every integrated endpoint.

---

## Base URL & Headers

```
Base URL:  http://localhost:8000/api/v1
Accept:    application/json
Content-Type: application/json
Authorization: Bearer {token}   ← all protected routes
X-Request-ID: web-{n}-{ts}     ← attached automatically by Axios interceptor
```

All responses follow this envelope:

```json
{
  "success": true | false,
  "data": {},
  "meta": {},
  "message": "Human-readable string"
}
```

---

## Auth

### POST /auth/login

**Request**
```json
{ "email": "admin@company.com", "password": "Admin@1234" }
```

**200 Success**
```json
{
  "success": true,
  "data": {
    "token": "1|abc123xyz...",
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@company.com",
      "avatar": null,
      "is_active": true,
      "roles": ["admin"],
      "last_login_at": "2024-01-15T10:00:00.000Z",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**422 Wrong credentials**
```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": { "email": ["The provided credentials are incorrect."] }
}
```

**429 Rate limited** (after 10 attempts/minute)
```json
{ "success": false, "message": "Too many login attempts. Please try again in 15 minutes." }
```

---

### GET /auth/me

**200 Success**
```json
{
  "success": true,
  "data": { "id": 1, "name": "Admin User", "email": "admin@company.com", "roles": ["admin"] }
}
```

**401 Expired/invalid token**
```json
{ "success": false, "message": "Unauthenticated. Please log in." }
```

---

### POST /auth/logout

**200 Success**
```json
{ "success": true, "message": "Logged out successfully." }
```

---

## Products

### GET /products

**Query params:** `search`, `category_id`, `is_active`, `low_stock`, `sort_by`, `sort_dir`, `per_page`, `page`

**200 Success**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "sku": "PHN-001",
      "name": "ProPhone X15",
      "description": "Flagship smartphone",
      "price": 999.00,
      "compare_price": null,
      "attributes": { "color": "Black", "storage": "256GB" },
      "images": [{ "url": "https://cdn.example.com/products/1/photo.jpg", "path": "products/1/photo.jpg" }],
      "is_active": true,
      "is_featured": true,
      "category": { "id": 1, "name": "Smartphones", "slug": "smartphones" },
      "inventory": {
        "quantity": 150,
        "reserved": 5,
        "available": 145,
        "low_stock_threshold": 10,
        "is_low_stock": false,
        "is_out_of_stock": false,
        "updated_at": "2024-01-15T10:00:00.000Z"
      },
      "available_stock": 145,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-15T00:00:00.000Z"
    }
  ],
  "meta": { "current_page": 1, "per_page": 20, "total": 42, "last_page": 3 }
}
```

---

### POST /products

**Request**
```json
{
  "sku": "NEW-001",
  "name": "New Product",
  "description": "A great product",
  "price": 49.99,
  "cost_price": 22.00,
  "category_id": 1,
  "is_active": true,
  "is_featured": false,
  "initial_stock": 100
}
```

**201 Created**
```json
{ "success": true, "data": { ...product }, "message": "Product created successfully." }
```

**422 Validation error**
```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {
    "sku": ["The SKU has already been taken."],
    "price": ["The price field is required."]
  }
}
```

---

### PUT /products/{id}

**Request** — only send fields you want to change
```json
{ "name": "Updated Name", "price": 59.99, "is_active": false }
```

**200 Success**
```json
{ "success": true, "data": { ...updatedProduct }, "message": "Product updated successfully." }
```

---

### DELETE /products/{id}

**200 Success**
```json
{ "success": true, "message": "Product deleted successfully." }
```

**422 Has active orders**
```json
{ "success": false, "message": "Cannot delete a product with active orders." }
```

---

### POST /products/{id}/stock

**Request**
```json
{ "change": 50, "reason": "restock", "note": "Weekly restock from supplier" }
```

`change` is signed: positive = add stock, negative = remove stock.
`reason` must be one of: `restock`, `adjustment`, `damage`, `return`, `other`

**200 Success**
```json
{
  "success": true,
  "data": { "quantity": 200, "reserved": 5, "available": 195, "is_low_stock": false },
  "message": "Stock adjusted successfully."
}
```

**422 Insufficient stock**
```json
{ "success": false, "message": "Insufficient stock for product [PHN-001]. Available: 145, Requested: 200" }
```

---

## Orders

### GET /orders

**Query params:** `search`, `status`, `payment_status`, `customer_id`, `from`, `to`, `sort_by`, `sort_dir`, `per_page`, `page`

**200 Success**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "order_number": "ORD-20240115-0001",
      "status": "pending",
      "payment_status": "unpaid",
      "subtotal": 999.00,
      "discount": 0,
      "tax": 79.92,
      "shipping_cost": 9.99,
      "total": 1088.91,
      "customer": { "id": 1, "name": "Alice Johnson", "email": "alice@example.com" },
      "items": [
        {
          "id": 1,
          "product_name": "ProPhone X15",
          "product_sku": "PHN-001",
          "quantity": 1,
          "unit_price": 999.00,
          "total_price": 999.00
        }
      ],
      "allowed_transitions": ["confirmed", "cancelled"],
      "placed_at": "2024-01-15T10:00:00.000Z"
    }
  ],
  "meta": { "current_page": 1, "per_page": 20, "total": 340, "last_page": 17 }
}
```

---

### PATCH /orders/{id}/status

**Request**
```json
{ "status": "confirmed", "note": "Payment verified via bank transfer" }
```

Valid transitions:
```
pending    → confirmed | cancelled
confirmed  → processing | cancelled
processing → shipped | cancelled
shipped    → delivered
delivered  → refunded
```

**200 Success**
```json
{ "success": true, "data": { ...order, "status": "confirmed" }, "message": "Order status updated to [confirmed]." }
```

**422 Invalid transition**
```json
{ "success": false, "message": "Cannot transition order from [delivered] to [pending]." }
```

---

### POST /orders/{id}/cancel

**Request**
```json
{ "reason": "Customer requested cancellation" }
```

**200 Success**
```json
{ "success": true, "data": { ...order, "status": "cancelled" }, "message": "Order cancelled." }
```

**422 Not cancellable**
```json
{ "success": false, "message": "Order [ORD-20240115-0001] cannot be cancelled in its current status [delivered]." }
```

---

## Error Reference

| HTTP Status | Meaning | Frontend Behaviour |
|---|---|---|
| 200 | Success | Use `data` |
| 201 | Created | Use `data`, show success toast |
| 401 | Unauthenticated | Clear token, redirect to `/login` |
| 403 | Forbidden | Show permission error toast |
| 404 | Not found | Show not found toast |
| 422 | Validation failed | Apply `errors` to form fields |
| 429 | Rate limited | Show rate limit toast |
| 500+ | Server error | Show generic error toast |
| Network | No response | Show offline banner |

---

## Data Flow Diagram

```
User Action
    │
    ▼
React Component
    │  calls hook
    ▼
useProducts / useOrders / useAuth
    │  calls API function
    ▼
productsApi / ordersApi / authApi
    │  calls Axios instance
    ▼
api (lib/axios.ts)
    │  attaches token + request ID
    ▼
Laravel API  (/api/v1/...)
    │
    ▼
Response
    │
    ├─ 2xx → React Query caches data → component re-renders
    ├─ 401 → interceptor clears auth → redirect to login
    ├─ 422 → hook calls applyServerErrors() → form shows field errors
    └─ 5xx → interceptor shows toast → error propagates to hook
```

---

## Testing Flow

```bash
# Run all tests once
npm run test

# Watch mode during development
npm run test:watch

# Coverage report
npm run test:coverage
```

### Test coverage targets

| Module | What's tested |
|---|---|
| `lib/apiError.ts` | All error parsing helpers |
| `auth` flow | Login, logout, token attachment, 401 handling |
| `products` CRUD | List, create, edit, delete, stock adjust |
| `orders` flow | List, detail modal, status transitions, cancellation, filtering |

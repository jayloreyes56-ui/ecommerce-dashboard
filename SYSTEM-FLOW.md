# System Flow - Buong Daloy ng Sistema

## Overview / Pangkalahatang Paliwanag

Ito ang kompletong paliwanag ng kung paano gumagana ang buong eCommerce Dashboard system mula simula hanggang dulo.

---

## 🔄 Buong System Architecture Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER / CUSTOMER                          │
│                    (Browser / Mobile Device)                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + TypeScript)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Pages      │  │  Components  │  │    Hooks     │         │
│  │ (Dashboard,  │  │  (UI, Layout)│  │ (useProducts,│         │
│  │  Products,   │  │              │  │  useOrders)  │         │
│  │  Orders)     │  │              │  │              │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                  │
│         └──────────────────┼──────────────────┘                  │
│                            │                                     │
│                    ┌───────▼────────┐                           │
│                    │   API Client   │                           │
│                    │    (Axios)     │                           │
│                    └───────┬────────┘                           │
└────────────────────────────┼────────────────────────────────────┘
                             │ HTTP Requests (JSON)
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    WEB SERVER (Nginx)                            │
│  - Load Balancing                                                │
│  - SSL/TLS Termination                                           │
│  - Static File Serving                                           │
│  - Rate Limiting                                                 │
│  - Security Headers                                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              BACKEND API (Laravel 11 + PHP 8.2)                  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    MIDDLEWARE LAYER                       │  │
│  │  - Authentication (Sanctum)                               │  │
│  │  - Authorization (Policies)                               │  │
│  │  - Rate Limiting                                          │  │
│  │  - Security Headers                                       │  │
│  │  - JSON Response Formatting                               │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                            │                                     │
│  ┌────────────────────────▼─────────────────────────────────┐  │
│  │                    CONTROLLERS                            │  │
│  │  - ProductController                                      │  │
│  │  - OrderController                                        │  │
│  │  - CustomerController                                     │  │
│  │  - MessageController                                      │  │
│  │  - ReportController                                       │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                            │                                     │
│  ┌────────────────────────▼─────────────────────────────────┐  │
│  │                    SERVICES LAYER                         │  │
│  │  - ProductService (Business Logic)                        │  │
│  │  - OrderService (Order Processing)                        │  │
│  │  - ReportService (Analytics)                              │  │
│  │  - MessageService (Communication)                         │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                            │                                     │
│  ┌────────────────────────▼─────────────────────────────────┐  │
│  │                    MODELS (Eloquent ORM)                  │  │
│  │  - Product, Order, Customer, User, Message                │  │
│  │  - Relationships & Scopes                                 │  │
│  └────────────────────────┬─────────────────────────────────┘  │
└────────────────────────────┼─────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐  ┌─────────────────┐  ┌──────────────────┐
│   DATABASE    │  │   REDIS CACHE   │  │  QUEUE WORKERS   │
│  (PostgreSQL) │  │  - Session      │  │  (Laravel        │
│  - Products   │  │  - Cache        │  │   Horizon)       │
│  - Orders     │  │  - Queue        │  │  - Email Jobs    │
│  - Customers  │  │                 │  │  - Reports       │
│  - Users      │  │                 │  │  - Notifications │
└───────────────┘  └─────────────────┘  └──────────────────┘
```

---

## 📱 1. USER LOGIN FLOW (Pag-login ng User)

### Step-by-Step Process:

```
1. User → Opens browser → http://localhost:3000
   ↓
2. Frontend → Checks if may token sa localStorage
   ↓
3. Walang token → Redirect to /login page
   ↓
4. User → Enters email & password → Click "Login"
   ↓
5. Frontend → POST /api/v1/auth/login
   {
     "email": "admin@example.com",
     "password": "password"
   }
   ↓
6. Backend → Receives request
   ↓
7. Middleware → ForceJsonResponse (ensure JSON response)
   ↓
8. Controller → AuthController@login
   ↓
9. Validation → LoginRequest validates input
   ↓
10. Service → AuthService checks credentials
    ↓
11. Database → Query users table
    ↓
12. Password → Verify using bcrypt
    ↓
13. Success → Generate Sanctum token
    ↓
14. Response → Return user data + token
    {
      "user": {...},
      "token": "1|abc123..."
    }
    ↓
15. Frontend → Save token to localStorage
    ↓
16. Frontend → Redirect to /dashboard
    ↓
17. User → Nakita na ang Dashboard! ✅
```

---

## 🛍️ 2. PRODUCT MANAGEMENT FLOW (Pag-manage ng Products)

### A. Viewing Products (Pagtingin ng Products)

```
1. User → Click "Products" sa sidebar
   ↓
2. Frontend → Navigate to /products
   ↓
3. Component → Products.tsx loads
   ↓
4. Hook → useProducts() executes
   ↓
5. API Call → GET /api/v1/products?page=1&per_page=15
   ↓
6. Backend → ProductController@index
   ↓
7. Middleware → Check authentication (Sanctum)
   ↓
8. Authorization → Check if user can view products
   ↓
9. Query → Product::with('category')
              ->when($search, ...)
              ->paginate(15)
   ↓
10. Cache → Check Redis cache first
    ↓
11. Database → If not cached, query PostgreSQL
    ↓
12. Resource → ProductResource transforms data
    ↓
13. Response → Return paginated products
    {
      "data": [...],
      "meta": {pagination info}
    }
    ↓
14. Frontend → Display products in table
    ↓
15. User → Nakita ang list ng products! ✅
```

### B. Adding New Product (Pagdagdag ng Bagong Product)

```
1. User → Click "Add Product" button
   ↓
2. Frontend → Open modal with form
   ↓
3. User → Fill in product details:
   - Name: "Laptop Pro 15"
   - SKU: "PROD-001"
   - Price: 1299.99
   - Stock: 50
   - Category: Electronics
   ↓
4. User → Click "Save"
   ↓
5. Frontend → POST /api/v1/products
   {
     "name": "Laptop Pro 15",
     "sku": "PROD-001",
     "price": 1299.99,
     "stock_quantity": 50,
     "category_id": 1
   }
   ↓
6. Backend → ProductController@store
   ↓
7. Middleware → Authentication + Authorization
   ↓
8. Validation → StoreProductRequest validates:
   - Name required
   - SKU unique
   - Price valid number
   - Stock valid integer
   ↓
9. Service → ProductService@create
   ↓
10. Database Transaction → Start
    ↓
11. Create Product → Insert to products table
    ↓
12. Create Inventory Log → Track initial stock
    ↓
13. Commit Transaction → Save changes
    ↓
14. Cache → Invalidate product cache
    ↓
15. Response → Return created product
    ↓
16. Frontend → Close modal, refresh list
    ↓
17. Toast → "Product created successfully!" ✅
    ↓
18. User → Nakita ang bagong product sa list!
```

### C. Updating Stock (Pag-update ng Stock)

```
1. User → Click "Adjust Stock" sa product
   ↓
2. Frontend → Open stock adjustment modal
   ↓
3. User → Enter:
   - Quantity: -5 (negative = decrease)
   - Reason: "Sold to customer"
   ↓
4. Frontend → POST /api/v1/products/1/stock
   {
     "quantity": -5,
     "reason": "Sold to customer"
   }
   ↓
5. Backend → ProductController@adjustStock
   ↓
6. Service → ProductService@adjustStock
   ↓
7. Database → Start transaction with LOCK
   ↓
8. Lock Product → lockForUpdate() (prevent race condition)
   ↓
9. Check Stock → Verify sufficient stock
   ↓
10. Update Stock → stock_quantity = 50 - 5 = 45
    ↓
11. Create Log → InventoryLog record
    {
      "product_id": 1,
      "change": -5,
      "reason": "Sold to customer",
      "previous_quantity": 50,
      "new_quantity": 45,
      "user_id": 1
    }
    ↓
12. Check Threshold → If stock <= low_stock_threshold
    ↓
13. Send Alert → Queue low stock notification
    ↓
14. Commit Transaction → Save all changes
    ↓
15. Response → Return updated product
    ↓
16. Frontend → Update display
    ↓
17. User → Nakita ang updated stock! ✅
```

---

## 📦 3. ORDER PROCESSING FLOW (Pag-process ng Order)

### Complete Order Lifecycle:

```
1. CREATE ORDER (Paggawa ng Order)
   ↓
   User → Click "Create Order"
   ↓
   Frontend → POST /api/v1/orders
   {
     "customer_id": 1,
     "items": [
       {
         "product_id": 1,
         "quantity": 2,
         "price": 1299.99
       }
     ],
     "subtotal": 2599.98,
     "tax": 259.99,
     "shipping": 10.00,
     "total": 2869.97
   }
   ↓
2. BACKEND PROCESSING
   ↓
   OrderController@store
   ↓
   StoreOrderRequest → Validate input
   ↓
   OrderService@create
   ↓
3. DATABASE TRANSACTION
   ↓
   Start Transaction
   ↓
   Create Order → Insert to orders table
   - Generate order_number: "ORD-2024-0001"
   - Status: "pending"
   - Payment status: "pending"
   ↓
   Create Order Items → Insert to order_items table
   - For each item:
     * Save product snapshot (price, name)
     * Link to order
   ↓
   Reserve Inventory → Decrease stock
   - Product 1: 50 → 48 (sold 2 units)
   ↓
   Create Inventory Logs → Track stock changes
   ↓
   Create Status History → Track order status
   {
     "from_status": null,
     "to_status": "pending",
     "notes": "Order created"
   }
   ↓
   Commit Transaction
   ↓
4. POST-PROCESSING
   ↓
   Queue Email → Send order confirmation
   ↓
   Queue Notification → Notify admin
   ↓
   Cache Invalidation → Clear related caches
   ↓
5. RESPONSE
   ↓
   Return Order → With items, customer, history
   ↓
   Frontend → Display success message
   ↓
   User → Nakita ang bagong order! ✅

6. UPDATE ORDER STATUS (Pag-update ng Status)
   ↓
   User → Click "Confirm Order"
   ↓
   Frontend → PATCH /api/v1/orders/1/status
   {
     "status": "confirmed",
     "notes": "Payment verified"
   }
   ↓
   Backend → OrderController@updateStatus
   ↓
   Validation → Check valid status transition
   - pending → confirmed ✅
   - delivered → pending ❌ (not allowed)
   ↓
   Service → OrderService@updateStatus
   ↓
   Update Order → Change status
   ↓
   Create History → Log status change
   {
     "from_status": "pending",
     "to_status": "confirmed",
     "user_id": 1,
     "notes": "Payment verified"
   }
   ↓
   Queue Notification → Notify customer
   ↓
   Response → Return updated order
   ↓
   User → Nakita ang updated status! ✅

7. COMPLETE ORDER LIFECYCLE
   ↓
   pending → confirmed → processing → shipped → delivered
   ↓
   Each transition:
   - Validated
   - Logged
   - Notified
   - Tracked
```

---

## 💬 4. MESSAGING FLOW (Pag-message sa Customer)

```
1. CUSTOMER SENDS MESSAGE
   ↓
   Customer → Opens chat
   ↓
   Types message: "When will my order arrive?"
   ↓
   Frontend → POST /api/v1/conversations/1/messages
   {
     "message": "When will my order arrive?"
   }
   ↓
2. BACKEND PROCESSING
   ↓
   MessageController@sendMessage
   ↓
   Create Message → Insert to messages table
   {
     "conversation_id": 1,
     "sender_type": "customer",
     "sender_id": 1,
     "message": "When will my order arrive?",
     "is_read": false
   }
   ↓
3. AI SENTIMENT ANALYSIS (Optional)
   ↓
   SentimentAnalysisService → Analyze message
   ↓
   Detect sentiment: "neutral"
   Detect urgency: "medium"
   ↓
   If urgent → Auto-prioritize conversation
   ↓
4. NOTIFICATION
   ↓
   Queue Notification → Notify assigned staff
   ↓
   Email/SMS → "New message from customer"
   ↓
5. STAFF RESPONSE
   ↓
   Staff → Opens conversation
   ↓
   Types reply: "Your order will arrive in 2-3 days"
   ↓
   Frontend → POST /api/v1/conversations/1/messages
   {
     "message": "Your order will arrive in 2-3 days"
   }
   ↓
   Backend → Create message (sender_type: "user")
   ↓
   Mark Previous Messages → is_read = true
   ↓
   Queue Notification → Notify customer
   ↓
6. CUSTOMER RECEIVES
   ↓
   Customer → Sees reply
   ↓
   Conversation updated! ✅
```

---

## 📊 5. REPORTS & DASHBOARD FLOW (Pag-generate ng Reports)

```
1. DASHBOARD LOAD
   ↓
   User → Opens dashboard
   ↓
   Frontend → Multiple API calls:
   - GET /api/v1/dashboard/summary
   - GET /api/v1/dashboard/sales-chart
   - GET /api/v1/dashboard/top-products
   ↓
2. SUMMARY ENDPOINT
   ↓
   ReportController@summary
   ↓
   Check Cache → Redis key: "dashboard:summary"
   ↓
   If cached (< 5 minutes) → Return cached data
   ↓
   If not cached:
   ↓
   ReportService@summary
   ↓
   Query Database:
   - Total revenue (sum of orders.total)
   - Total orders (count)
   - Pending orders (where status = 'pending')
   - Low stock products (where stock <= threshold)
   - Total customers (count)
   ↓
   Calculate Changes:
   - Compare with previous period
   - Calculate percentage change
   ↓
   Cache Result → Store in Redis (5 min TTL)
   ↓
   Return Data:
   {
     "total_revenue": "125000.00",
     "total_orders": 450,
     "pending_orders": 23,
     "low_stock_products": 8,
     "revenue_change": 12.5
   }
   ↓
3. SALES CHART
   ↓
   ReportController@salesChart
   ↓
   Query Orders → Group by date
   ↓
   Calculate Daily Sales → Last 30 days
   ↓
   Return Chart Data:
   {
     "labels": ["2024-01-01", "2024-01-02", ...],
     "data": [1200.50, 1500.75, ...]
   }
   ↓
4. FRONTEND RENDERING
   ↓
   StatCard components → Display KPIs
   ↓
   Chart component → Render sales chart
   ↓
   Table component → Show top products
   ↓
   User → Nakita ang dashboard! ✅

5. CSV EXPORT
   ↓
   User → Click "Export Sales Report"
   ↓
   Frontend → GET /api/v1/reports/sales/export
   ↓
   Backend → ReportController@exportSales
   ↓
   ReportService@exportSales
   ↓
   Query Data → Get sales data
   ↓
   Generate CSV:
   - Add UTF-8 BOM (for Excel)
   - Format columns
   - Add headers
   ↓
   Stream Response → Download file
   ↓
   User → File downloaded! ✅
```

---

## 🔐 6. AUTHENTICATION & AUTHORIZATION FLOW

```
1. AUTHENTICATION (Sanctum Token)
   ↓
   Every API request includes:
   Header: Authorization: Bearer {token}
   ↓
   Middleware → auth:sanctum
   ↓
   Sanctum → Verify token in personal_access_tokens table
   ↓
   If valid → Set $request->user()
   If invalid → Return 401 Unauthorized
   ↓
2. AUTHORIZATION (Policies)
   ↓
   Controller → $this->authorize('update', $product)
   ↓
   Policy → ProductPolicy@update
   ↓
   Check Rules:
   - Is user admin? → Allow
   - Is user staff? → Allow
   - Otherwise → Deny
   ↓
   If allowed → Continue
   If denied → Return 403 Forbidden
   ↓
3. ROLE-BASED ACCESS
   ↓
   User has role: "admin" or "staff"
   ↓
   Spatie Permission → Check role
   ↓
   Admin → Full access
   Staff → Limited access (no delete)
```

---

## ⚡ 7. CACHING FLOW (Pag-cache ng Data)

```
1. REQUEST COMES IN
   ↓
   GET /api/v1/dashboard/summary
   ↓
2. CHECK CACHE
   ↓
   Cache::remember('dashboard:summary', 300, function() {
     // Query database
   })
   ↓
   Redis → Check if key exists
   ↓
3. IF CACHED
   ↓
   Return cached data (super fast! <10ms)
   ↓
4. IF NOT CACHED
   ↓
   Execute query → Get from database
   ↓
   Store in Redis → Set TTL (5 minutes)
   ↓
   Return data
   ↓
5. CACHE INVALIDATION
   ↓
   When product updated:
   Cache::forget('products:list')
   Cache::forget('dashboard:summary')
   ↓
   Next request → Fresh data from database
```

---

## 🔄 8. QUEUE & BACKGROUND JOBS FLOW

```
1. DISPATCH JOB
   ↓
   ProcessOrderJob::dispatch($order)
   ↓
2. QUEUE SYSTEM
   ↓
   Job → Pushed to Redis queue
   ↓
   Laravel Horizon → Monitoring queues
   ↓
3. WORKER PROCESSES
   ↓
   Queue Worker → Picks up job
   ↓
   Execute → ProcessOrderJob@handle
   ↓
   Process Order:
   - Send confirmation email
   - Update inventory
   - Create invoice
   - Notify warehouse
   ↓
4. IF SUCCESS
   ↓
   Job completed → Remove from queue
   ↓
5. IF FAILED
   ↓
   Retry → Up to 3 times
   ↓
   If still fails → Move to failed_jobs table
   ↓
   Notify admin → Email alert
```

---

## 🎯 9. COMPLETE USER JOURNEY EXAMPLE

### Scenario: Admin adds product, customer orders it

```
DAY 1 - ADMIN ADDS PRODUCT
─────────────────────────────
1. Admin logs in
2. Goes to Products page
3. Clicks "Add Product"
4. Fills form:
   - Name: "Wireless Mouse"
   - Price: $29.99
   - Stock: 100 units
5. Saves product
6. System creates product in database
7. System logs inventory (100 units added)
8. Cache invalidated
9. Product appears in list

DAY 2 - CUSTOMER PLACES ORDER
──────────────────────────────
1. Customer browses products
2. Finds "Wireless Mouse"
3. Adds to cart (quantity: 2)
4. Proceeds to checkout
5. System creates order:
   - Order #ORD-2024-0001
   - Status: pending
   - Total: $59.98 + tax + shipping
6. System reserves inventory:
   - Stock: 100 → 98 units
7. System logs inventory change
8. System sends confirmation email
9. System notifies admin

DAY 3 - ADMIN PROCESSES ORDER
──────────────────────────────
1. Admin sees new order notification
2. Opens order details
3. Verifies payment
4. Updates status: pending → confirmed
5. System logs status change
6. System notifies customer
7. Admin updates status: confirmed → processing
8. Admin updates status: processing → shipped
9. System sends tracking email

DAY 5 - ORDER DELIVERED
───────────────────────
1. Admin updates status: shipped → delivered
2. System logs final status
3. System sends delivery confirmation
4. Order complete! ✅

THROUGHOUT - REPORTING
──────────────────────
1. Dashboard updates in real-time
2. Sales reports show new order
3. Inventory reports show stock changes
4. Customer reports show new customer
5. All data cached for performance
```

---

## 🔍 10. DATA FLOW SUMMARY

### Request → Response Cycle:

```
USER ACTION
    ↓
FRONTEND (React)
    ↓ HTTP Request (JSON)
NGINX (Web Server)
    ↓ Proxy Pass
LARAVEL (Backend)
    ↓
MIDDLEWARE (Auth, Security)
    ↓
CONTROLLER (Handle Request)
    ↓
SERVICE (Business Logic)
    ↓
MODEL (Database Query)
    ↓
DATABASE (PostgreSQL)
    ↓ Query Result
MODEL (Transform Data)
    ↓
SERVICE (Process Data)
    ↓
RESOURCE (Format Response)
    ↓
CONTROLLER (Return Response)
    ↓
MIDDLEWARE (Add Headers)
    ↓ HTTP Response (JSON)
FRONTEND (React)
    ↓
UPDATE UI
    ↓
USER SEES RESULT ✅
```

---

## 📝 Key Takeaways (Mga Importanteng Punto)

### 1. **Layered Architecture**
- Frontend (React) - User interface
- Backend (Laravel) - Business logic
- Database (PostgreSQL) - Data storage
- Cache (Redis) - Performance
- Queue (Horizon) - Background jobs

### 2. **Security at Every Layer**
- Authentication (Sanctum tokens)
- Authorization (Policies)
- Validation (Form Requests)
- Rate Limiting (Prevent abuse)
- Security Headers (Protect from attacks)

### 3. **Performance Optimization**
- Caching (Redis)
- Database Indexing
- Query Optimization
- Lazy Loading (Frontend)
- Background Jobs (Queue)

### 4. **Data Integrity**
- Database Transactions
- Row Locking (Prevent race conditions)
- Audit Logging (Track changes)
- Soft Deletes (Never lose data)
- Validation (Ensure data quality)

### 5. **User Experience**
- Fast Response Times (<200ms)
- Real-time Updates
- Error Handling
- Loading States
- Success Notifications

---

## 🎓 Conclusion

Ang buong system ay gumagana ng:

1. **Modular** - Bawat parte ay hiwalay at madaling i-maintain
2. **Secure** - May authentication, authorization, at validation
3. **Fast** - May caching at optimization
4. **Reliable** - May error handling at logging
5. **Scalable** - Pwedeng lumaki ang system

**Lahat ng parte ay magkakaugnay pero independent!** ✅

---

**Last Updated:** 2026-05-01  
**Language:** Tagalog + English (Technical Terms)

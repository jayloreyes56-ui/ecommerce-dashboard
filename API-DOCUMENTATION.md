# API Documentation

## eCommerce Dashboard REST API

Base URL: `http://localhost:8000/api/v1`

---

## Authentication

All protected endpoints require authentication using Laravel Sanctum tokens.

### Login

**POST** `/auth/login`

**Rate Limit:** 10 requests per minute

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "is_active": true
  },
  "token": "1|abc123..."
}
```

**Error Response (401):**
```json
{
  "message": "Invalid credentials"
}
```

---

### Logout

**POST** `/auth/logout`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

### Logout All Devices

**POST** `/auth/logout-all`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Logged out from all devices"
}
```

---

### Get Current User

**GET** `/auth/me`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "id": 1,
  "name": "Admin User",
  "email": "admin@example.com",
  "role": "admin",
  "is_active": true,
  "notification_settings": {
    "email_notifications": true,
    "order_notifications": true,
    "low_stock_alerts": true
  }
}
```

---

## Products

### List Products

**GET** `/products`

**Query Parameters:**
- `search` (string) - Search by name, SKU, or description
- `category_id` (integer) - Filter by category
- `min_price` (decimal) - Minimum price
- `max_price` (decimal) - Maximum price
- `in_stock` (boolean) - Filter by stock availability
- `per_page` (integer) - Items per page (default: 15)
- `page` (integer) - Page number

**Example:**
```
GET /products?search=laptop&category_id=1&in_stock=true&per_page=20
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "category_id": 1,
      "sku": "PROD-001",
      "name": "Laptop Pro 15",
      "description": "High-performance laptop",
      "price": "1299.99",
      "cost": "899.00",
      "stock_quantity": 50,
      "low_stock_threshold": 10,
      "images": ["https://..."],
      "is_active": true,
      "category": {
        "id": 1,
        "name": "Electronics"
      },
      "created_at": "2024-01-01T00:00:00.000000Z",
      "updated_at": "2024-01-01T00:00:00.000000Z"
    }
  ],
  "links": {...},
  "meta": {
    "current_page": 1,
    "total": 100,
    "per_page": 15
  }
}
```

---

### Get Product

**GET** `/products/{id}`

**Response (200):**
```json
{
  "id": 1,
  "category_id": 1,
  "sku": "PROD-001",
  "name": "Laptop Pro 15",
  "description": "High-performance laptop",
  "price": "1299.99",
  "cost": "899.00",
  "stock_quantity": 50,
  "low_stock_threshold": 10,
  "images": ["https://..."],
  "is_active": true,
  "category": {
    "id": 1,
    "name": "Electronics"
  }
}
```

---

### Create Product

**POST** `/products`

**Authorization:** Admin only

**Request Body:**
```json
{
  "category_id": 1,
  "sku": "PROD-002",
  "name": "Wireless Mouse",
  "description": "Ergonomic wireless mouse",
  "price": 29.99,
  "cost": 15.00,
  "stock_quantity": 100,
  "low_stock_threshold": 20,
  "is_active": true
}
```

**Response (201):**
```json
{
  "id": 2,
  "category_id": 1,
  "sku": "PROD-002",
  "name": "Wireless Mouse",
  ...
}
```

---

### Update Product

**PUT** `/products/{id}`

**Authorization:** Admin only

**Request Body:**
```json
{
  "name": "Wireless Mouse Pro",
  "price": 34.99,
  "stock_quantity": 150
}
```

**Response (200):**
```json
{
  "id": 2,
  "name": "Wireless Mouse Pro",
  "price": "34.99",
  ...
}
```

---

### Delete Product

**DELETE** `/products/{id}`

**Authorization:** Admin only

**Response (204):** No content

---

### Bulk Delete Products

**POST** `/products/bulk-delete`

**Authorization:** Admin only

**Request Body:**
```json
{
  "ids": [1, 2, 3, 4, 5]
}
```

**Response (200):**
```json
{
  "message": "5 products deleted successfully",
  "deleted": 5,
  "failed": 0,
  "errors": []
}
```

---

### Adjust Stock

**POST** `/products/{id}/stock`

**Authorization:** Admin, Staff

**Request Body:**
```json
{
  "quantity": -5,
  "reason": "Sold to customer"
}
```

**Response (200):**
```json
{
  "message": "Stock adjusted successfully",
  "product": {
    "id": 1,
    "stock_quantity": 45
  }
}
```

---

### Get Stock Logs

**GET** `/products/{id}/stock/logs`

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "product_id": 1,
      "user_id": 1,
      "change": -5,
      "reason": "Sold to customer",
      "previous_quantity": 50,
      "new_quantity": 45,
      "user": {
        "id": 1,
        "name": "Admin User"
      },
      "created_at": "2024-01-01T00:00:00.000000Z"
    }
  ]
}
```

---

## Orders

### List Orders

**GET** `/orders`

**Query Parameters:**
- `search` (string) - Search by order number or customer
- `status` (string) - Filter by status
- `payment_status` (string) - Filter by payment status
- `date_from` (date) - Start date
- `date_to` (date) - End date
- `per_page` (integer) - Items per page

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "order_number": "ORD-2024-0001",
      "customer_id": 1,
      "status": "pending",
      "payment_status": "pending",
      "subtotal": "1299.99",
      "tax": "129.99",
      "shipping": "10.00",
      "total": "1439.98",
      "notes": null,
      "customer": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      },
      "items_count": 2,
      "created_at": "2024-01-01T00:00:00.000000Z"
    }
  ]
}
```

---

### Get Order

**GET** `/orders/{id}`

**Response (200):**
```json
{
  "id": 1,
  "order_number": "ORD-2024-0001",
  "customer_id": 1,
  "status": "pending",
  "payment_status": "pending",
  "subtotal": "1299.99",
  "tax": "129.99",
  "shipping": "10.00",
  "total": "1439.98",
  "notes": null,
  "customer": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "items": [
    {
      "id": 1,
      "product_id": 1,
      "quantity": 1,
      "price": "1299.99",
      "subtotal": "1299.99",
      "product": {
        "id": 1,
        "name": "Laptop Pro 15",
        "sku": "PROD-001"
      }
    }
  ],
  "status_history": [
    {
      "id": 1,
      "from_status": null,
      "to_status": "pending",
      "notes": "Order created",
      "user": {
        "id": 1,
        "name": "Admin User"
      },
      "created_at": "2024-01-01T00:00:00.000000Z"
    }
  ]
}
```

---

### Create Order

**POST** `/orders`

**Request Body:**
```json
{
  "customer_id": 1,
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "price": 29.99
    }
  ],
  "subtotal": 59.98,
  "tax": 5.99,
  "shipping": 10.00,
  "total": 75.97,
  "notes": "Rush delivery"
}
```

**Response (201):**
```json
{
  "id": 2,
  "order_number": "ORD-2024-0002",
  ...
}
```

---

### Update Order Status

**PATCH** `/orders/{id}/status`

**Request Body:**
```json
{
  "status": "confirmed",
  "notes": "Payment verified"
}
```

**Response (200):**
```json
{
  "message": "Order status updated successfully",
  "order": {
    "id": 1,
    "status": "confirmed"
  }
}
```

---

### Update Payment Status

**PATCH** `/orders/{id}/payment`

**Request Body:**
```json
{
  "payment_status": "paid",
  "notes": "Payment received via credit card"
}
```

**Response (200):**
```json
{
  "message": "Payment status updated successfully"
}
```

---

### Cancel Order

**POST** `/orders/{id}/cancel`

**Request Body:**
```json
{
  "reason": "Customer requested cancellation"
}
```

**Response (200):**
```json
{
  "message": "Order cancelled successfully"
}
```

---

## Customers

### List Customers

**GET** `/customers`

**Query Parameters:**
- `search` (string) - Search by name, email, or phone
- `per_page` (integer) - Items per page

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zip_code": "10001",
      "country": "USA",
      "orders_count": 5,
      "total_spent": "2500.00",
      "created_at": "2024-01-01T00:00:00.000000Z"
    }
  ]
}
```

---

### Get Customer

**GET** `/customers/{id}`

**Response (200):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zip_code": "10001",
  "country": "USA",
  "notes": "VIP customer",
  "orders_count": 5,
  "total_spent": "2500.00"
}
```

---

### Create Customer

**POST** `/customers`

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1234567891",
  "address": "456 Oak Ave",
  "city": "Los Angeles",
  "state": "CA",
  "zip_code": "90001",
  "country": "USA",
  "notes": "Prefers email communication"
}
```

**Response (201):**
```json
{
  "id": 2,
  "name": "Jane Smith",
  ...
}
```

---

### Update Customer

**PUT** `/customers/{id}`

**Request Body:**
```json
{
  "phone": "+1234567892",
  "notes": "Updated contact information"
}
```

**Response (200):**
```json
{
  "id": 1,
  "phone": "+1234567892",
  ...
}
```

---

### Get Customer Orders

**GET** `/customers/{id}/orders`

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "order_number": "ORD-2024-0001",
      "status": "delivered",
      "total": "1439.98",
      "created_at": "2024-01-01T00:00:00.000000Z"
    }
  ]
}
```

---

## Messages / Conversations

### List Conversations

**GET** `/conversations`

**Query Parameters:**
- `status` (string) - Filter by status (open, closed)
- `assigned_to` (integer) - Filter by assigned user

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "customer_id": 1,
      "assigned_to": 1,
      "status": "open",
      "subject": "Order inquiry",
      "last_message_at": "2024-01-01T12:00:00.000000Z",
      "unread_count": 2,
      "customer": {
        "id": 1,
        "name": "John Doe"
      },
      "assigned_user": {
        "id": 1,
        "name": "Admin User"
      }
    }
  ]
}
```

---

### Get Conversation

**GET** `/conversations/{id}`

**Response (200):**
```json
{
  "id": 1,
  "customer_id": 1,
  "assigned_to": 1,
  "status": "open",
  "subject": "Order inquiry",
  "customer": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "messages": [
    {
      "id": 1,
      "sender_type": "customer",
      "sender_id": 1,
      "message": "When will my order arrive?",
      "is_read": true,
      "created_at": "2024-01-01T10:00:00.000000Z"
    },
    {
      "id": 2,
      "sender_type": "user",
      "sender_id": 1,
      "message": "Your order will arrive in 2-3 business days.",
      "is_read": true,
      "created_at": "2024-01-01T10:30:00.000000Z"
    }
  ]
}
```

---

### Send Message

**POST** `/conversations/{id}/messages`

**Request Body:**
```json
{
  "message": "Thank you for your inquiry. Your order is on the way!"
}
```

**Response (201):**
```json
{
  "id": 3,
  "message": "Thank you for your inquiry. Your order is on the way!",
  "sender_type": "user",
  "sender_id": 1,
  "created_at": "2024-01-01T11:00:00.000000Z"
}
```

---

### Mark as Read

**POST** `/conversations/{id}/read`

**Response (200):**
```json
{
  "message": "Conversation marked as read"
}
```

---

### Assign Conversation

**PATCH** `/conversations/{id}/assign`

**Request Body:**
```json
{
  "user_id": 2
}
```

**Response (200):**
```json
{
  "message": "Conversation assigned successfully"
}
```

---

### Close Conversation

**PATCH** `/conversations/{id}/close`

**Response (200):**
```json
{
  "message": "Conversation closed successfully"
}
```

---

### Reopen Conversation

**PATCH** `/conversations/{id}/reopen`

**Response (200):**
```json
{
  "message": "Conversation reopened successfully"
}
```

---

## Reports & Dashboard

### Dashboard Summary

**GET** `/dashboard/summary`

**Response (200):**
```json
{
  "total_revenue": "125000.00",
  "total_orders": 450,
  "pending_orders": 23,
  "low_stock_products": 8,
  "total_customers": 156,
  "revenue_change": 12.5,
  "orders_change": -3.2
}
```

---

### Sales Chart

**GET** `/dashboard/sales-chart`

**Query Parameters:**
- `period` (string) - daily, weekly, monthly (default: daily)
- `days` (integer) - Number of days (default: 30)

**Response (200):**
```json
{
  "labels": ["2024-01-01", "2024-01-02", ...],
  "data": [1200.50, 1500.75, ...]
}
```

---

### Top Products

**GET** `/dashboard/top-products`

**Query Parameters:**
- `limit` (integer) - Number of products (default: 10)

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Laptop Pro 15",
      "total_sold": 45,
      "revenue": "58499.55"
    }
  ]
}
```

---

### Sales Report

**GET** `/reports/sales`

**Query Parameters:**
- `date_from` (date) - Start date
- `date_to` (date) - End date
- `group_by` (string) - day, week, month

**Response (200):**
```json
{
  "summary": {
    "total_revenue": "125000.00",
    "total_orders": 450,
    "average_order_value": "277.78"
  },
  "data": [
    {
      "date": "2024-01-01",
      "revenue": "5000.00",
      "orders": 18
    }
  ]
}
```

---

### Export Sales Report

**GET** `/reports/sales/export`

**Query Parameters:**
- `date_from` (date) - Start date
- `date_to` (date) - End date

**Response:** CSV file download

---

### Customer Report

**GET** `/reports/customers`

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "total_orders": 12,
      "total_spent": "3500.00",
      "average_order_value": "291.67",
      "last_order_date": "2024-01-15"
    }
  ]
}
```

---

### Export Customer Report

**GET** `/reports/customers/export`

**Response:** CSV file download

---

### Export Products

**GET** `/reports/products/export`

**Response:** CSV file download

---

## Profile & Settings

### Get Profile

**GET** `/profile`

**Response (200):**
```json
{
  "id": 1,
  "name": "Admin User",
  "email": "admin@example.com",
  "role": "admin",
  "is_active": true,
  "notification_settings": {
    "email_notifications": true,
    "order_notifications": true,
    "low_stock_alerts": true
  }
}
```

---

### Update Profile

**PUT** `/profile`

**Request Body:**
```json
{
  "name": "Admin User Updated",
  "email": "admin.new@example.com"
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "name": "Admin User Updated",
    "email": "admin.new@example.com"
  }
}
```

---

### Change Password

**PUT** `/profile/password`

**Request Body:**
```json
{
  "current_password": "oldpassword123",
  "password": "newpassword123",
  "password_confirmation": "newpassword123"
}
```

**Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

---

### Get Notification Settings

**GET** `/profile/notifications`

**Response (200):**
```json
{
  "email_notifications": true,
  "order_notifications": true,
  "low_stock_alerts": true
}
```

---

### Update Notification Settings

**PUT** `/profile/notifications`

**Request Body:**
```json
{
  "email_notifications": true,
  "order_notifications": false,
  "low_stock_alerts": true
}
```

**Response (200):**
```json
{
  "message": "Notification settings updated successfully"
}
```

---

## Users (Admin Only)

### List Users

**GET** `/users`

**Authorization:** Admin only

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000000Z"
    }
  ]
}
```

---

### Create User

**POST** `/users`

**Authorization:** Admin only

**Request Body:**
```json
{
  "name": "New Staff",
  "email": "staff@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "role": "staff",
  "is_active": true
}
```

**Response (201):**
```json
{
  "id": 3,
  "name": "New Staff",
  "email": "staff@example.com",
  "role": "staff"
}
```

---

### Update User

**PUT** `/users/{id}`

**Authorization:** Admin only

**Request Body:**
```json
{
  "name": "Updated Name",
  "is_active": false
}
```

**Response (200):**
```json
{
  "id": 3,
  "name": "Updated Name",
  "is_active": false
}
```

---

### Delete User

**DELETE** `/users/{id}`

**Authorization:** Admin only

**Response (204):** No content

---

## Categories

### List Categories

**GET** `/categories`

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Electronics",
      "description": "Electronic devices and accessories",
      "is_active": true,
      "products_count": 45
    }
  ]
}
```

---

### Create Category

**POST** `/categories`

**Authorization:** Admin only

**Request Body:**
```json
{
  "name": "Clothing",
  "description": "Apparel and accessories",
  "is_active": true
}
```

**Response (201):**
```json
{
  "id": 2,
  "name": "Clothing",
  "description": "Apparel and accessories",
  "is_active": true
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Validation error",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthenticated."
}
```

### 403 Forbidden
```json
{
  "message": "This action is unauthorized."
}
```

### 404 Not Found
```json
{
  "message": "Resource not found."
}
```

### 429 Too Many Requests
```json
{
  "message": "Too many requests. Please try again later."
}
```

### 500 Internal Server Error
```json
{
  "message": "Server error occurred. Please try again later."
}
```

---

## Rate Limiting

- **Login:** 10 requests per minute
- **General API:** 60 requests per minute
- **Reports:** 30 requests per minute (configurable)

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
Retry-After: 60
```

---

## Pagination

All list endpoints support pagination with the following parameters:
- `page` - Page number (default: 1)
- `per_page` - Items per page (default: 15, max: 100)

Pagination metadata is included in responses:
```json
{
  "data": [...],
  "links": {
    "first": "http://api.example.com/products?page=1",
    "last": "http://api.example.com/products?page=10",
    "prev": null,
    "next": "http://api.example.com/products?page=2"
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 10,
    "per_page": 15,
    "to": 15,
    "total": 150
  }
}
```

---

## Postman Collection

Import this collection into Postman for easy API testing:

1. Download the collection: [Download Postman Collection](#)
2. Import into Postman
3. Set environment variables:
   - `base_url`: `http://localhost:8000/api/v1`
   - `token`: Your authentication token

---

**Last Updated:** 2026-05-01  
**API Version:** 1.0.0

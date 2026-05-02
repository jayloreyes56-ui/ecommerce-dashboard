# eCommerce Operations Dashboard

A full-stack internal eCommerce management system built for store owners and operations staff — similar to Shopify Admin or WooCommerce Dashboard.

**Live Demo:** https://ecommerce-dashboard-psi-dusky.vercel.app

> **Demo Accounts:**
> - Admin: `admin@company.com` / `Admin@1234`
> - Staff: `staff@company.com` / `Staff@1234`

---

## Features

- **Dashboard** — Sales analytics, revenue charts, KPI summaries, top products
- **Products** — Full CRUD with inventory tracking, stock adjustments, and low-stock alerts
- **Orders** — Order lifecycle management with status tracking and history
- **Customers** — Customer profiles with order history
- **Reports** — Sales and customer reports with date range filtering
- **Messages** — Internal conversation system with customers
- **Role-based Access** — Admin and Staff permission levels via Spatie Laravel Permission

---

## Tech Stack

**Backend**
- PHP 8.4 / Laravel 11
- PostgreSQL (Supabase)
- Laravel Sanctum (API token authentication)
- Spatie Laravel Permission (RBAC)
- Docker

**Frontend**
- React 18 + TypeScript
- Tailwind CSS
- React Query (TanStack Query)
- React Hook Form + Zod
- Recharts

**Infrastructure**
- Backend: Render (Docker)
- Frontend: Vercel
- Database: Supabase PostgreSQL

---

## Architecture

```
Frontend (Vercel)          Backend (Render)         Database (Supabase)
React + TypeScript   →     Laravel 11 REST API   →  PostgreSQL
                           Docker Container
```

---

## Local Development

### Backend
```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Login |
| GET | `/api/v1/dashboard/summary` | Dashboard KPIs |
| GET | `/api/v1/products` | List products |
| GET | `/api/v1/orders` | List orders |
| GET | `/api/v1/customers` | List customers |
| GET | `/api/v1/reports/sales` | Sales report |

---

## Note

This is an **internal operations dashboard**, not a customer-facing storefront. It is designed for store owners and staff to manage their eCommerce business backend.

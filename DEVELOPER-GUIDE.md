# Developer Onboarding Guide

Welcome to the eCommerce Dashboard project! This guide will help you get started with development.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Getting Started](#getting-started)
4. [Project Structure](#project-structure)
5. [Development Workflow](#development-workflow)
6. [Coding Standards](#coding-standards)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)
10. [Resources](#resources)

---

## Project Overview

### What is this project?

An eCommerce operations dashboard for managing products, orders, customers, and inventory. Built with Laravel (backend) and React (frontend).

### Key Features

- **Product Management** - CRUD operations, stock tracking, bulk operations
- **Order Management** - Order processing, status tracking, payment management
- **Customer Management** - Customer profiles, order history
- **Messaging** - Customer communication system
- **Reports & Analytics** - Sales reports, customer analytics, data export
- **User Management** - Role-based access control (Admin, Staff)
- **Settings** - Profile management, notifications

### Tech Stack

**Backend:**
- PHP 8.2+
- Laravel 11
- PostgreSQL / SQLite
- Redis (caching & queues)
- Laravel Sanctum (authentication)
- Spatie Permissions (authorization)

**Frontend:**
- React 18
- TypeScript
- Vite
- React Router v6
- TanStack Query (React Query)
- Tailwind CSS
- Axios

**DevOps:**
- Docker & Docker Compose
- Nginx
- GitHub Actions (CI/CD)

---

## Prerequisites

### Required Software

1. **PHP 8.2 or higher**
   ```bash
   php -v
   ```

2. **Composer** (PHP package manager)
   ```bash
   composer --version
   ```

3. **Node.js 18+ and npm**
   ```bash
   node -v
   npm -v
   ```

4. **Database** (choose one):
   - PostgreSQL 14+ (production)
   - SQLite (development)

5. **Redis** (optional but recommended)
   ```bash
   redis-cli ping
   ```

6. **Git**
   ```bash
   git --version
   ```

### Optional Tools

- **Docker & Docker Compose** (for containerized development)
- **Postman** or **Insomnia** (API testing)
- **VS Code** with extensions:
  - PHP Intelephense
  - Laravel Extension Pack
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense

---

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ecommerce-dashboard
```

### 2. Backend Setup

```bash
cd backend

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database in .env
# For SQLite (development):
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/database.sqlite

# For PostgreSQL (production):
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=ecommerce_dashboard
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Create SQLite database (if using SQLite)
touch database/database.sqlite

# Run migrations
php artisan migrate

# Seed database with sample data
php artisan db:seed

# Start development server
php artisan serve
```

Backend will be available at: `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure API URL in .env
VITE_API_URL=http://localhost:8000/api/v1

# Start development server
npm run dev
```

Frontend will be available at: `http://localhost:3000`

### 4. Test Login

**Default Credentials:**
- **Admin:** admin@example.com / password
- **Staff:** staff@example.com / password

---

## Docker Setup (Alternative)

If you prefer Docker:

```bash
# Copy environment file
cp .env.docker .env

# Build and start containers
docker-compose up -d

# Run migrations inside container
docker-compose exec php php artisan migrate --seed

# Access the application
# Frontend: http://dashboard.localhost
# Backend API: http://api.localhost
```

---

## Project Structure

### Backend Structure

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/V1/          # API controllers
│   │   ├── Middleware/          # Custom middleware
│   │   ├── Requests/            # Form request validation
│   │   └── Resources/           # API resources (transformers)
│   ├── Models/                  # Eloquent models
│   ├── Policies/                # Authorization policies
│   └── Services/                # Business logic services
├── config/                      # Configuration files
├── database/
│   ├── migrations/              # Database migrations
│   └── seeders/                 # Database seeders
├── routes/
│   └── api.php                  # API routes
├── tests/                       # PHPUnit tests
└── .env                         # Environment variables
```

### Frontend Structure

```
frontend/
├── src/
│   ├── api/                     # API client functions
│   ├── components/
│   │   ├── layout/              # Layout components
│   │   └── ui/                  # Reusable UI components
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utilities (axios, queryClient)
│   ├── pages/                   # Page components
│   ├── router/                  # React Router configuration
│   ├── types/                   # TypeScript types
│   ├── utils/                   # Utility functions
│   ├── App.tsx                  # Root component
│   └── main.tsx                 # Entry point
├── public/                      # Static assets
└── .env                         # Environment variables
```

---

## Development Workflow

### 1. Creating a New Feature

#### Backend (Laravel)

**Step 1: Create Migration**
```bash
php artisan make:migration create_feature_table
```

**Step 2: Create Model**
```bash
php artisan make:model Feature -m
```

**Step 3: Create Controller**
```bash
php artisan make:controller Api/V1/FeatureController --api
```

**Step 4: Create Form Requests**
```bash
php artisan make:request Feature/StoreFeatureRequest
php artisan make:request Feature/UpdateFeatureRequest
```

**Step 5: Create Resource**
```bash
php artisan make:resource FeatureResource
```

**Step 6: Create Policy (if needed)**
```bash
php artisan make:policy FeaturePolicy --model=Feature
```

**Step 7: Add Routes**
```php
// routes/api.php
Route::apiResource('features', FeatureController::class);
```

**Step 8: Run Migration**
```bash
php artisan migrate
```

#### Frontend (React)

**Step 1: Create API Client**
```typescript
// src/api/features.ts
export const featuresApi = {
  getAll: (params) => apiClient.get('/features', { params }),
  getOne: (id) => apiClient.get(`/features/${id}`),
  create: (data) => apiClient.post('/features', data),
  update: (id, data) => apiClient.put(`/features/${id}`, data),
  delete: (id) => apiClient.delete(`/features/${id}`),
};
```

**Step 2: Create Custom Hook**
```typescript
// src/hooks/useFeatures.ts
export function useFeatures(params) {
  return useQuery({
    queryKey: ['features', params],
    queryFn: () => featuresApi.getAll(params),
  });
}
```

**Step 3: Create Page Component**
```typescript
// src/pages/Features.tsx
export function Features() {
  const { data, isLoading } = useFeatures();
  // Component logic
}
```

**Step 4: Add Route**
```typescript
// src/router/index.tsx
<Route path="/features" element={<Features />} />
```

### 2. Making Changes

**Always:**
1. Create a new branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Test your changes
4. Commit with clear messages: `git commit -m "Add feature X"`
5. Push to remote: `git push origin feature/your-feature-name`
6. Create a Pull Request

### 3. Code Review Process

1. Submit PR with description of changes
2. Wait for code review
3. Address feedback
4. Get approval
5. Merge to main branch

---

## Coding Standards

### PHP / Laravel

**Follow PSR-12 coding standard:**

```php
<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Feature\StoreFeatureRequest;
use App\Models\Feature;
use Illuminate\Http\JsonResponse;

class FeatureController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $features = Feature::query()
            ->when(request('search'), function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->paginate(15);

        return response()->json($features);
    }

    /**
     * Store a newly created resource.
     */
    public function store(StoreFeatureRequest $request): JsonResponse
    {
        $feature = Feature::create($request->validated());

        return response()->json($feature, 201);
    }
}
```

**Best Practices:**
- Use type hints for parameters and return types
- Use Form Requests for validation
- Use Resources for API responses
- Use Services for complex business logic
- Use Policies for authorization
- Write descriptive comments for complex logic
- Keep controllers thin, models fat

### TypeScript / React

**Follow Airbnb style guide:**

```typescript
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { featuresApi } from '@/api/features';

interface FeatureListProps {
  onSelect: (id: number) => void;
}

export function FeatureList({ onSelect }: FeatureListProps) {
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['features', { search }],
    queryFn: () => featuresApi.getAll({ search }),
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="space-y-4">
      {data.map((feature) => (
        <div key={feature.id}>
          <h3>{feature.name}</h3>
          <Button onClick={() => onSelect(feature.id)}>
            Select
          </Button>
        </div>
      ))}
    </div>
  );
}
```

**Best Practices:**
- Use functional components with hooks
- Use TypeScript for type safety
- Use custom hooks for reusable logic
- Use React Query for server state
- Use Tailwind CSS for styling
- Keep components small and focused
- Extract reusable logic into hooks
- Use proper prop types

### Git Commit Messages

**Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(products): add bulk delete functionality

- Add bulk delete endpoint
- Add bulk delete UI
- Add confirmation modal

Closes #123
```

```
fix(orders): resolve status update bug

The order status was not updating correctly due to
missing validation in the request.

Fixes #456
```

---

## Testing

### Backend Testing (PHPUnit)

**Run all tests:**
```bash
cd backend
php artisan test
```

**Run specific test:**
```bash
php artisan test --filter ProductTest
```

**Create new test:**
```bash
php artisan make:test Feature/FeatureTest
php artisan make:test Unit/FeatureServiceTest --unit
```

**Example Test:**
```php
<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_products(): void
    {
        $user = User::factory()->create();
        Product::factory()->count(5)->create();

        $response = $this->actingAs($user)
            ->getJson('/api/v1/products');

        $response->assertStatus(200)
            ->assertJsonCount(5, 'data');
    }

    public function test_can_create_product(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/v1/products', [
                'name' => 'Test Product',
                'sku' => 'TEST-001',
                'price' => 99.99,
                'stock_quantity' => 10,
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'name' => 'Test Product',
            ]);

        $this->assertDatabaseHas('products', [
            'name' => 'Test Product',
        ]);
    }
}
```

### Frontend Testing (Vitest)

**Run tests:**
```bash
cd frontend
npm run test
```

**Run tests in watch mode:**
```bash
npm run test:watch
```

**Example Test:**
```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    screen.getByText('Click me').click();
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('shows loading state', () => {
    render(<Button isLoading>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

---

## Debugging

### Backend Debugging

**Enable debug mode:**
```env
APP_DEBUG=true
LOG_LEVEL=debug
```

**View logs:**
```bash
tail -f storage/logs/laravel.log
```

**Use dd() and dump():**
```php
dd($variable); // Dump and die
dump($variable); // Dump and continue
```

**Use Laravel Telescope (optional):**
```bash
composer require laravel/telescope --dev
php artisan telescope:install
php artisan migrate
```

Access at: `http://localhost:8000/telescope`

### Frontend Debugging

**Use React DevTools:**
- Install React DevTools browser extension
- Inspect component tree and props

**Use console.log:**
```typescript
console.log('Debug:', variable);
console.table(arrayData);
console.error('Error:', error);
```

**Use debugger:**
```typescript
function handleClick() {
  debugger; // Execution will pause here
  // Your code
}
```

**Check Network tab:**
- Open browser DevTools
- Go to Network tab
- Monitor API requests and responses

---

## Common Tasks

### Add a New API Endpoint

1. Create route in `routes/api.php`
2. Create controller method
3. Create Form Request for validation
4. Create Resource for response formatting
5. Add authorization in Policy
6. Test with Postman
7. Create frontend API client function
8. Create React hook
9. Use in component

### Add a New Page

1. Create page component in `src/pages/`
2. Add route in `src/router/index.tsx`
3. Add navigation link in Sidebar
4. Create necessary API hooks
5. Implement UI with existing components

### Update Database Schema

1. Create migration: `php artisan make:migration update_table_name`
2. Write up() and down() methods
3. Run migration: `php artisan migrate`
4. Update model if needed
5. Update seeders if needed

### Add a New Permission

1. Add permission in `RoleSeeder.php`
2. Run seeder: `php artisan db:seed --class=RoleSeeder`
3. Add authorization check in Policy
4. Add middleware to route if needed
5. Update frontend to hide/show based on role

---

## Environment Variables

### Backend (.env)

```env
# Application
APP_NAME="eCommerce Dashboard"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=sqlite
DB_DATABASE=/path/to/database.sqlite

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Cache & Queue
CACHE_DRIVER=redis
QUEUE_CONNECTION=redis

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)

```env
# API Configuration
VITE_API_URL=http://localhost:8000/api/v1

# App Configuration
VITE_APP_NAME="eCommerce Dashboard"
```

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy:**

```bash
# Using deploy script
./deploy.sh

# Or using Docker
./docker-deploy.sh
```

---

## Troubleshooting

### Backend Issues

**Issue: "Class not found"**
```bash
composer dump-autoload
```

**Issue: "Permission denied" on storage**
```bash
chmod -R 775 storage bootstrap/cache
```

**Issue: "Database locked" (SQLite)**
- Close other connections to database
- Restart development server

**Issue: "Token mismatch"**
```bash
php artisan config:clear
php artisan cache:clear
```

### Frontend Issues

**Issue: "Module not found"**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Issue: "CORS error"**
- Check `CORS_ALLOWED_ORIGINS` in backend `.env`
- Check `VITE_API_URL` in frontend `.env`
- Restart both servers

**Issue: "Build fails"**
```bash
npm run build -- --debug
```

### Docker Issues

**Issue: "Port already in use"**
```bash
docker-compose down
# Change ports in docker-compose.yml
docker-compose up -d
```

**Issue: "Container won't start"**
```bash
docker-compose logs <service-name>
```

---

## Resources

### Documentation

- [Laravel Documentation](https://laravel.com/docs)
- [React Documentation](https://react.dev)
- [TanStack Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [API Documentation](./API-DOCUMENTATION.md)
- [Component Documentation](./COMPONENT-DOCUMENTATION.md)

### Project Documentation

- [README.md](./README.md) - Project overview
- [API-DOCUMENTATION.md](./API-DOCUMENTATION.md) - API endpoints
- [COMPONENT-DOCUMENTATION.md](./COMPONENT-DOCUMENTATION.md) - Frontend components
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [SECURITY.md](./SECURITY.md) - Security guide
- [TESTING.md](./TESTING.md) - Testing guide
- [FEATURES.md](./FEATURES.md) - Feature list
- [PERFORMANCE.md](./PERFORMANCE.md) - Performance optimization

### Tools

- [Postman](https://www.postman.com/) - API testing
- [TablePlus](https://tableplus.com/) - Database GUI
- [Redis Commander](http://joeferner.github.io/redis-commander/) - Redis GUI

### Community

- Laravel Discord
- React Discord
- Stack Overflow

---

## Getting Help

### Internal Resources

1. Check this documentation
2. Review existing code for patterns
3. Check project issues on GitHub
4. Ask team members

### External Resources

1. Laravel documentation
2. React documentation
3. Stack Overflow
4. GitHub issues for packages

---

## Next Steps

Now that you're set up:

1. ✅ Explore the codebase
2. ✅ Run the application locally
3. ✅ Review the API documentation
4. ✅ Review the component documentation
5. ✅ Pick up your first task
6. ✅ Make your first contribution

**Welcome to the team! 🎉**

---

**Last Updated:** 2026-05-01  
**Version:** 1.0.0

# Testing Guide

## Overview

This document outlines the testing strategy and provides examples of tests for the eCommerce Dashboard.

---

## Test Structure

```
backend/tests/
├── Feature/          # Integration tests (API endpoints)
│   ├── AuthTest.php
│   ├── ProductTest.php
│   ├── OrderTest.php
│   └── ReportTest.php
├── Unit/             # Unit tests (Services, Models)
│   ├── ProductServiceTest.php
│   ├── OrderServiceTest.php
│   └── InventoryTest.php
└── TestCase.php      # Base test class

frontend/src/
├── __tests__/        # Frontend tests
│   ├── components/
│   ├── hooks/
│   └── utils/
└── setupTests.ts     # Test configuration
```

---

## Backend Testing (Laravel)

### Setup

```bash
cd backend

# Copy test environment
cp .env.testing.example .env.testing

# Run migrations for test database
php artisan migrate --env=testing

# Run all tests
php artisan test

# Run specific test file
php artisan test tests/Feature/AuthTest.php

# Run with coverage
php artisan test --coverage
```

### Test Database Configuration

`.env.testing`:
```env
DB_CONNECTION=sqlite
DB_DATABASE=:memory:

CACHE_DRIVER=array
QUEUE_CONNECTION=sync
SESSION_DRIVER=array
```

### Sample Tests Included

#### 1. **AuthTest.php** - Authentication Tests
- ✅ User can login with valid credentials
- ✅ User cannot login with invalid credentials
- ✅ User can logout
- ✅ User can get profile
- ✅ Unauthenticated user cannot access protected routes

#### 2. **ProductTest.php** - Product API Tests
- ✅ Admin can list products
- ✅ Admin can create product
- ✅ Admin can update product
- ✅ Admin can delete product
- ✅ Staff cannot delete product (authorization)
- ✅ Can search products
- ✅ Can adjust product stock
- ✅ Bulk delete products

#### 3. **ProductServiceTest.php** - Service Layer Tests
- ✅ Can create product with initial stock
- ✅ Adjust stock creates log entry
- ✅ Cannot adjust stock below zero
- ✅ Cannot delete product with active orders
- ✅ Can delete product without active orders

### Running Tests

```bash
# Run all tests
php artisan test

# Run with output
php artisan test --verbose

# Run specific test
php artisan test --filter test_user_can_login

# Run with coverage (requires Xdebug)
php artisan test --coverage --min=80

# Parallel testing (faster)
php artisan test --parallel
```

### Writing New Tests

```php
<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    public function test_example(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/endpoint');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }
}
```

---

## Frontend Testing (Vitest + React Testing Library)

### Setup

```bash
cd frontend

# Install dependencies
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Run tests
npm run test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### Configuration

`vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
})
```

### Sample Frontend Tests

#### Component Test Example

`frontend/src/__tests__/components/Button.test.tsx`:
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('shows loading state', () => {
    render(<Button loading>Click me</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

#### Hook Test Example

`frontend/src/__tests__/hooks/useAuth.test.ts`:
```typescript
import { renderHook, act } from '@testing-library/react'
import { useAuthStore } from '@/store/authStore'

describe('useAuthStore', () => {
  it('sets user on login', () => {
    const { result } = renderHook(() => useAuthStore())
    
    act(() => {
      result.current.setUser({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        roles: ['admin'],
      })
    })

    expect(result.current.user).toEqual({
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      roles: ['admin'],
    })
  })

  it('clears user on logout', () => {
    const { result } = renderHook(() => useAuthStore())
    
    act(() => {
      result.current.setUser({ id: 1, name: 'Test' })
      result.current.clearAuth()
    })

    expect(result.current.user).toBeNull()
  })
})
```

---

## E2E Testing (Playwright)

### Setup

```bash
# Install Playwright
npm install --save-dev @playwright/test

# Install browsers
npx playwright install

# Run E2E tests
npm run test:e2e
```

### Sample E2E Test

`e2e/auth.spec.ts`:
```typescript
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('user can login', async ({ page }) => {
    await page.goto('http://localhost:3000/login')

    await page.fill('input[name="email"]', 'admin@company.com')
    await page.fill('input[name="password"]', 'Admin@1234')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('http://localhost:3000/')
    await expect(page.locator('text=Dashboard')).toBeVisible()
  })

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('http://localhost:3000/login')

    await page.fill('input[name="email"]', 'wrong@example.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=Invalid credentials')).toBeVisible()
  })
})
```

---

## Test Coverage Goals

### Backend
- **Unit Tests**: 80%+ coverage
- **Feature Tests**: All API endpoints
- **Critical Paths**: 100% coverage
  - Authentication
  - Order creation
  - Inventory management
  - Payment processing

### Frontend
- **Components**: 70%+ coverage
- **Hooks**: 80%+ coverage
- **Utils**: 90%+ coverage
- **Critical Flows**: E2E tests
  - Login/Logout
  - Create order
  - Update product
  - Generate report

---

## CI/CD Integration

### GitHub Actions

`.github/workflows/test.yml`:
```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: testing
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
          extensions: mbstring, xml, bcmath, pgsql
          
      - name: Install Dependencies
        run: |
          cd backend
          composer install
          
      - name: Run Tests
        run: |
          cd backend
          php artisan test --coverage --min=80

  frontend-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install Dependencies
        run: |
          cd frontend
          npm ci
          
      - name: Run Tests
        run: |
          cd frontend
          npm run test:coverage
```

---

## Best Practices

### 1. **Test Naming**
```php
// Good
public function test_admin_can_create_product(): void

// Bad
public function testProduct(): void
```

### 2. **Arrange-Act-Assert Pattern**
```php
public function test_example(): void
{
    // Arrange
    $user = User::factory()->create();
    
    // Act
    $response = $this->actingAs($user)->getJson('/api/endpoint');
    
    // Assert
    $response->assertStatus(200);
}
```

### 3. **Use Factories**
```php
// Good
$product = Product::factory()->create(['price' => 99.99]);

// Bad
$product = new Product();
$product->name = 'Test';
$product->price = 99.99;
$product->save();
```

### 4. **Test One Thing**
```php
// Good
public function test_user_can_login(): void { }
public function test_user_cannot_login_with_wrong_password(): void { }

// Bad
public function test_authentication(): void {
    // Tests login, logout, password reset, etc.
}
```

### 5. **Mock External Services**
```php
use Illuminate\Support\Facades\Http;

public function test_api_call(): void
{
    Http::fake([
        'api.example.com/*' => Http::response(['data' => 'test'], 200),
    ]);
    
    // Test code that calls external API
}
```

---

## Running Tests in Development

### Watch Mode (Frontend)
```bash
npm run test:watch
```

### Specific Test File
```bash
# Backend
php artisan test tests/Feature/ProductTest.php

# Frontend
npm run test -- Button.test.tsx
```

### Debug Mode
```bash
# Backend
php artisan test --filter test_name --stop-on-failure

# Frontend
npm run test -- --reporter=verbose
```

---

## Test Data Management

### Database Seeding for Tests
```php
protected function setUp(): void
{
    parent::setUp();
    
    $this->artisan('db:seed', ['--class' => 'RoleSeeder']);
    $this->artisan('db:seed', ['--class' => 'CategorySeeder']);
}
```

### Factory Usage
```php
// Create single record
$product = Product::factory()->create();

// Create multiple records
$products = Product::factory()->count(10)->create();

// Create with specific attributes
$product = Product::factory()->create([
    'price' => 99.99,
    'is_active' => true,
]);

// Create without persisting
$product = Product::factory()->make();
```

---

## Conclusion

**For Test Project:**
- ✅ Sample tests provided (AuthTest, ProductTest, ProductServiceTest)
- ✅ Testing documentation complete
- ✅ CI/CD integration example
- ✅ Best practices outlined

**For Production:**
- Aim for 80%+ code coverage
- Write tests for all critical paths
- Run tests in CI/CD pipeline
- Monitor test performance

**Current Status:**
- Sample tests: ✅ Provided
- Test infrastructure: ✅ Ready
- Documentation: ✅ Complete
- Full test suite: ⚠️ Not required for test project

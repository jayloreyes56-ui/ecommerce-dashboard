# Frontend Component Documentation

## Overview

This document provides comprehensive documentation for all React components in the eCommerce Dashboard frontend application.

**Tech Stack:**
- React 18
- TypeScript
- React Router v6
- TanStack Query (React Query)
- Tailwind CSS
- Lucide React (Icons)

---

## Table of Contents

1. [UI Components](#ui-components)
2. [Layout Components](#layout-components)
3. [Page Components](#page-components)
4. [Hooks](#hooks)
5. [API Client](#api-client)
6. [Utilities](#utilities)

---

## UI Components

### Button

**Location:** `src/components/ui/Button.tsx`

A reusable button component with multiple variants and sizes.

**Props:**
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
```

**Usage:**
```tsx
import { Button } from '@/components/ui/Button';

<Button variant="primary" size="md">
  Click Me
</Button>

<Button variant="danger" isLoading>
  Deleting...
</Button>

<Button leftIcon={<PlusIcon />}>
  Add Product
</Button>
```

**Variants:**
- `primary` - Blue background, white text
- `secondary` - Gray background, dark text
- `danger` - Red background, white text
- `ghost` - Transparent background, colored text

---

### Input

**Location:** `src/components/ui/Input.tsx`

A styled input component with label and error support.

**Props:**
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
```

**Usage:**
```tsx
import { Input } from '@/components/ui/Input';

<Input
  label="Email"
  type="email"
  placeholder="Enter your email"
  error={errors.email}
/>

<Input
  label="Search"
  leftIcon={<SearchIcon />}
  placeholder="Search products..."
/>
```

---

### Select

**Location:** `src/components/ui/Select.tsx`

A styled select dropdown component.

**Props:**
```typescript
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string | number; label: string }>;
}
```

**Usage:**
```tsx
import { Select } from '@/components/ui/Select';

<Select
  label="Category"
  options={[
    { value: 1, label: 'Electronics' },
    { value: 2, label: 'Clothing' }
  ]}
  value={selectedCategory}
  onChange={(e) => setSelectedCategory(e.target.value)}
/>
```

---

### Modal

**Location:** `src/components/ui/Modal.tsx`

A modal dialog component with backdrop and animations.

**Props:**
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}
```

**Usage:**
```tsx
import { Modal } from '@/components/ui/Modal';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Add Product"
  size="lg"
>
  <ProductForm onSubmit={handleSubmit} />
</Modal>
```

---

### Card

**Location:** `src/components/ui/Card.tsx`

A container component with shadow and padding.

**Props:**
```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}
```

**Usage:**
```tsx
import { Card } from '@/components/ui/Card';

<Card padding="lg">
  <h2>Card Title</h2>
  <p>Card content goes here</p>
</Card>
```

---

### StatCard

**Location:** `src/components/ui/StatCard.tsx`

A card component for displaying statistics with icons and trends.

**Props:**
```typescript
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'yellow' | 'red';
}
```

**Usage:**
```tsx
import { StatCard } from '@/components/ui/StatCard';
import { DollarSign } from 'lucide-react';

<StatCard
  title="Total Revenue"
  value="$125,000"
  icon={<DollarSign />}
  trend={{ value: 12.5, isPositive: true }}
  color="green"
/>
```

---

### Table

**Location:** `src/components/ui/Table.tsx`

A responsive table component with sorting and pagination support.

**Props:**
```typescript
interface TableProps<T> {
  columns: Array<{
    key: string;
    label: string;
    sortable?: boolean;
    render?: (item: T) => React.ReactNode;
  }>;
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}
```

**Usage:**
```tsx
import { Table } from '@/components/ui/Table';

<Table
  columns={[
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email' },
    { 
      key: 'actions', 
      label: 'Actions',
      render: (user) => <Button>Edit</Button>
    }
  ]}
  data={users}
  isLoading={isLoading}
  emptyMessage="No users found"
/>
```

---

### Badge

**Location:** `src/components/ui/Badge.tsx`

A small label component for status indicators.

**Props:**
```typescript
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
}
```

**Usage:**
```tsx
import { Badge } from '@/components/ui/Badge';

<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Cancelled</Badge>
```

---

### Pagination

**Location:** `src/components/ui/Pagination.tsx`

A pagination component for navigating through pages.

**Props:**
```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
}
```

**Usage:**
```tsx
import { Pagination } from '@/components/ui/Pagination';

<Pagination
  currentPage={currentPage}
  totalPages={10}
  onPageChange={setCurrentPage}
  showPageNumbers
/>
```

---

### Toast

**Location:** `src/components/ui/Toast.tsx`

A notification component for displaying messages.

**Usage:**
```tsx
import { toast } from '@/components/ui/Toast';

// Success toast
toast.success('Product created successfully!');

// Error toast
toast.error('Failed to delete product');

// Info toast
toast.info('Processing your request...');

// Warning toast
toast.warning('Low stock alert');
```

---

## Layout Components

### Sidebar

**Location:** `src/components/layout/Sidebar.tsx`

The main navigation sidebar with menu items and user info.

**Features:**
- Collapsible on mobile
- Active route highlighting
- Role-based menu items
- User profile section
- Logout functionality

**Usage:**
```tsx
import { Sidebar } from '@/components/layout/Sidebar';

<Sidebar />
```

---

### Header

**Location:** `src/components/layout/Header.tsx`

The top header bar with search and notifications.

**Features:**
- Search functionality
- Notification bell
- User dropdown menu
- Mobile menu toggle

**Usage:**
```tsx
import { Header } from '@/components/layout/Header';

<Header />
```

---

### PageWrapper

**Location:** `src/components/layout/PageWrapper.tsx`

A wrapper component for consistent page layout.

**Props:**
```typescript
interface PageWrapperProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}
```

**Usage:**
```tsx
import { PageWrapper } from '@/components/layout/PageWrapper';

<PageWrapper
  title="Products"
  subtitle="Manage your product inventory"
  actions={
    <Button onClick={handleAdd}>
      Add Product
    </Button>
  }
>
  <ProductList />
</PageWrapper>
```

---

## Page Components

### Dashboard

**Location:** `src/pages/Dashboard.tsx`

The main dashboard page with statistics and charts.

**Features:**
- Revenue statistics
- Order counts
- Sales chart
- Top products list
- Low stock alerts

**Data Sources:**
- `useQuery` for dashboard summary
- `useQuery` for sales chart data
- `useQuery` for top products

---

### Products

**Location:** `src/pages/Products.tsx`

Product management page with CRUD operations.

**Features:**
- Product list with search and filters
- Add/Edit product modal
- Delete confirmation
- Bulk delete
- Stock adjustment
- Image upload
- Pagination

**Hooks Used:**
- `useProducts` - Fetch products list
- `useCreateProduct` - Create new product
- `useUpdateProduct` - Update existing product
- `useDeleteProduct` - Delete product
- `useBulkDeleteProducts` - Bulk delete

---

### Orders

**Location:** `src/pages/Orders.tsx`

Order management page with status tracking.

**Features:**
- Order list with filters
- Order details modal
- Status updates
- Payment status updates
- Order cancellation
- Status history

**Hooks Used:**
- `useOrders` - Fetch orders list
- `useOrder` - Fetch single order
- `useUpdateOrderStatus` - Update order status
- `useCancelOrder` - Cancel order

---

### Customers

**Location:** `src/pages/Customers.tsx`

Customer management page.

**Features:**
- Customer list with search
- Add/Edit customer
- View customer orders
- Customer statistics

**Hooks Used:**
- `useCustomers` - Fetch customers list
- `useCreateCustomer` - Create new customer
- `useUpdateCustomer` - Update customer
- `useCustomerOrders` - Fetch customer orders

---

### Messages

**Location:** `src/pages/Messages.tsx`

Messaging/conversation management page.

**Features:**
- Conversation list
- Message thread view
- Send messages
- Mark as read
- Assign conversations
- Close/Reopen conversations

**Hooks Used:**
- `useConversations` - Fetch conversations
- `useConversation` - Fetch single conversation
- `useSendMessage` - Send message
- `useMarkAsRead` - Mark conversation as read

---

### Reports

**Location:** `src/pages/Reports.tsx`

Reports and analytics page.

**Features:**
- Sales reports
- Customer reports
- Date range filters
- Export to CSV
- Charts and graphs

**Hooks Used:**
- `useSalesReport` - Fetch sales data
- `useCustomerReport` - Fetch customer data
- `useExportReport` - Export reports

---

### Settings

**Location:** `src/pages/Settings.tsx`

User settings and preferences page.

**Features:**
- Profile management
- Password change
- Notification settings
- Three-tab layout (Profile, Security, Notifications)

**Hooks Used:**
- `useProfile` - Fetch user profile
- `useUpdateProfile` - Update profile
- `useChangePassword` - Change password
- `useUpdateNotifications` - Update notification settings

---

## Hooks

### useAuth

**Location:** `src/hooks/useAuth.ts`

Authentication hook for managing user session.

**Returns:**
```typescript
{
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
}
```

**Usage:**
```tsx
import { useAuth } from '@/hooks/useAuth';

function Component() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <div>Welcome, {user.name}</div>;
}
```

---

### useProducts

**Location:** `src/hooks/useProducts.ts`

Hook for managing products data.

**Parameters:**
```typescript
{
  search?: string;
  category_id?: number;
  in_stock?: boolean;
  page?: number;
  per_page?: number;
}
```

**Returns:**
```typescript
{
  products: Product[];
  isLoading: boolean;
  error: Error | null;
  pagination: PaginationMeta;
  refetch: () => void;
}
```

**Usage:**
```tsx
import { useProducts } from '@/hooks/useProducts';

function ProductList() {
  const { products, isLoading, pagination } = useProducts({
    search: searchTerm,
    page: currentPage
  });

  if (isLoading) return <Spinner />;

  return (
    <>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
      <Pagination {...pagination} />
    </>
  );
}
```

---

### useCreateProduct

**Location:** `src/hooks/useProducts.ts`

Mutation hook for creating products.

**Returns:**
```typescript
{
  mutate: (data: CreateProductData) => void;
  mutateAsync: (data: CreateProductData) => Promise<Product>;
  isLoading: boolean;
  error: Error | null;
}
```

**Usage:**
```tsx
import { useCreateProduct } from '@/hooks/useProducts';

function AddProductForm() {
  const { mutate, isLoading } = useCreateProduct();

  const handleSubmit = (data) => {
    mutate(data, {
      onSuccess: () => {
        toast.success('Product created!');
        closeModal();
      },
      onError: (error) => {
        toast.error(error.message);
      }
    });
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

### useOrders

**Location:** `src/hooks/useOrders.ts`

Hook for managing orders data.

**Parameters:**
```typescript
{
  search?: string;
  status?: string;
  payment_status?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
}
```

**Returns:**
```typescript
{
  orders: Order[];
  isLoading: boolean;
  error: Error | null;
  pagination: PaginationMeta;
  refetch: () => void;
}
```

---

### useProfile

**Location:** `src/hooks/useProfile.ts`

Hook for managing user profile.

**Returns:**
```typescript
{
  profile: User | null;
  isLoading: boolean;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  updateNotifications: (data: NotificationSettings) => Promise<void>;
}
```

**Usage:**
```tsx
import { useProfile } from '@/hooks/useProfile';

function ProfileSettings() {
  const { profile, updateProfile, isLoading } = useProfile();

  const handleSubmit = async (data) => {
    await updateProfile(data);
    toast.success('Profile updated!');
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## API Client

### Axios Instance

**Location:** `src/lib/axios.ts`

Configured Axios instance with interceptors.

**Features:**
- Base URL configuration
- Authentication token injection
- Error handling
- Request/Response interceptors

**Usage:**
```tsx
import { apiClient } from '@/lib/axios';

// GET request
const response = await apiClient.get('/products');

// POST request
const response = await apiClient.post('/products', data);

// PUT request
const response = await apiClient.put('/products/1', data);

// DELETE request
await apiClient.delete('/products/1');
```

---

### API Modules

**Location:** `src/api/`

Organized API functions by resource.

**Structure:**
```
src/api/
├── auth.ts          # Authentication endpoints
├── products.ts      # Product endpoints
├── orders.ts        # Order endpoints
├── customers.ts     # Customer endpoints
├── messages.ts      # Message endpoints
├── reports.ts       # Report endpoints
└── profile.ts       # Profile endpoints
```

**Example (products.ts):**
```typescript
import { apiClient } from '@/lib/axios';

export const productsApi = {
  getAll: (params) => apiClient.get('/products', { params }),
  getOne: (id) => apiClient.get(`/products/${id}`),
  create: (data) => apiClient.post('/products', data),
  update: (id, data) => apiClient.put(`/products/${id}`, data),
  delete: (id) => apiClient.delete(`/products/${id}`),
  bulkDelete: (ids) => apiClient.post('/products/bulk-delete', { ids }),
};
```

---

## Utilities

### formatCurrency

**Location:** `src/utils/format.ts`

Format numbers as currency.

**Usage:**
```tsx
import { formatCurrency } from '@/utils/format';

formatCurrency(1299.99); // "$1,299.99"
formatCurrency(1299.99, 'EUR'); // "€1,299.99"
```

---

### formatDate

**Location:** `src/utils/format.ts`

Format dates in various formats.

**Usage:**
```tsx
import { formatDate } from '@/utils/format';

formatDate('2024-01-01'); // "Jan 1, 2024"
formatDate('2024-01-01', 'full'); // "January 1, 2024"
formatDate('2024-01-01', 'short'); // "01/01/24"
```

---

### cn (classNames)

**Location:** `src/utils/cn.ts`

Utility for merging Tailwind CSS classes.

**Usage:**
```tsx
import { cn } from '@/utils/cn';

<div className={cn(
  'base-class',
  isActive && 'active-class',
  'another-class'
)} />
```

---

## Styling Guidelines

### Tailwind CSS

The project uses Tailwind CSS for styling with a custom configuration.

**Color Palette:**
- Primary: Blue (`blue-600`)
- Success: Green (`green-600`)
- Warning: Yellow (`yellow-600`)
- Danger: Red (`red-600`)
- Gray: Neutral gray scale

**Common Patterns:**
```tsx
// Card
<div className="bg-white rounded-lg shadow-sm p-6">

// Button
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">

// Input
<input className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">

// Grid Layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

---

## State Management

### React Query

The project uses TanStack Query (React Query) for server state management.

**Configuration:**
```typescript
// src/lib/queryClient.ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

**Query Keys:**
```typescript
// Organized by resource
['products'] // All products
['products', { search, page }] // Filtered products
['products', id] // Single product
['orders'] // All orders
['orders', id] // Single order
```

---

## Routing

### React Router v6

**Location:** `src/router/index.tsx`

**Routes:**
```typescript
/                    → Dashboard
/products            → Products List
/products/:id        → Product Details
/orders              → Orders List
/orders/:id          → Order Details
/customers           → Customers List
/customers/:id       → Customer Details
/messages            → Messages/Conversations
/reports             → Reports & Analytics
/settings            → User Settings
/users               → User Management (Admin)
/login               → Login Page
```

**Protected Routes:**
```tsx
<Route element={<ProtectedRoute />}>
  <Route path="/" element={<Dashboard />} />
  {/* ... other protected routes */}
</Route>
```

---

## Best Practices

### Component Structure

```tsx
// 1. Imports
import React from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Types
interface ComponentProps {
  title: string;
  onAction: () => void;
}

// 3. Component
export function Component({ title, onAction }: ComponentProps) {
  // 4. Hooks
  const { data, isLoading } = useQuery(...);
  const [state, setState] = useState();

  // 5. Handlers
  const handleClick = () => {
    // ...
  };

  // 6. Effects
  useEffect(() => {
    // ...
  }, []);

  // 7. Render
  if (isLoading) return <Spinner />;

  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### Error Handling

```tsx
// API errors
try {
  await apiClient.post('/products', data);
  toast.success('Success!');
} catch (error) {
  if (error.response?.status === 422) {
    // Validation errors
    setErrors(error.response.data.errors);
  } else {
    toast.error(error.message);
  }
}

// Query errors
const { data, error } = useQuery({
  queryKey: ['products'],
  queryFn: fetchProducts,
  onError: (error) => {
    toast.error('Failed to load products');
  }
});
```

### Loading States

```tsx
// Skeleton loading
{isLoading ? (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
) : (
  <div>{data.name}</div>
)}

// Spinner
{isLoading && <Spinner />}

// Button loading
<Button isLoading={isSubmitting}>
  Submit
</Button>
```

---

## Testing

### Component Testing

```tsx
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    screen.getByText('Click me').click();
    expect(handleClick).toHaveBeenCalled();
  });
});
```

---

## Performance Optimization

### Code Splitting

```tsx
// Lazy load pages
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Products = lazy(() => import('@/pages/Products'));

// Wrap in Suspense
<Suspense fallback={<Spinner />}>
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/products" element={<Products />} />
  </Routes>
</Suspense>
```

### Memoization

```tsx
// useMemo for expensive calculations
const filteredProducts = useMemo(() => {
  return products.filter(p => p.name.includes(search));
}, [products, search]);

// useCallback for functions passed as props
const handleDelete = useCallback((id) => {
  deleteProduct(id);
}, [deleteProduct]);

// React.memo for components
export const ProductCard = React.memo(({ product }) => {
  return <div>{product.name}</div>;
});
```

---

**Last Updated:** 2026-05-01  
**Version:** 1.0.0

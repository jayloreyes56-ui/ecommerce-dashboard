import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { PageLoader } from '@/components/ui/Spinner'
import Login from '@/pages/Login'

// Lazy-load all pages for code splitting
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Orders    = lazy(() => import('@/pages/Orders'))
const Products  = lazy(() => import('@/pages/Products'))
const Messages  = lazy(() => import('@/pages/Messages'))
const Reports   = lazy(() => import('@/pages/Reports'))
const Customers = lazy(() => import('@/pages/Customers'))
const Settings  = lazy(() => import('@/pages/Settings'))

const Wrap = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="flex h-64 items-center justify-center"><PageLoader /></div>}>
    {children}
  </Suspense>
)

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/',          element: <Wrap><Dashboard /></Wrap> },
          { path: '/orders',    element: <Wrap><Orders /></Wrap> },
          { path: '/products',  element: <Wrap><Products /></Wrap> },
          { path: '/messages',  element: <Wrap><Messages /></Wrap> },
          { path: '/reports',   element: <Wrap><Reports /></Wrap> },
          { path: '/customers', element: <Wrap><Customers /></Wrap> },
          { path: '/settings',  element: <Wrap><Settings /></Wrap> },
          { path: '*',          element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
])

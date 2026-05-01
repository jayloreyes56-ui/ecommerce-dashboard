import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  MessageSquare,
  BarChart3,
  Users,
  Settings,
  ChevronLeft,
  Store,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { Avatar } from '@/components/ui/Avatar'
import { authApi } from '@/api/auth'

const navItems = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/orders',    icon: ShoppingCart,    label: 'Orders' },
  { to: '/products',  icon: Package,         label: 'Products' },
  { to: '/messages',  icon: MessageSquare,   label: 'Messages' },
  { to: '/reports',   icon: BarChart3,       label: 'Reports' },
  { to: '/customers', icon: Users,           label: 'Customers' },
]

const bottomItems = [
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  const { sidebarCollapsed, toggleCollapsed } = useUIStore()
  const { user, clearAuth } = useAuthStore()

  const handleLogout = async () => {
    try { await authApi.logout() } catch { /* ignore */ }
    clearAuth()
  }

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-gray-100 px-4">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <Store className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">eCommerce</span>
          </div>
        )}
        <button
          onClick={toggleCollapsed}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600',
            sidebarCollapsed && 'mx-auto'
          )}
          aria-label="Toggle sidebar"
        >
          <ChevronLeft
            className={cn('h-4 w-4 transition-transform', sidebarCollapsed && 'rotate-180')}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <ul className="space-y-0.5">
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} collapsed={sidebarCollapsed} />
          ))}
        </ul>
      </nav>

      {/* Bottom */}
      <div className="border-t border-gray-100 px-2 py-3">
        <ul className="space-y-0.5">
          {bottomItems.map((item) => (
            <NavItem key={item.to} {...item} collapsed={sidebarCollapsed} />
          ))}
          <li>
            <button
              onClick={handleLogout}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600',
                'transition-colors hover:bg-red-50 hover:text-red-600',
                sidebarCollapsed && 'justify-center px-2'
              )}
              title={sidebarCollapsed ? 'Logout' : undefined}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!sidebarCollapsed && 'Logout'}
            </button>
          </li>
        </ul>

        {/* User info */}
        {user && !sidebarCollapsed && (
          <div className="mt-3 flex items-center gap-2.5 rounded-lg bg-gray-50 px-3 py-2">
            <Avatar name={user.name} src={user.avatar} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-gray-800">{user.name}</p>
              <p className="truncate text-xs text-gray-500 capitalize">{user.roles[0]}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}

function NavItem({
  to,
  icon: Icon,
  label,
  collapsed,
}: {
  to: string
  icon: React.ElementType
  label: string
  collapsed: boolean
}) {
  return (
    <li>
      <NavLink
        to={to}
        end={to === '/'}
        title={collapsed ? label : undefined}
        className={({ isActive }) =>
          cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            isActive
              ? 'bg-brand-50 text-brand-700'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
            collapsed && 'justify-center px-2'
          )
        }
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed && label}
      </NavLink>
    </li>
  )
}

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { User, Lock, Bell, Shield, Camera } from 'lucide-react'
import toast from 'react-hot-toast'
import { 
  useUpdateProfile, 
  useChangePassword, 
  useNotificationSettings, 
  useUpdateNotificationSettings 
} from '@/hooks/useProfile'

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile')

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'security' as const, label: 'Security', icon: Lock },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
  ]

  return (
    <PageWrapper 
      title="Settings" 
      subtitle="Manage your account settings and preferences"
    >
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-6">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors
                  ${
                    activeTab === tab.id
                      ? 'border-brand-600 text-brand-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="max-w-3xl">
        {activeTab === 'profile' && <ProfileSettings />}
        {activeTab === 'security' && <SecuritySettings />}
        {activeTab === 'notifications' && <NotificationSettings />}
      </div>
    </PageWrapper>
  )
}

function ProfileSettings() {
  const { user } = useAuthStore()
  const updateProfile = useUpdateProfile()
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile.mutate(formData)
  }

  return (
    <div className="space-y-6">
      {/* Profile Photo */}
      <Card>
        <h3 className="text-base font-semibold text-gray-900">Profile Photo</h3>
        <p className="mt-1 text-sm text-gray-500">
          Update your profile photo and personal details
        </p>

        <div className="mt-6 flex items-center gap-6">
          <div className="relative">
            <Avatar name={user?.name || ''} src={user?.avatar} size="xl" />
            <button
              type="button"
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-brand-600 text-white shadow-sm transition-colors hover:bg-brand-700"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1">
            <Button type="button" variant="outline" size="sm">
              Upload New Photo
            </Button>
            <p className="mt-2 text-xs text-gray-500">
              JPG, PNG or GIF. Max size 2MB. Recommended 400x400px.
            </p>
          </div>
        </div>
      </Card>

      {/* Personal Information */}
      <Card>
        <h3 className="text-base font-semibold text-gray-900">Personal Information</h3>
        <p className="mt-1 text-sm text-gray-500">
          Update your account's profile information and email address
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <Input
            label="Full Name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter your full name"
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="your.email@example.com"
            required
          />

          {/* Role Badge */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2">
              <Shield className="h-4 w-4 text-brand-600" />
              <span className="text-sm font-medium capitalize text-brand-700">
                {user?.roles[0] || 'N/A'}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-gray-500">
              Your role determines your access level and permissions
            </p>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit" loading={updateProfile.isPending}>
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

function SecuritySettings() {
  const changePassword = useChangePassword()
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.new_password !== formData.new_password_confirmation) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.new_password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    changePassword.mutate(formData, {
      onSuccess: () => {
        setFormData({ 
          current_password: '', 
          new_password: '', 
          new_password_confirmation: '' 
        })
      }
    })
  }

  return (
    <Card>
      <h3 className="text-base font-semibold text-gray-900">Change Password</h3>
      <p className="mt-1 text-sm text-gray-500">
        Ensure your account is using a long, random password to stay secure
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <Input
          label="Current Password"
          type="password"
          value={formData.current_password}
          onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
          placeholder="Enter your current password"
          required
        />

        <Input
          label="New Password"
          type="password"
          value={formData.new_password}
          onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
          placeholder="Enter new password"
          hint="Must be at least 8 characters with mixed case and numbers"
          required
          minLength={8}
        />

        <Input
          label="Confirm New Password"
          type="password"
          value={formData.new_password_confirmation}
          onChange={(e) => setFormData({ ...formData, new_password_confirmation: e.target.value })}
          placeholder="Confirm new password"
          required
        />

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit" loading={changePassword.isPending}>
            Update Password
          </Button>
        </div>
      </form>

      {/* Security Tips */}
      <div className="mt-6 rounded-lg bg-blue-50 p-4">
        <h4 className="text-sm font-medium text-blue-900">Password Security Tips</h4>
        <ul className="mt-2 space-y-1 text-xs text-blue-700">
          <li>• Use a unique password you don't use elsewhere</li>
          <li>• Include uppercase and lowercase letters, numbers, and symbols</li>
          <li>• Avoid common words and personal information</li>
          <li>• Consider using a password manager</li>
        </ul>
      </div>
    </Card>
  )
}

function NotificationSettings() {
  const { data: savedSettings, isLoading } = useNotificationSettings()
  const updateSettings = useUpdateNotificationSettings()
  
  const [settings, setSettings] = useState({
    email_orders: true,
    email_messages: true,
    email_reports: false,
    push_orders: true,
    push_messages: true,
    push_low_stock: true,
  })

  // Update local state when data is loaded
  useEffect(() => {
    if (savedSettings) {
      setSettings(savedSettings)
    }
  }, [savedSettings])

  const handleSave = () => {
    updateSettings.mutate(settings)
  }

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings({ ...settings, [key]: !settings[key] })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="h-48 animate-pulse rounded-lg bg-gray-50" />
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <h3 className="text-base font-semibold text-gray-900">Email Notifications</h3>
        <p className="mt-1 text-sm text-gray-500">
          Receive notifications via email
        </p>

        <div className="mt-6 space-y-4">
          <NotificationToggle
            label="New Orders"
            description="Get notified when a new order is placed"
            checked={settings.email_orders}
            onChange={() => toggleSetting('email_orders')}
          />
          <NotificationToggle
            label="New Messages"
            description="Get notified when you receive a new message"
            checked={settings.email_messages}
            onChange={() => toggleSetting('email_messages')}
          />
          <NotificationToggle
            label="Weekly Reports"
            description="Receive weekly sales and performance reports"
            checked={settings.email_reports}
            onChange={() => toggleSetting('email_reports')}
          />
        </div>
      </Card>

      {/* Push Notifications */}
      <Card>
        <h3 className="text-base font-semibold text-gray-900">Push Notifications</h3>
        <p className="mt-1 text-sm text-gray-500">
          Receive real-time notifications in your browser
        </p>

        <div className="mt-6 space-y-4">
          <NotificationToggle
            label="New Orders"
            description="Get push notifications for new orders"
            checked={settings.push_orders}
            onChange={() => toggleSetting('push_orders')}
          />
          <NotificationToggle
            label="New Messages"
            description="Get push notifications for new messages"
            checked={settings.push_messages}
            onChange={() => toggleSetting('push_messages')}
          />
          <NotificationToggle
            label="Low Stock Alerts"
            description="Get notified when products are running low"
            checked={settings.push_low_stock}
            onChange={() => toggleSetting('push_low_stock')}
          />
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} loading={updateSettings.isPending}>
          Save Preferences
        </Button>
      </div>
    </div>
  )
}

function NotificationToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 transition-colors hover:bg-gray-100">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="mt-0.5 text-xs text-gray-500">{description}</p>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`
          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
          ${checked ? 'bg-brand-600' : 'bg-gray-300'}
        `}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`
            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0
            transition duration-200 ease-in-out
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    </div>
  )
}

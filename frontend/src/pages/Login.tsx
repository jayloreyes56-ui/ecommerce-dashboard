import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Store, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useLogin } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { LoginPayload } from '@/api/auth'

const schema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@company.com', password: 'Admin@1234', color: 'bg-brand-50 border-brand-200 text-brand-700 hover:bg-brand-100' },
  { role: 'Staff', email: 'staff@company.com', password: 'Staff@1234', color: 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100' },
]

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginPayload>({ resolver: zodResolver(schema) })

  // All auth logic lives in the hook — Login stays a pure form
  const loginMutation = useLogin({ setError })

  const onSubmit = (data: LoginPayload) => loginMutation.mutate(data)

  const fillCredentials = (email: string, password: string) => {
    setValue('email', email)
    setValue('password', password)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 shadow-lg">
            <Store className="h-7 w-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">eCommerce Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Sign in to your account</p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-blue-600">Demo Accounts — click to fill</p>
          <div className="flex gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.role}
                type="button"
                onClick={() => fillCredentials(account.email, account.password)}
                className={`flex-1 rounded-lg border px-3 py-2 text-left text-xs transition-colors ${account.color}`}
              >
                <p className="font-semibold">{account.role}</p>
                <p className="mt-0.5 opacity-75">{account.email}</p>
                <p className="opacity-75">{account.password}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <Input
              label="Email address"
              type="email"
              placeholder="admin@company.com"
              autoComplete="email"
              required
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              error={errors.password?.message}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              {...register('password')}
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={isSubmitting || loginMutation.isPending}
            >
              Sign in
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          eCommerce Operations Dashboard © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}

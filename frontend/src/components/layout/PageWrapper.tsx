import { Header } from './Header'

interface PageWrapperProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  children: React.ReactNode
}

export function PageWrapper({ title, subtitle, action, children }: PageWrapperProps) {
  return (
    <div className="flex h-full flex-col">
      <Header title={title} subtitle={subtitle} />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-screen-2xl p-6">
          {action && (
            <div className="mb-6 flex items-center justify-end">{action}</div>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}

/**
 * NetworkStatus — shows a non-intrusive banner when the browser
 * goes offline, and dismisses it automatically when connectivity returns.
 */
import { useEffect, useState } from 'react'
import { WifiOff, Wifi } from 'lucide-react'
import { cn } from '@/lib/utils'

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showRestored, setShowRestored] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowRestored(true)
      setTimeout(() => setShowRestored(false), 3000)
    }
    const handleOffline = () => {
      setIsOnline(false)
      setShowRestored(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline && !showRestored) return null

  return (
    <div
      className={cn(
        'fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2.5',
        'rounded-full px-4 py-2.5 text-sm font-medium shadow-lg',
        'transition-all duration-300',
        isOnline
          ? 'bg-green-600 text-white'
          : 'bg-gray-900 text-white'
      )}
      role="status"
      aria-live="polite"
    >
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4" />
          Connection restored
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          No internet connection — changes may not save
        </>
      )}
    </div>
  )
}

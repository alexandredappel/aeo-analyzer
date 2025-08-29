import { useEffect, useState } from 'react'

interface UseUserQuotaResult {
  remaining: number
  isLoading: boolean
  refetch: () => Promise<void>
}

export function useUserQuota(): UseUserQuotaResult {
  const [remaining, setRemaining] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const fetchQuota = async () => {
    try {
      const res = await fetch('/api/quota', { cache: 'no-store' })
      const data = await res.json()
      setRemaining(data.remaining || 0)
    } catch {
      setRemaining(0)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchQuota()
  }, [])

  return { remaining, isLoading, refetch: fetchQuota }
}

export default useUserQuota



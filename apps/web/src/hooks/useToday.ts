import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { TodayView } from '@wm/types'

export function useTodayView() {
  return useQuery({
    queryKey: ['today'],
    queryFn: () => api.get<TodayView>('/today'),
  })
}

export function useMorningBrief() {
  return useQuery({
    queryKey: ['today', 'brief'],
    queryFn: () => api.get<{ brief: string }>('/today/brief'),
    staleTime: 1000 * 60 * 30, // Cache for 30 min — brief is stable
  })
}

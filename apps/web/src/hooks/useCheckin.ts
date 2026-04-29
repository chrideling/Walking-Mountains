import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { CheckIn } from '@wm/types'

export function useWeeklyCheckin() {
  return useQuery({
    queryKey: ['checkin', 'weekly'],
    queryFn: () => api.get<CheckIn>('/checkin/weekly'),
  })
}

export function useRespondToCheckin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (response: string) =>
      api.post<CheckIn>('/checkin/weekly/respond', { response }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['checkin'] }),
  })
}

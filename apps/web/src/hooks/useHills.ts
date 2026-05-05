import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { Hill, CreateHillBody, UpdateHillBody } from '@wm/types'

export function useHills(mountainId?: string) {
  const qs = mountainId ? `?mountainId=${mountainId}` : ''
  return useQuery({
    queryKey: ['hills', mountainId],
    queryFn: () => api.get<Hill[]>(`/hills${qs}`),
    enabled: true,
  })
}

export function useUpcomingHills() {
  return useQuery({
    queryKey: ['hills', 'upcoming'],
    queryFn: () => api.get<Hill[]>('/hills/upcoming'),
  })
}

export function useCreateHill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateHillBody) => api.post<Hill>('/hills', body),
    onSuccess: (hill) => {
      qc.invalidateQueries({ queryKey: ['hills'] })
      qc.invalidateQueries({ queryKey: ['mountains', hill.mountainId] })
      qc.invalidateQueries({ queryKey: ['mountains'] })
    },
  })
}

export function useUpdateHill(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateHillBody) => api.patch<Hill>(`/hills/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hills'] })
      qc.invalidateQueries({ queryKey: ['mountains'] })
    },
  })
}

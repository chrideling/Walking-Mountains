import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { Mountain, CreateMountainBody, UpdateMountainBody } from '@wm/types'

export function useMountains() {
  return useQuery({
    queryKey: ['mountains'],
    queryFn: () => api.get<Mountain[]>('/mountains'),
  })
}

export function useMountain(id: string) {
  return useQuery({
    queryKey: ['mountains', id],
    queryFn: () => api.get<Mountain>(`/mountains/${id}`),
    enabled: !!id,
  })
}

export function useCreateMountain() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateMountainBody) => api.post<Mountain>('/mountains', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mountains'] }),
  })
}

export function useUpdateMountain(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateMountainBody) => api.patch<Mountain>(`/mountains/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mountains'] })
      qc.invalidateQueries({ queryKey: ['mountains', id] })
    },
  })
}

export function useDeleteMountain() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/mountains/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mountains'] }),
  })
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { Path, CreatePathBody, UpdatePathBody } from '@wm/types'

export function usePaths(mountainId?: string, status?: string) {
  const params = new URLSearchParams()
  if (mountainId) params.set('mountainId', mountainId)
  if (status) params.set('status', status)
  const qs = params.toString() ? `?${params}` : ''

  return useQuery({
    queryKey: ['paths', mountainId, status],
    queryFn: () => api.get<Path[]>(`/paths${qs}`),
  })
}

export function useCreatePath() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreatePathBody) => api.post<Path>('/paths', body),
    onSuccess: (path) => {
      qc.invalidateQueries({ queryKey: ['paths'] })
      qc.invalidateQueries({ queryKey: ['mountains', path.mountainId] })
      qc.invalidateQueries({ queryKey: ['mountains'] })
      qc.invalidateQueries({ queryKey: ['today'] })
    },
  })
}

export function useUpdatePath(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdatePathBody) => api.patch<Path>(`/paths/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['paths'] })
      qc.invalidateQueries({ queryKey: ['mountains'] })
      qc.invalidateQueries({ queryKey: ['today'] })
    },
  })
}

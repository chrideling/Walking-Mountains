import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { Step, CreateStepBody } from '@wm/types'

export function useSteps(params?: { pathId?: string; type?: string; limit?: number }) {
  const search = new URLSearchParams()
  if (params?.pathId) search.set('pathId', params.pathId)
  if (params?.type) search.set('type', params.type)
  if (params?.limit) search.set('limit', String(params.limit))
  const qs = search.toString() ? `?${search}` : ''

  return useQuery({
    queryKey: ['steps', params],
    queryFn: () => api.get<Step[]>(`/steps${qs}`),
  })
}

export function useLogStep() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateStepBody) => api.post<Step>('/steps', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['steps'] })
      qc.invalidateQueries({ queryKey: ['today'] })
    },
  })
}

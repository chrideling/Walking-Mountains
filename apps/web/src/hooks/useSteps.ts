import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { Step, CreateStepBody } from '@wm/types'

interface StepStats {
  todaySteps: Step[]
  todayCount: number
  weekCount: number
}

export function useSteps(params?: { pathId?: string; mountainId?: string; type?: string; limit?: number; since?: string }) {
  const search = new URLSearchParams()
  if (params?.pathId) search.set('pathId', params.pathId)
  if (params?.mountainId) search.set('mountainId', params.mountainId)
  if (params?.type) search.set('type', params.type)
  if (params?.limit) search.set('limit', String(params.limit))
  if (params?.since) search.set('since', params.since)
  const qs = search.toString() ? `?${search}` : ''

  return useQuery({
    queryKey: ['steps', params],
    queryFn: () => api.get<Step[]>(`/steps${qs}`),
  })
}

export function useStepStats(params: { pathId?: string; mountainId?: string }) {
  const search = new URLSearchParams()
  if (params.pathId) search.set('pathId', params.pathId)
  if (params.mountainId) search.set('mountainId', params.mountainId)

  return useQuery({
    queryKey: ['steps', 'stats', params],
    queryFn: () => api.get<StepStats>(`/steps/stats?${search}`),
    enabled: !!(params.pathId || params.mountainId),
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

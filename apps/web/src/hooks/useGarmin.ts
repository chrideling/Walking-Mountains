import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'

interface GarminStatus {
  connected: boolean
  username?: string
  lastSynced?: string
}

interface SyncResult {
  synced: number
  errors: string[]
}

export function useGarminStatus() {
  return useQuery({
    queryKey: ['garmin', 'status'],
    queryFn: () => api.get<GarminStatus>('/garmin/status'),
  })
}

export function useConnectGarmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { username: string; password: string }) =>
      api.post<GarminStatus>('/garmin/connect', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['garmin'] }),
  })
}

export function useDisconnectGarmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.delete('/garmin/disconnect'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['garmin'] }),
  })
}

export function useSyncGarmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (days: number) => api.post<SyncResult>('/garmin/sync', { days }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['today'] })
      qc.invalidateQueries({ queryKey: ['biometrics'] })
    },
  })
}

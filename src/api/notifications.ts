import { api } from './client'
import type { CompteNonLues, NotificationItem, ResultatPagines } from '@/types'

export async function listeNotifications(
  seulementNonLues = false,
): Promise<ResultatPagines<NotificationItem>> {
  const { data } = await api.get<ResultatPagines<NotificationItem>>('/notifications/', {
    params: seulementNonLues ? { non_lues: 'true' } : undefined,
  })
  return data
}

export async function compteNonLues(): Promise<CompteNonLues> {
  const { data } = await api.get<CompteNonLues>('/notifications/non-lues/')
  return data
}

export async function marquerLue(id: string): Promise<void> {
  await api.post(`/notifications/${id}/marquer-lue/`)
}
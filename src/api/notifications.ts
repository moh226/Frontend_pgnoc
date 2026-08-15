import { api } from './client'
import type { CompteNonLues, NotificationItem, ResultatPagines } from '@/types'

export async function listeNotifications(
  seulementNonLues = false,
  page = 1,
  page_size = 20,
): Promise<ResultatPagines<NotificationItem>> {
  const { data } = await api.get<ResultatPagines<NotificationItem>>('/notifications/', {
    params: {
      page,
      page_size,
      ...(seulementNonLues ? { non_lues: 'true' } : {}),
    },
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
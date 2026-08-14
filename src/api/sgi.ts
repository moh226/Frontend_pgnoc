import { api } from './client'
import type { FicheSgi, ResultatPagines, SgiPublique } from '@/types'

export async function listeSgi(): Promise<ResultatPagines<SgiPublique>> {
  const { data } = await api.get<ResultatPagines<SgiPublique>>('/sgi/')
  return data
}

export async function ficheSgi(id: string): Promise<FicheSgi> {
  const { data } = await api.get<FicheSgi>(`/sgi/${id}/`)
  return data
}
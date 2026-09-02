import { api } from './client'
import type { AgentSgi, ResultatPagines } from '@/types'

export interface ParametresAgent {
  email: string
  prenom?: string
  nom?: string
  matricule?: string
  mot_de_passe?: string
}

export async function listeAgents(): Promise<AgentSgi[]> {
  const agents: AgentSgi[] = []
  let page = 1
  for (;;) {
    const { data } = await api.get<ResultatPagines<AgentSgi>>('/comptes/agents/', {
      params: page === 1 ? undefined : { page },
    })
    agents.push(...data.results)
    if (!data.next || page >= 50) break
    page += 1
  }
  return agents
}

export async function creerAgent(parametres: ParametresAgent): Promise<AgentSgi> {
  const { data } = await api.post<AgentSgi>('/comptes/agents/', parametres)
  return data
}

export async function modifierAgent(
  id: string,
  parametres: Partial<Pick<AgentSgi, 'prenom' | 'nom' | 'is_active'>>,
): Promise<AgentSgi> {
  const { data } = await api.patch<AgentSgi>(`/comptes/agents/${id}/`, parametres)
  return data
}
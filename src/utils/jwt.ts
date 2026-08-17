import type { RoleCode } from '@/types'

interface PayloadJwt {
  role?: string
  exp?: number
}

function decoderPayload(access: string): PayloadJwt | null {
  try {
    const segment = access.split('.')[1]
    if (!segment) return null
    const standard = segment.replace(/-/g, '+').replace(/_/g, '/')
    const rembourrage = (4 - (standard.length % 4)) % 4
    return JSON.parse(atob(standard + '='.repeat(rembourrage))) as PayloadJwt
  } catch {
    return null
  }
}

export function roleDepuisJwt(access: string): RoleCode | null {
  const payload = decoderPayload(access)
  return (payload?.role as RoleCode) ?? null
}

export function jwtEstExpire(access: string | null): boolean {
  if (!access) return true
  const payload = decoderPayload(access)
  if (!payload?.exp) return false
  return payload.exp * 1000 <= Date.now()
}
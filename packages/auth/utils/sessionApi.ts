import { ofetch } from 'ofetch'
import type { EncryptedPayload } from './encrypt'

export interface SessionLoginResponse {
  redirectToken?: string
  refreshToken?: string
  userName: string
  recovery?: string
  sessionPayload?: {
    email: string
    email_verified: boolean
    preferred_username?: string
    'cognito:username'?: string
    sub?: string
    merchant_data: Record<string, unknown>
    [key: string]: unknown
  }
}

interface SessionLoginInput {
  payloads: EncryptedPayload[]
  clientId: string
  source?: string
}

export async function fetchPublicKey(baseUrl: string): Promise<string> {
  const response = await ofetch<{ data: { pk: string } }>(`${baseUrl}/sessions/public`)
  return response.data.pk
}

export async function loginWithSession(
  baseUrl: string,
  input: SessionLoginInput,
): Promise<SessionLoginResponse> {
  const response = await ofetch<{ data: SessionLoginResponse }>(`${baseUrl}/sessions/login`, {
    method: 'POST',
    body: input,
  })
  return response.data
}

export async function exchangeRedirectToken(
  baseUrl: string,
  redirectToken: string,
  fingerprint: string,
): Promise<{ refreshToken: string; id: { type: string; nickname?: string; email?: string } }> {
  const response = await ofetch<{ data: { refreshToken: string; id: { type: string; nickname?: string; email?: string } } }>(
    `${baseUrl}/sessions/exchange-redirect`,
    {
      method: 'POST',
      body: { redirectToken, fingerprint },
    },
  )
  return response.data
}

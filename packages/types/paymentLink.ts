export interface PaymentLink {
  id: string
  name: string
  description: string | null
  amount_in_cents: number
  currency: string
  status: PaymentLinkStatus
  expires_at: string | null
  url: string
  created_at: string
  transactions_count: number
}

export type PaymentLinkStatus = 'ACTIVE' | 'EXPIRED' | 'DISABLED'

export interface CreatePaymentLinkRequest {
  name: string
  description: string
  amount_in_cents: number
  currency: string
  expires_at: string | null
}

export interface PayoutBalance {
  available_amount: number
  currency: string
  auto_payment_enabled: boolean
}

export interface PayoutTransaction {
  id: string
  amount_in_cents: number
  status: PayoutStatus
  created_at: string
  destination: PayoutDestination
}

export type PayoutStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'

export interface PayoutDestination {
  type: 'BANK_ACCOUNT' | 'FAVORITE'
  bank_name?: string
  account_number?: string
  account_type?: string
}

export interface CreatePayoutRequest {
  amount_in_cents: number
  destination: PayoutDestination
  concept: string
  payment_type: string
}

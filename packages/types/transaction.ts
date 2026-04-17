export interface Transaction {
  id: string
  reference: string
  amount_in_cents: number
  currency: string
  payment_method_type: string
  status: TransactionStatus
  source_channel: string
  customer_email: string | null
  created_at: string
  finalized_at: string | null
  payment_method: PaymentMethod
}

export type TransactionStatus = 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR' | 'PENDING'

export interface TransactionFilters {
  id: string
  reference: string
  customer_email: string
  is_strict_payment_method_type: boolean
  status: string
  payment_method_type: string
  source_channel: string
}

export interface PaymentMethod {
  type: string
  extra: Record<string, unknown>
}

export type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'WON' | 'LOST' | 'EXPIRED'

export interface Dispute {
  id: string
  status: DisputeStatus
  amount_in_cents: number
  currency: string
  reason: string
  created_at: string
  updated_at: string
  transaction_id: string
  transaction: {
    id: string
    reference: string
    amount_in_cents: number
    currency: string
    status: string
    payment_method_type: string
    created_at: string
  } | null
  timeline: DisputeTimelineEntry[]
}

export interface DisputeTimelineEntry {
  status: DisputeStatus
  date: string
  description: string
}

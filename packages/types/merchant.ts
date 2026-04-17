export interface Merchant {
  id: string
  name: string
  legal_name: string | null
  legal_id: string | null
  legal_id_type: string | null
  is_gateway: boolean
  active: boolean
  public_key: string | null
  email: string | null
  phone_number: string | null
  vpos_payment_link: { id: string } | null
  accepted_payment_methods: string[]
}

export interface ApiEnvironment {
  tag: 'production' | 'sandbox'
  name: string
  type: string
  baseUrl: string
}

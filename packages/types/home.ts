export interface Balance {
  available: number
  pending: number
  total: number
}

export interface BusinessProcedure {
  id: string
  slug: string
  status: 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'DECLINED' | 'RESCUE'
  requirements?: Array<{ record?: { status: string } }>
}

export interface MfaMethodsResponse {
  prefered: string
}

export interface MfeHomeConfig {
  REGION: string
  CHECKOUT_URL: string
  ENABLE_DATAPHONE_PURCHASE_FLOW: string
  PAYOUTS_LITE_MERCHANT_LIST: string
  API_GW_BASE_URL: string
  API_GW_BASE_URL_SANDBOX: string
  LOGIN_DOMAIN: string
}

export interface UserPermissions {
  merchantID: string
  isUserPrincipal: boolean
  permissions: Permission[]
  listOfMerchants: MerchantPermission[]
  merchant: MerchantPermission
  userNamePrincipal: string
  validateMultipleMerchants: boolean
}

export interface MerchantPermission {
  id: string
  roleName: string
  name: string
}

export interface Permission {
  action: string
  subject: string
}

export interface CognitoTokens {
  accessToken: string
  idToken: string
  refreshToken: string
}

export interface AuthState {
  user: CognitoUserInfo | null
  tokens: CognitoTokens | null
  isAuthenticated: boolean
}

export interface CognitoUserInfo {
  userName: string
  email: string
  name: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface ApiClientConfig {
  baseUrl?: string
  timeout?: number
  useAuth?: boolean
  usePrefix?: boolean
  onUnauthorized?: () => void
  getToken?: () => string | null
  refreshSession?: () => Promise<unknown>
}

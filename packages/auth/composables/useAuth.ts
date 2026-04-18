import {
  CognitoUserPool,
  CognitoUser,
  CognitoRefreshToken,
} from 'amazon-cognito-identity-js'
import { reactive, computed } from 'vue'
import type { AuthState, LoginCredentials, CognitoTokens } from '@wompi/types'
import { poolData } from '../utils/cognito'
import { performEnvelopeEncryption } from '../utils/encrypt'
import { fetchPublicKey, loginWithSession, exchangeRedirectToken } from '../utils/sessionApi'

const authState = reactive<AuthState>({
  user: null,
  tokens: null,
  isAuthenticated: false,
})

function getApiBaseUrl(): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return String((import.meta as any).env?.VITE_API_GW_BASE_URL || 'https://api.co.dev.wompi.dev/v1')
}

export function useAuth() {
  const userPool = new CognitoUserPool(poolData)

  async function login({ username, password }: LoginCredentials): Promise<void> {
    const baseUrl = getApiBaseUrl()
    const clientId = String(import.meta.env.VITE_DASHBOARD_CLIENT_ID)

    // 1. Fetch public key
    const publicKey = await fetchPublicKey(baseUrl)

    // 2. Encrypt credentials
    const fingerprint = await generateFingerprint()
    const encryptedPayload = await performEnvelopeEncryption(
      { email: username, password, fingerprint, salt: Date.now() },
      publicKey,
    )

    // 3. POST /sessions/login → redirectToken + refreshToken + sessionPayload
    const loginResult = await loginWithSession(baseUrl, {
      payloads: [encryptedPayload],
      clientId,
      source: 'LOGIN',
    })

    if (loginResult.recovery === 'force') throw new Error('PASSWORD_CHANGE_REQUIRED')
    if (loginResult.recovery === 'expired') throw new Error('PASSWORD_EXPIRED')

    if (!loginResult.refreshToken) throw new Error('Login failed: no refreshToken')

    const email = loginResult.sessionPayload?.email || ''
    const cognitoUsername = (loginResult.sessionPayload?.['cognito:username'] as string) || loginResult.userName

    // 4. Exchange redirect → get the real refreshToken for Cognito
    let finalRefreshToken = loginResult.refreshToken

    if (loginResult.redirectToken) {
      try {
        const exchangeResult = await exchangeRedirectToken(baseUrl, loginResult.redirectToken, fingerprint)
        if (exchangeResult.refreshToken) {
          finalRefreshToken = exchangeResult.refreshToken
        }
      } catch (e) {
        console.warn('[Auth] exchange-redirect failed, using login refreshToken:', e)
      }
    }

    // 5. Try Cognito refresh to get accessToken/idToken
    try {
      const tokens = await cognitoRefresh(cognitoUsername, finalRefreshToken)
      saveSession(tokens, loginResult.userName, email)
      return
    } catch (e) {
      console.warn('[Auth] Cognito refresh failed, saving session directly:', e)
    }

    // 6. Fallback: save the refreshToken as the accessToken (the API accepts it)
    saveSession(
      { accessToken: finalRefreshToken, idToken: '', refreshToken: finalRefreshToken },
      loginResult.userName,
      email,
    )
  }

  function cognitoRefresh(userName: string, refreshToken: string): Promise<CognitoTokens> {
    const cognitoUser = new CognitoUser({ Username: userName, Pool: userPool })
    const refreshTokenObj = new CognitoRefreshToken({ RefreshToken: refreshToken })

    return new Promise((resolve, reject) => {
      cognitoUser.refreshSession(refreshTokenObj, (err, session) => {
        if (err) return reject(err)
        resolve({
          accessToken: session.getAccessToken().getJwtToken(),
          idToken: session.getIdToken().getJwtToken(),
          refreshToken,
        })
      })
    })
  }

  async function refreshSession(): Promise<CognitoTokens> {
    const userName = localStorage.getItem('cognitoUsername') || localStorage.getItem('userName')
    const refreshToken = localStorage.getItem('refreshToken')
    if (!userName || !refreshToken) throw new Error('No session to refresh')

    try {
      const tokens = await cognitoRefresh(userName, refreshToken)
      const displayName = localStorage.getItem('userName') || userName
      const email = localStorage.getItem('userEmail') || ''
      saveSession(tokens, displayName, email)
      return tokens
    } catch {
      // If Cognito refresh fails, return what we have
      const current: CognitoTokens = {
        accessToken: localStorage.getItem('token') || refreshToken,
        idToken: localStorage.getItem('idToken') || '',
        refreshToken,
      }
      return current
    }
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('idToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('userName')
    localStorage.removeItem('cognitoUsername')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userUUID')
    localStorage.removeItem('userPrincipalID')
    sessionStorage.clear()

    authState.user = null
    authState.tokens = null
    authState.isAuthenticated = false
  }

  function saveSession(tokens: CognitoTokens, userName: string, email?: string) {
    localStorage.setItem('token', tokens.accessToken)
    localStorage.setItem('idToken', tokens.idToken)
    localStorage.setItem('refreshToken', tokens.refreshToken)
    localStorage.setItem('userName', userName)
    if (email) localStorage.setItem('userEmail', email)

    if (tokens.idToken) {
      try {
        const payload = JSON.parse(atob(tokens.idToken.split('.')[1]))
        if (payload['cognito:username']) localStorage.setItem('cognitoUsername', payload['cognito:username'])
        if (payload.email && !email) localStorage.setItem('userEmail', payload.email)
      } catch { /* ignore */ }
    }

    authState.tokens = tokens
    authState.isAuthenticated = true
  }

  return {
    user: computed(() => authState.user),
    tokens: computed(() => authState.tokens),
    isAuthenticated: computed(() => authState.isAuthenticated),
    login,
    refreshSession,
    logout,
  }
}

async function generateFingerprint(): Promise<string> {
  const raw = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
  ].join('|')
  const encoder = new TextEncoder()
  const data = encoder.encode(raw)
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

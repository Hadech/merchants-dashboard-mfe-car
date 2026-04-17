import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoRefreshToken,
} from 'amazon-cognito-identity-js'
import { reactive, computed } from 'vue'
import type { AuthState, LoginCredentials, CognitoTokens } from '@wompi/types'
import { poolData } from '../utils/cognito'

const authState = reactive<AuthState>({
  user: null,
  tokens: null,
  isAuthenticated: false,
})

export function useAuth() {
  const userPool = new CognitoUserPool(poolData)

  async function login({ username, password }: LoginCredentials): Promise<void> {
    const authDetails = new AuthenticationDetails({
      Username: username,
      Password: password,
    })

    const cognitoUser = new CognitoUser({ Username: username, Pool: userPool })
    cognitoUser.setAuthenticationFlowType('USER_PASSWORD_AUTH')

    return new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authDetails, {
        onSuccess: (session) => {
          const tokens: CognitoTokens = {
            accessToken: session.getAccessToken().getJwtToken(),
            idToken: session.getIdToken().getJwtToken(),
            refreshToken: session.getRefreshToken().getToken(),
          }
          saveSession(tokens, username)
          resolve()
        },
        newPasswordRequired: (session) => {
          reject({ isRecovery: true, session })
        },
        onFailure: (error) => reject(error),
      })
    })
  }

  async function refreshSession(): Promise<CognitoTokens> {
    const userName = localStorage.getItem('userName')
    const refreshToken = localStorage.getItem('refreshToken')

    if (!userName || !refreshToken) throw new Error('No session to refresh')

    const cognitoUser = new CognitoUser({ Username: userName, Pool: userPool })
    const refreshTokenObj = new CognitoRefreshToken({ RefreshToken: refreshToken })

    return new Promise((resolve, reject) => {
      cognitoUser.refreshSession(refreshTokenObj, (err, session) => {
        if (err) return reject(err)
        const tokens: CognitoTokens = {
          accessToken: session.getAccessToken().getJwtToken(),
          idToken: session.getIdToken().getJwtToken(),
          refreshToken: refreshToken,
        }
        saveSession(tokens, userName)
        resolve(tokens)
      })
    })
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('idToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('userName')
    localStorage.removeItem('userUUID')
    localStorage.removeItem('userPrincipalID')
    sessionStorage.clear()

    authState.user = null
    authState.tokens = null
    authState.isAuthenticated = false
  }

  function saveSession(tokens: CognitoTokens, userName: string) {
    localStorage.setItem('token', tokens.accessToken)
    localStorage.setItem('idToken', tokens.idToken)
    localStorage.setItem('refreshToken', tokens.refreshToken)
    localStorage.setItem('userName', userName)

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

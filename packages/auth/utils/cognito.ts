import { CognitoUserPool } from 'amazon-cognito-identity-js'

export const poolData = {
  UserPoolId: String(import.meta.env.VITE_DASHBOARD_USER_POOL_ID),
  ClientId: String(import.meta.env.VITE_DASHBOARD_CLIENT_ID),
}

export function createUserPool() {
  return new CognitoUserPool(poolData)
}

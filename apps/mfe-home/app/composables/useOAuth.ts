import { useSessionStore } from '../stores/session'
import { useEventBus } from '@wompi/event-bus'

export function useOAuth() {
  const sessionStore = useSessionStore()
  const { emit } = useEventBus('mfe-home')

  async function continueOAuthFlow() {
    try {
      const data = await $fetch<{ redirect_url: string }>('/oauth/authenticate', {
        method: 'POST',
        body: {
          authentication: {
            provider: 'Cognito',
            data: {
              access_token: sessionStore.token,
              id_token: sessionStore.idToken,
              token_type: 'Bearer',
            },
          },
        },
      })
      window.location.href = data.redirect_url
    } catch {
      emit('mfe-home:logout', undefined as any)
    }
  }

  return { continueOAuthFlow }
}

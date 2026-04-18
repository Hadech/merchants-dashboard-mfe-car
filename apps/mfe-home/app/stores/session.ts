import type { UserPermissions, MfeHomeConfig } from '@wompi/types'
import { useEventBus } from '@wompi/event-bus'

export interface MfeHomeProps {
  token: string
  idToken: string
  refreshToken: string
  userName: string
  userPermissions: UserPermissions
  config: MfeHomeConfig
}

export const useSessionStore = defineStore('session', () => {
  const userPermissions = ref<UserPermissions | null>(null)
  const token = ref('')
  const idToken = ref('')
  const refreshToken = ref('')
  const userName = ref('')
  const config = ref<MfeHomeConfig>({
    REGION: '',
    CHECKOUT_URL: '',
    ENABLE_DATAPHONE_PURCHASE_FLOW: '',
    PAYOUTS_LITE_MERCHANT_LIST: '',
    API_GW_BASE_URL: '',
    API_GW_BASE_URL_SANDBOX: '',
    LOGIN_DOMAIN: '',
  })

  const merchantID = computed(() => userPermissions.value?.merchantID ?? '')
  const isUserPrincipal = computed(() => userPermissions.value?.isUserPrincipal ?? false)
  const permissions = computed(() => userPermissions.value?.permissions ?? [])
  const listOfMerchants = computed(() => userPermissions.value?.listOfMerchants ?? [])

  const { emit } = useEventBus('mfe-home')

  function hydrate(props: MfeHomeProps) {
    if (!props.token) {
      emit('mfe-home:error', { code: 'MISSING_SESSION_DATA', message: 'Missing token' })
      return
    }

    if (!props.userPermissions?.merchantID) {
      emit('mfe-home:error', { code: 'MISSING_SESSION_DATA', message: 'Missing merchantID' })
      return
    }

    if (!props.userPermissions?.permissions) {
      emit('mfe-home:error', { code: 'MISSING_SESSION_DATA', message: 'Missing permissions' })
      return
    }

    token.value = props.token
    idToken.value = props.idToken
    refreshToken.value = props.refreshToken
    userName.value = props.userName
    userPermissions.value = props.userPermissions
    config.value = props.config
  }

  return {
    userPermissions,
    token,
    idToken,
    refreshToken,
    userName,
    config,
    merchantID,
    isUserPrincipal,
    permissions,
    listOfMerchants,
    hydrate,
  }
})

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MfeHomeConfig, UserPermissions, MerchantPermission, Permission } from '@wompi/types'
import { useEventBus } from '@wompi/event-bus'

export const useSessionStore = defineStore('session', () => {
  const { emit } = useEventBus('mfe-home')

  const token = ref('')
  const idToken = ref('')
  const refreshToken = ref('')
  const userName = ref('')
  const userPermissions = ref<UserPermissions | null>(null)
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
  const permissions = computed<Permission[]>(() => userPermissions.value?.permissions ?? [])
  const listOfMerchants = computed<MerchantPermission[]>(() => userPermissions.value?.listOfMerchants ?? [])
  const merchant = computed<MerchantPermission | null>(() => userPermissions.value?.merchant ?? null)

  function hydrate(props: {
    token: string
    idToken?: string
    refreshToken?: string
    userName?: string
    userPermissions: UserPermissions
    config: MfeHomeConfig
  }) {
    if (!props.token || !props.userPermissions?.merchantID || !props.userPermissions?.permissions) {
      emit('mfe-home:error', { code: 'MISSING_SESSION_DATA', message: 'Required session data is missing' })
      return
    }
    token.value = props.token
    idToken.value = props.idToken ?? ''
    refreshToken.value = props.refreshToken ?? ''
    userName.value = props.userName ?? ''
    userPermissions.value = props.userPermissions
    config.value = props.config
  }

  return {
    token,
    idToken,
    refreshToken,
    userName,
    userPermissions,
    config,
    merchantID,
    isUserPrincipal,
    permissions,
    listOfMerchants,
    merchant,
    hydrate,
  }
})

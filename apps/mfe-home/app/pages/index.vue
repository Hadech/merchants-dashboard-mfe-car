<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useEventBus } from '@wompi/event-bus'
import { useMerchantsStore } from '../stores/merchants'
import { useProductsStore } from '../stores/products'
import { useSessionStore } from '../stores/session'
import { usePermissions } from '../composables/usePermissions'
import { useNavigation } from '../composables/useNavigation'
import { useMfeHomeConfig } from '../composables/useMfeHomeConfig'
import { useOAuth } from '../composables/useOAuth'
import { isTruthy } from '../utils/isTruthy'
import { getCountryConfig } from '../utils/countryConfig'
import { getLastProcedure } from '../utils/businessProceduresHandler'
import { takeInitialUserName } from '../utils/takeInitialUserName'

const { emit } = useEventBus('mfe-home')
const merchantsStore = useMerchantsStore()
const productsStore = useProductsStore()
const sessionStore = useSessionStore()
const { can } = usePermissions()
const { navigateTo } = useNavigation()
const config = useMfeHomeConfig()
const { continueOAuthFlow } = useOAuth()
const route = useRoute()

const showMfaModal = ref(false)
const showMfaButton = ref(false)
const openUserMenu = ref(false)
const shouldOpenBalanceModal = ref(false)

const textIcon = computed(() =>
  takeInitialUserName(sessionStore.userPermissions?.userNamePrincipal ?? '')
)

const isNewEnrollment = computed(() =>
  merchantsStore.businessesProcedures.some(p => p.slug.includes('vtp'))
)

const isDataphoneFlowEnabled = computed(() =>
  isTruthy(config.ENABLE_DATAPHONE_PURCHASE_FLOW)
)

const isNequiNegocios = computed(() =>
  Boolean(merchantsStore.featureFlags['NEQUI_NEGOCIOS'])
)

const showEnrollmentBanner = computed(() =>
  getCountryConfig(config.REGION).uiFlags.showEnrollmentBanner
)

const checkIfIsDeclined = computed(() => {
  const lastProcedure = getLastProcedure(merchantsStore.businessesProcedures)
  if (!lastProcedure) return false
  return lastProcedure.status !== 'DECLINED'
})

const shouldRenderModal = computed(() => {
  if (config.REGION === 'GT') return false
  const ids = config.PAYOUTS_LITE_MERCHANT_LIST
    ? config.PAYOUTS_LITE_MERCHANT_LIST.split(',').map(s => s.trim())
    : []
  const merchantId = sessionStore.merchantID
  const isEligible = ids.includes('*') || ids.includes(merchantId)
  return isEligible && !productsStore.payoutsAvailable
})

function toggleMfaModal() {
  showMfaModal.value = !showMfaModal.value
}

function mfaEnabledCorrectly() {
  showMfaButton.value = false
}

function handlerClickUserMenu() {
  openUserMenu.value = !openUserMenu.value
}

function clickOut(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('#user-menu-area')) {
    openUserMenu.value = false
  }
}

function handleTourClosed() {
  const alreadySeen = localStorage.getItem('balance-availability-modal-shown') !== null
  if (!alreadySeen) {
    shouldOpenBalanceModal.value = true
  }
}

onMounted(async () => {
  const merchantId = sessionStore.merchantID
  if (!merchantId) {
    emit('mfe-home:merchant-redirect', { path: '/selected-merchant' })
    return
  }

  await merchantsStore.fetchMerchants()
  await merchantsStore.fetchBusinessesProcedures(merchantId)
  await productsStore.fetchProducts(merchantId)
  await merchantsStore.evaluateFeatureFlags('NEQUI_NEGOCIOS')

  setTimeout(() => {
    merchantsStore.fetchBalance()
  }, 1500)

  const { type } = route.query
  if (type === 'oauth' && merchantsStore.merchant) {
    continueOAuthFlow()
  }

  // Validate balance modal on mount
  const tourSeen = localStorage.getItem('no-show-onboarding-tour') === 'true'
  const balanceSeen = localStorage.getItem('balance-availability-modal-shown') !== null
  if (tourSeen && !balanceSeen) {
    shouldOpenBalanceModal.value = true
  }
})
</script>

<template>
  <div class="home" @click="clickOut">
    <MfaEnableModal
      v-if="showMfaModal"
      @close="toggleMfaModal"
      @complete="mfaEnabledCorrectly"
    />

    <div class="view-header">
      <h1 class="view-title">Inicio</h1>
      <div id="user-menu-area" class="user-menu-area">
        <button class="user-icon-btn" @click="handlerClickUserMenu">
          {{ textIcon }}
        </button>
        <DropDownUserMenu
          v-if="openUserMenu && sessionStore.userPermissions"
          :merchants="sessionStore.listOfMerchants"
          :current-merchant="sessionStore.merchant!"
          :text-icon="textIcon"
        />
      </div>
    </div>

    <div v-if="merchantsStore.merchant" class="view-content">
      <TimelineProcedures v-if="!isNewEnrollment" />
      <TimelineApprovalStatus v-if="isNewEnrollment" />

      <div v-if="showMfaButton" class="mfa-button-container">
        <button class="mfa-button" @click="toggleMfaModal">
          Protege tu ingreso a Wompi con una doble verificación
        </button>
      </div>

      <MerchantInfo
        :merchant="merchantsStore.merchant"
        :balance="merchantsStore.balance"
        :is-sandbox="false"
      />

      <Breb />

      <template v-if="showEnrollmentBanner">
        <HomeViewDataphoneBanner
          v-if="isDataphoneFlowEnabled && !isNequiNegocios && can('dataphonePurchase', 'administration')"
        />
        <HomeViewBanner
          v-if="merchantsStore.merchant.vpos_payment_link && !isNequiNegocios"
          :is-payouts-available="productsStore.payoutsAvailable"
        />
      </template>

      <VposSection
        v-if="merchantsStore.merchant.vpos_payment_link && can('share', 'virtualDataphone')"
        :vpos="merchantsStore.merchant.vpos_payment_link"
        :checkout-url="config.CHECKOUT_URL"
      />

      <ShortcutLinks />
    </div>

    <TourOnboarding
      v-if="checkIfIsDeclined"
      :businesses-procedures="merchantsStore.businessesProcedures"
      @tour-closed="handleTourClosed"
    />

    <BalanceAvailabilityModal
      v-if="shouldRenderModal"
      :force-open="shouldOpenBalanceModal"
      :merchant-id="sessionStore.merchantID"
      :payouts-lite-merchant-list="config.PAYOUTS_LITE_MERCHANT_LIST"
      :payouts-available="productsStore.payoutsAvailable"
      :region="config.REGION"
    />
  </div>
</template>

<style scoped>
.home {
  position: relative;
}
.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
}
.view-title {
  font-size: 24px;
  font-weight: 700;
}
.user-menu-area {
  position: relative;
}
.user-icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #2c2a29;
  color: #dfff61;
  border: none;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.view-content {
  position: relative;
}
.mfa-button-container {
  padding-bottom: 1.5rem;
  text-align: right;
}
.mfa-button {
  border-radius: 12px;
  border: 1px solid #2c2a29;
  background: #dfff61;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
}
</style>

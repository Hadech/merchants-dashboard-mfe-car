<template>
  <div>
    <!-- Sandbox Bar -->
    <AppSandboxBar v-if="isSandbox" />

    <!-- Mobile Toolbar is inside AppSidebar -->
    <AppSidebar
      :menu-items="menuItems"
      :is-sandbox="isSandbox"
      :is-open="sidebarOpen"
      @open="sidebarOpen = true"
      @close="sidebarOpen = false"
      @navigate="handleNavigation"
      @logout="handleLogout"
    />

    <!-- Main Content Area -->
    <div class="dashboard-body" :style="isSandbox ? {} : {}">
      <div class="view-content">
        <AppHeader
          :merchant="currentMerchant"
          :environment="currentEnvironment"
          :user="authUser"
        />
        <div class="dashboard-container">
          <NuxtPage />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '@wompi/auth'
import { useMerchantContext } from '~/composables/useMerchantContext'

interface MenuItem {
  id: string
  to: string
  name: string
  icon?: string
  isNew?: boolean
  subItems?: MenuItem[]
}

const { user, logout } = useAuth()
const { currentMerchant, currentEnvironment, isSandbox } = useMerchantContext()

const authUser = computed(() => user.value)
const sidebarOpen = ref(false)

// Close sidebar on route change (mobile)
const route = useRoute()
watch(() => route.path, () => {
  sidebarOpen.value = false
})


// Default menu items matching the legacy dashboard structure
const menuItems = computed<MenuItem[]>(() => [
  {
    id: 'home',
    to: '/home',
    name: 'Inicio',
    icon: 'home',
  },
  {
    id: 'transactions-main',
    to: '/transactions',
    name: 'Transacciones',
    icon: 'invoice-edit',
    subItems: [
      { id: 'transactions', to: '/transactions', name: 'Recibir pagos' },
    ],
  },
  {
    id: 'receive-payments-main',
    to: '/payment-links',
    name: 'Recibir pagos',
    icon: 'send-cash',
    subItems: [
      { id: 'custom-payment-link', to: '/payment-links', name: 'Link pago personalizado' },
      { id: 'disbursements', to: '/disbursements', name: 'Desembolsos' },
    ],
  },
  {
    id: 'reports-main',
    to: '/documents',
    name: 'Reportes',
    icon: 'chart-analytics',
    subItems: [
      { id: 'documents', to: '/documents', name: 'Recibir pagos' },
    ],
  },
  {
    id: 'payouts-main',
    to: '/payouts/balances',
    name: 'Pagos a terceros',
    icon: 'payout',
    isNew: true,
    subItems: [
      { id: 'payouts-balances', to: '/payouts/balances', name: 'Saldos' },
      { id: 'payouts-create', to: '/payouts/createPayment', name: 'Crear Pago' },
      { id: 'payouts-favorites', to: '/payouts/favorites', name: 'Destinatarios favoritos' },
      { id: 'payouts-consult', to: '/payouts/consultTransactions', name: 'Consultar transacciones' },
      { id: 'payouts-approvals', to: '/payouts/approvals', name: 'Aprobaciones' },
      { id: 'payouts-limits', to: '/payouts/limits', name: 'Límites' },
    ],
  },
  {
    id: 'development-main',
    to: '/developers',
    name: 'Desarrollo',
    icon: 'code',
    subItems: [
      { id: 'developers', to: '/developers', name: 'Programadores' },
      { id: 'debugger', to: '/debugger', name: 'Debugger' },
      { id: 'technical-guides', to: 'https://docs.wompi.co', name: 'Guías técnicas' },
    ],
  },
  {
    id: 'roles-n-users-main',
    to: '/users',
    name: 'Roles y Usuarios',
    icon: 'users-check',
    subItems: [
      { id: 'users', to: '/users', name: 'Recibir pagos' },
    ],
  },
  {
    id: 'merchant-account-main',
    to: '/my-account',
    name: 'Cuenta comercio',
    icon: 'store',
    subItems: [
      { id: 'my-account', to: '/my-account', name: 'Resumen cuenta' },
      { id: 'procedures', to: '/procedures/list', name: 'Procedimientos' },
    ],
  },
])

function handleLogout() {
  logout()
  navigateTo('/login')
}

function handleNavigation(path: string) {
  navigateTo(path)
}
</script>

<style scoped>
.dashboard-container {
  max-width: 74.25rem;
  margin: 0 auto;
}
</style>

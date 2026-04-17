<template>
  <aside class="w-64 bg-white border-r border-gray-200 flex flex-col">
    <div class="p-4 border-b border-gray-200">
      <span class="text-xl font-bold text-[#E6007E]">Wompi</span>
    </div>
    <nav class="flex-1 overflow-y-auto p-3 space-y-6">
      <div v-for="group in navGroups" :key="group.label">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">{{ group.label }}</p>
        <ul class="space-y-1">
          <li v-for="item in group.items" :key="item.path">
            <NuxtLink
              :to="item.path"
              class="flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors"
              active-class="bg-pink-50 text-pink-600 font-medium"
              inactive-class="text-gray-600 hover:bg-gray-100"
            >
              <UIcon :name="item.icon" class="w-5 h-5" />
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
const emit = defineEmits<{ navigate: [path: string] }>()

const navGroups = [
  {
    label: 'Transacciones',
    items: [
      { label: 'Transacciones', path: '/transactions', icon: 'i-heroicons-credit-card' },
      { label: 'Disputas', path: '/disputes', icon: 'i-heroicons-shield-exclamation' },
      { label: 'Payment Links', path: '/payment-links', icon: 'i-heroicons-link' },
    ],
  },
  {
    label: 'Payouts',
    items: [
      { label: 'Balances', path: '/balances', icon: 'i-heroicons-banknotes' },
      { label: 'Crear Pago', path: '/create-payment', icon: 'i-heroicons-plus-circle' },
      { label: 'Transacciones', path: '/payouts/transactions', icon: 'i-heroicons-arrow-path' },
      { label: 'Aprobaciones', path: '/approvals', icon: 'i-heroicons-check-badge' },
      { label: 'Favoritos', path: '/favorites', icon: 'i-heroicons-star' },
      { label: 'Límites', path: '/limits', icon: 'i-heroicons-adjustments-horizontal' },
      { label: 'Reportes', path: '/reports', icon: 'i-heroicons-document-chart-bar' },
    ],
  },
  {
    label: 'Configuración',
    items: [
      { label: 'Usuarios', path: '/users', icon: 'i-heroicons-users' },
      { label: 'Roles', path: '/roles', icon: 'i-heroicons-key' },
      { label: 'Llaves API', path: '/keys', icon: 'i-heroicons-lock-closed' },
      { label: 'Mi Cuenta', path: '/my-account', icon: 'i-heroicons-user-circle' },
      { label: 'Developers', path: '/developers', icon: 'i-heroicons-code-bracket' },
    ],
  },
]
</script>

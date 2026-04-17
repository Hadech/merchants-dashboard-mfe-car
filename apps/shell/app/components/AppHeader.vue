<template>
  <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
    <div class="flex items-center gap-4">
      <span class="text-sm font-medium text-gray-700">{{ merchant?.name || 'Sin merchant' }}</span>
      <UBadge :color="isSandbox ? 'warning' : 'success'" variant="subtle" size="sm">
        {{ environment?.name || 'Producción' }}
      </UBadge>
    </div>
    <div class="flex items-center gap-3">
      <UButton variant="ghost" size="sm" @click="$emit('toggle-environment')">
        {{ isSandbox ? 'Ir a Producción' : 'Ir a Sandbox' }}
      </UButton>
      <UDropdownMenu :items="userMenuItems">
        <UButton variant="ghost" icon="i-heroicons-user-circle" size="sm">
          {{ user?.name || user?.userName || 'Usuario' }}
        </UButton>
      </UDropdownMenu>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { Merchant, ApiEnvironment, CognitoUserInfo } from '@wompi/types'

const props = defineProps<{
  merchant: Merchant | null
  environment: ApiEnvironment
  user: CognitoUserInfo | null
}>()

const emit = defineEmits<{
  'toggle-environment': []
  logout: []
}>()

const isSandbox = computed(() => props.environment?.type?.includes('test'))

const userMenuItems = computed(() => [
  [{ label: 'Mi Cuenta', icon: 'i-heroicons-user-circle', to: '/my-account' }],
  [{ label: 'Cerrar Sesión', icon: 'i-heroicons-arrow-right-on-rectangle', click: () => emit('logout') }],
])
</script>

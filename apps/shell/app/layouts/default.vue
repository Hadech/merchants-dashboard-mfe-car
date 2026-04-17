<template>
  <div class="flex h-screen bg-gray-50">
    <AppSidebar @navigate="handleNavigation" />
    <div class="flex flex-1 flex-col overflow-hidden">
      <AppHeader
        :merchant="currentMerchant"
        :environment="currentEnvironment"
        :user="authUser"
        @toggle-environment="toggleEnvironment"
        @logout="handleLogout"
      />
      <main class="flex-1 overflow-y-auto p-6">
        <NuxtPage />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '@wompi/auth'
import { useMerchantContext } from '~/composables/useMerchantContext'

const { user, logout } = useAuth()
const { currentMerchant, currentEnvironment, isSandbox, toggleEnvironment } = useMerchantContext()

const authUser = computed(() => user.value)

function handleLogout() {
  logout()
  navigateTo('/login')
}

function handleNavigation(path: string) {
  navigateTo(path)
}
</script>

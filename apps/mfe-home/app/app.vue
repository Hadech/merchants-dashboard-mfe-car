<template>
  <NuxtPage />
</template>

<script setup lang="ts">
import { useEventBus } from '@wompi/event-bus'

const { on, cleanup } = useEventBus('mfe-home')

on('merchant:changed', () => {
  // Reload data when merchant changes
})

on('environment:changed', () => {
  // Reload data when environment changes
})

on('auth:session-refreshed', () => {
  // Handle token refresh
})

on('auth:logout', () => {
  // Handle logout
})

onUnmounted(() => {
  cleanup()
})
</script>

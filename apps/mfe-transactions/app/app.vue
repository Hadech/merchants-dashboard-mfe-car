<template>
  <NuxtPage />
</template>

<script setup lang="ts">
import { useEventBus } from '@wompi/event-bus'

const { on, cleanup } = useEventBus('mfe-transactions')

on('merchant:changed', () => {
  // Reload data when merchant changes
})

on('environment:changed', () => {
  // Reload data when environment changes
})

onUnmounted(() => {
  cleanup()
})
</script>

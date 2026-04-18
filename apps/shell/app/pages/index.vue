<script setup lang="ts">
onMounted(() => {
  navigateTo('/disbursements', { replace: true })
})
</script>

<template>
  <div class="flex items-center justify-center h-64">
    <UIcon name="i-heroicons-arrow-path" class="animate-spin h-8 w-8 text-pink-500" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <div class="w-highlight-card">
    <p class="w-highlight-card__title">{{ title }}</p>
    <slot />
  </div>
</template>

<style scoped>
.w-highlight-card {
  background-color: #DFFF61;
  border: 1px solid #2C2A29;
  border-radius: 16px;
  padding: 16px 28px;
}

.w-highlight-card__title {
  font-size: 14px;
  font-weight: 700;
  margin: 0 0 8px;
  color: #2C2A29;
}
</style>

<template>
  <div class="w-info-card">
    <div v-if="icon" class="w-info-card__icon">
      <i :class="['ic', `ic_${icon}`]" />
    </div>
    <div class="w-info-card__text">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon?: string
}>()
</script>

<style scoped>
.w-info-card {
  display: flex;
  align-items: flex-start;
  min-height: 82px;
  width: 328px;
  margin: 0 0 24px;
  padding: 16px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.102751);
  gap: 12px;
}

.w-info-card__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.w-info-card__text {
  font-size: 0.75rem;
  color: #2C2A29;
  line-height: 1.4;
}

/* Desktop (>= 768px) */
@media screen and (min-width: 768px) {
  .w-info-card {
    width: 360px;
  }
}
</style>

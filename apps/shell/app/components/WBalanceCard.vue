<script setup lang="ts">
defineProps<{
  icon: string
  title: string
  amount: string | number
  currency?: string
}>()
</script>

<template>
  <div class="balance-card">
    <div class="balance-card__icon">
      <i :class="`ic ic_${icon}`" />
    </div>
    <div class="balance-card__content">
      <span class="balance-card__title">{{ title }}</span>
      <span class="balance-card__amount">
        {{ amount }}
        <span v-if="currency" class="balance-card__currency">{{ currency }}</span>
      </span>
    </div>
  </div>
</template>

<style scoped>
.balance-card {
  background-color: #F2FDF1;
  border: 1px solid #2C2A29;
  border-radius: 16px;
  padding: 24px;
  min-height: 120px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.balance-card__icon {
  background-color: #2A2C29;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.balance-card__icon i {
  color: #DFFF61;
  font-size: 1.5rem;
}

.balance-card__content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.balance-card__title {
  font-size: 0.875rem;
  color: #555555;
}

.balance-card__amount {
  font-size: 1.25rem;
  font-weight: 700;
  color: #252525;
}

.balance-card__currency {
  font-size: 0.875rem;
  font-weight: 400;
  color: #999;
}
</style>

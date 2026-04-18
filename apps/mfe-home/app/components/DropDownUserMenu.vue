<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { MerchantPermission } from '@wompi/types'

const props = defineProps<{
  merchants: MerchantPermission[]
  currentMerchant: MerchantPermission
  textIcon: string
}>()

const isOpen = ref(true)
const arrowUp = ref(false)
const menuRef = ref<HTMLElement | null>(null)

const otherMerchants = computed(() =>
  props.merchants.filter(m => m.id !== props.currentMerchant.id)
)

function toggleMerchants() {
  arrowUp.value = !arrowUp.value
}

function handleClickOutside(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside, true)
})
</script>

<template>
  <div v-if="isOpen" ref="menuRef" class="dropdown-container">
    <div class="user-header">
      <div class="user-icon">
        <span>{{ textIcon }}</span>
      </div>
      <div class="user-info">
        <p class="user-name">{{ currentMerchant.name }}</p>
      </div>
    </div>
    <hr class="divider" />
    <div class="merchants-section">
      <div class="merchants-toggle" @click="toggleMerchants">
        <span>Mis comercios</span>
        <span class="arrow" :class="{ 'arrow-up': arrowUp }">▼</span>
      </div>
      <div v-if="arrowUp" class="merchants-list">
        <div class="merchant-item current">
          <span>{{ currentMerchant.name }}</span>
          <span class="badge">Actual</span>
        </div>
        <div v-for="merchant in otherMerchants" :key="merchant.id" class="merchant-item">
          <span>{{ merchant.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dropdown-container {
  width: 312px;
  background-color: #dfff61;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 10px 16px rgba(0, 0, 0, 0.14);
  position: absolute;
  top: 77px;
  right: 2rem;
  z-index: 100;
}
.user-header {
  display: flex;
  align-items: center;
  gap: 16px;
}
.user-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #2c2a29;
  color: #dfff61;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  border: 2px solid #fff;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.14);
}
.user-name {
  font-size: 14px;
  font-weight: 700;
}
.divider {
  margin: 16px 0;
  border: none;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}
.merchants-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.1s;
}
.merchants-toggle:hover {
  background: #2c2a29;
  color: #dfff61;
}
.arrow {
  transition: transform 0.2s;
}
.arrow-up {
  transform: rotate(180deg);
}
.merchants-list {
  margin-top: 8px;
}
.merchant-item {
  padding: 8px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.merchant-item.current {
  font-weight: 600;
}
.badge {
  font-size: 12px;
  padding: 4px 8px;
  border: 1px solid #2c2a29;
  border-radius: 4px;
}
</style>

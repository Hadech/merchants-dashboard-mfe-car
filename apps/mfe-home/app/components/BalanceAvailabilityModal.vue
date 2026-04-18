<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = defineProps<{
  forceOpen: boolean
  merchantId: string
  payoutsLiteMerchantList: string
  payoutsAvailable: boolean
  region: string
}>()

const emit = defineEmits<{
  close: []
}>()

const STORAGE_KEY = 'balance-availability-modal-shown'
const isOpen = ref(false)

const isEligible = computed(() => {
  if (props.region === 'GT') return false
  if (props.payoutsAvailable) return false
  const ids = props.payoutsLiteMerchantList ? props.payoutsLiteMerchantList.split(',').map(s => s.trim()) : []
  return ids.includes('*') || ids.includes(props.merchantId)
})

onMounted(() => {
  if (isEligible.value && localStorage.getItem(STORAGE_KEY) === null) {
    isOpen.value = true
  }
})

watch(() => props.forceOpen, (val) => {
  if (val && localStorage.getItem(STORAGE_KEY) === null) {
    isOpen.value = true
  }
})

function closeModal() {
  isOpen.value = false
  localStorage.setItem(STORAGE_KEY, 'true')
  emit('close')
}
</script>

<template>
  <div v-if="isEligible && isOpen" class="balance-modal-overlay">
    <div class="balance-modal">
      <div class="balance-modal-content">
        <h5 class="balance-title">Ahora tienes más control sobre tu dinero</h5>
        <p class="balance-description">
          Elige si tu dinero se abona automáticamente a tu cuenta, o si lo mantienes disponible para usarlo según tu necesidad.
        </p>
        <ul class="balance-list">
          <li>💰 Tu dinero en un sólo lugar</li>
          <li>⚡ Usar tu saldo al instante</li>
          <li>🏦 Enviar dinero a cualquier banco</li>
        </ul>
      </div>
      <footer class="balance-footer">
        <button class="balance-btn" @click="closeModal">Entendido</button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.balance-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.balance-modal {
  background: #fff;
  border-radius: 16px;
  max-width: 640px;
  width: 100%;
  overflow: hidden;
}
.balance-modal-content {
  padding: 29px;
}
.balance-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 8px;
}
.balance-description {
  font-size: 14px;
  margin-bottom: 20px;
}
.balance-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.balance-list li {
  display: flex;
  align-items: center;
  gap: 12px;
}
.balance-footer {
  padding: 26px 29px;
}
.balance-btn {
  width: 100%;
  padding: 11px 16px;
  border-radius: 100px;
  border: 1px solid #2c2a29;
  background: #fff;
  cursor: pointer;
  transition: background 0.3s;
}
.balance-btn:hover {
  background: #f5f5f5;
}
</style>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import type { BusinessProcedure } from '@wompi/types'
import { getLastProcedure } from '../utils/businessProceduresHandler'

const TOUR_STORAGE_KEY = 'no-show-onboarding-tour'
const BALANCE_MODAL_KEY = 'balance-availability-modal-shown'

const props = defineProps<{
  businessesProcedures: BusinessProcedure[]
}>()

const emit = defineEmits<{
  tourClosed: []
}>()

const showTour = ref(false)

const isVisible = computed(() => {
  const lastProcedure = getLastProcedure(props.businessesProcedures)
  if (!lastProcedure) return false
  return lastProcedure.status !== 'DECLINED'
})

onMounted(() => {
  const alreadySeen = localStorage.getItem(TOUR_STORAGE_KEY) === 'true'
  if (!alreadySeen && isVisible.value) {
    showTour.value = true
  }
})

function closeTour() {
  showTour.value = false
  localStorage.setItem(TOUR_STORAGE_KEY, 'true')

  const balanceModalSeen = localStorage.getItem(BALANCE_MODAL_KEY) !== null
  if (!balanceModalSeen) {
    emit('tourClosed')
  }
}
</script>

<template>
  <div v-if="showTour && isVisible" class="tour-overlay">
    <div class="tour-modal">
      <button class="tour-close-btn" aria-label="Cerrar" @click="closeTour">✕</button>
      <div class="tour-content">
        <h2 class="tour-title">¡Bienvenido a Wompi!</h2>
        <p class="tour-description">
          Conoce las funcionalidades disponibles en tu dashboard para gestionar tus pagos.
        </p>
        <div class="tour-actions">
          <button class="tour-btn-skip" @click="closeTour">Omitir</button>
          <button class="tour-btn-start" @click="closeTour">Empezar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tour-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 10vh;
  z-index: 1000;
}
.tour-modal {
  background: #fff;
  border-radius: 20px;
  padding: 56px;
  max-width: 46rem;
  width: 100%;
  position: relative;
}
.tour-close-btn {
  position: absolute;
  right: 16px;
  top: 16px;
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tour-content {
  text-align: left;
}
.tour-title {
  font-size: 40px;
  font-weight: 700;
  line-height: 40px;
  margin-bottom: 18px;
}
.tour-description {
  font-size: 16px;
  line-height: 22px;
  margin-bottom: 32px;
}
.tour-actions {
  display: flex;
  gap: 16px;
}
.tour-btn-skip {
  padding: 11px 24px;
  border-radius: 100px;
  border: 1px solid #2c2a29;
  background: #fff;
  cursor: pointer;
}
.tour-btn-start {
  padding: 11px 24px;
  border-radius: 100px;
  border: none;
  background: #2c2a29;
  color: #dfff61;
  cursor: pointer;
}
</style>

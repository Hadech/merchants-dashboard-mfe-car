<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSessionStore } from '../stores/session'

const emit = defineEmits<{
  close: []
  complete: []
}>()

const sessionStore = useSessionStore()
const showMfaButton = ref(false)

onMounted(async () => {
  try {
    const email = sessionStore.userName
    const data = await $fetch<{ prefered: string }>('/merchant-users/user/enabled-mfa-methods', {
      method: 'POST',
      body: { email, type: 'email' },
    })
    showMfaButton.value = data.prefered === 'none'
  } catch {
    showMfaButton.value = true
  }
})

function handleClose() {
  emit('close')
}

function handleEnable() {
  emit('complete')
  emit('close')
}
</script>

<template>
  <div v-if="showMfaButton" class="mfa-modal-overlay">
    <div class="mfa-modal">
      <button class="mfa-close-btn" aria-label="Cerrar" @click="handleClose">✕</button>
      <div class="mfa-content">
        <h4 class="mfa-title">Protege tu ingreso a Wompi con doble verificación</h4>
        <p class="mfa-description">
          Cada vez que ingreses, te pediremos un código temporal (OTP) que llegará a tu correo electrónico.
        </p>
        <div class="mfa-actions">
          <button class="mfa-btn-cancel" @click="handleClose">Cancelar</button>
          <button class="mfa-btn-enable" @click="handleEnable">Habilitar MFA</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mfa-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 10vh;
  z-index: 1000;
}
.mfa-modal {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  max-width: 40rem;
  width: 100%;
  position: relative;
}
.mfa-close-btn {
  position: absolute;
  right: 12px;
  top: 12px;
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
}
.mfa-content {
  text-align: center;
  margin-top: 24px;
}
.mfa-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 12px;
}
.mfa-description {
  font-size: 14px;
  margin-bottom: 24px;
}
.mfa-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}
.mfa-btn-cancel {
  padding: 11px 24px;
  border-radius: 100px;
  border: 1px solid #2c2a29;
  background: #fff;
  cursor: pointer;
}
.mfa-btn-enable {
  padding: 11px 24px;
  border-radius: 100px;
  border: none;
  background: #b0f2ae;
  cursor: pointer;
}
</style>

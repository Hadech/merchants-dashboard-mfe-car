<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-900">Mi cuenta</h1>

    <div class="bg-white rounded-lg border p-6 space-y-5 max-w-2xl">
      <h2 class="text-lg font-semibold text-gray-800">Actualizar información</h2>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <UInput v-model="form.email" type="email" placeholder="tu@email.com" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
        <UInput v-model="form.phone" placeholder="+57 300 123 4567" />
      </div>

      <div class="border-t pt-4">
        <h3 class="text-sm font-semibold text-gray-800 mb-3">Cambiar contraseña</h3>
        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña actual</label>
            <UInput v-model="form.currentPassword" type="password" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
            <UInput v-model="form.newPassword" type="password" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Confirmar nueva contraseña</label>
            <UInput v-model="form.confirmPassword" type="password" />
          </div>
        </div>
      </div>

      <div v-if="error" class="text-sm text-red-600">{{ error }}</div>
      <div v-if="success" class="text-sm text-green-600">{{ success }}</div>

      <UButton color="primary" :loading="saving" @click="handleSave">
        Guardar cambios
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApiClient } from '@wompi/api-client'

const api = useApiClient()

const saving = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

const form = reactive({
  email: '',
  phone: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

async function handleSave() {
  error.value = null
  success.value = null

  if (form.newPassword && form.newPassword !== form.confirmPassword) {
    error.value = 'Las contraseñas no coinciden'
    return
  }

  saving.value = true
  try {
    const body: Record<string, string> = {}
    if (form.email.trim()) body.email = form.email.trim()
    if (form.phone.trim()) body.phone = form.phone.trim()
    if (form.newPassword) {
      body.current_password = form.currentPassword
      body.new_password = form.newPassword
    }

    await api('/users/me', { method: 'PATCH', body })
    success.value = 'Información actualizada correctamente'
    form.currentPassword = ''
    form.newPassword = ''
    form.confirmPassword = ''
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Error al actualizar información'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    const data = await api('/users/me')
    const user = data.data || {}
    form.email = user.email || ''
    form.phone = user.phone || ''
  } catch {
    // Silently fail, user can still fill in the form
  }
})
</script>

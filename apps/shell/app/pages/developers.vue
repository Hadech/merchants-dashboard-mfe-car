<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-900">Developers</h1>

    <!-- Integration Info -->
    <div class="bg-white rounded-lg border p-6 space-y-4">
      <h2 class="text-lg font-semibold text-gray-800">Información de integración</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">API Base URL (Producción)</label>
          <div class="flex items-center gap-2 bg-gray-50 rounded border p-3">
            <code class="text-sm text-gray-900 flex-1">https://production.wompi.co/v1</code>
            <WCopyButton text="https://production.wompi.co/v1" label="Copiar" />
          </div>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">API Base URL (Sandbox)</label>
          <div class="flex items-center gap-2 bg-gray-50 rounded border p-3">
            <code class="text-sm text-gray-900 flex-1">https://sandbox.wompi.co/v1</code>
            <WCopyButton text="https://sandbox.wompi.co/v1" label="Copiar" />
          </div>
        </div>
      </div>

      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1">Documentación API</label>
        <a
          href="https://docs.wompi.co"
          target="_blank"
          class="text-sm text-pink-600 hover:text-pink-700 underline"
        >
          https://docs.wompi.co
        </a>
      </div>
    </div>

    <!-- Webhooks -->
    <div class="bg-white rounded-lg border p-6 space-y-4">
      <h2 class="text-lg font-semibold text-gray-800">Configuración de Webhooks</h2>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">URL del webhook</label>
        <UInput v-model="webhookUrl" placeholder="https://tu-servidor.com/webhooks/wompi" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Eventos</label>
        <div class="space-y-2 mt-2">
          <label
            v-for="event in webhookEvents"
            :key="event.value"
            class="flex items-center gap-2 text-sm text-gray-600"
          >
            <input
              type="checkbox"
              :value="event.value"
              v-model="selectedEvents"
              class="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
            />
            {{ event.label }}
          </label>
        </div>
      </div>

      <div v-if="error" class="text-sm text-red-600">{{ error }}</div>
      <div v-if="success" class="text-sm text-green-600">{{ success }}</div>

      <UButton color="primary" :loading="saving" @click="handleSaveWebhook">
        Guardar configuración
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { WCopyButton } from '@wompi/ui'
import { useApiClient } from '@wompi/api-client'

const api = useApiClient()

const webhookUrl = ref('')
const selectedEvents = ref<string[]>([])
const saving = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

const webhookEvents = [
  { value: 'transaction.updated', label: 'Transacción actualizada' },
  { value: 'nequi_token.updated', label: 'Token Nequi actualizado' },
  { value: 'payout.updated', label: 'Dispersión actualizada' },
  { value: 'bancolombia_transfer.updated', label: 'Transferencia Bancolombia actualizada' },
]

async function handleSaveWebhook() {
  saving.value = true
  error.value = null
  success.value = null
  try {
    await api('/merchants/webhooks', {
      method: 'PUT',
      body: {
        url: webhookUrl.value.trim(),
        events: selectedEvents.value,
      },
    })
    success.value = 'Webhook configurado correctamente'
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Error al guardar webhook'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    const data = await api('/merchants/webhooks')
    const webhook = data.data || {}
    webhookUrl.value = webhook.url || ''
    selectedEvents.value = webhook.events || []
  } catch {
    // Silently fail, user can configure from scratch
  }
})
</script>

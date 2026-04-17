<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <UButton
        icon="i-heroicons-arrow-left"
        variant="ghost"
        color="neutral"
        @click="router.push('/payment-links')"
      />
      <h1 class="text-2xl font-bold text-gray-900">Crear link de pago</h1>
    </div>

    <!-- Created Link Result -->
    <div v-if="createdLink" class="bg-green-50 border border-green-200 rounded-lg p-6 space-y-4">
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-check-circle" class="h-6 w-6 text-green-600" />
        <h2 class="text-lg font-semibold text-green-800">Link creado exitosamente</h2>
      </div>
      <div class="bg-white rounded border p-4">
        <p class="text-xs font-medium text-gray-500 mb-1">URL del link de pago</p>
        <div class="flex items-center gap-2">
          <code class="text-sm text-gray-900 break-all flex-1">{{ createdLink.url }}</code>
          <WCopyButton :text="createdLink.url" label="Copiar" />
        </div>
      </div>
      <div class="flex gap-3">
        <UButton color="primary" @click="resetForm">Crear otro</UButton>
        <UButton variant="soft" color="neutral" @click="router.push('/payment-links')">
          Volver a la lista
        </UButton>
      </div>
    </div>

    <!-- Creation Form -->
    <div v-else class="bg-white rounded-lg border p-6 space-y-5 max-w-2xl">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
        <UInput v-model="form.name" placeholder="Ej: Pago mensualidad" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <UTextarea v-model="form.description" placeholder="Descripción del cobro" :rows="2" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Monto (en pesos) *</label>
          <UInput v-model.number="form.amount" type="number" placeholder="50000" :min="1" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
          <USelect v-model="form.currency" :items="currencyOptions" />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de expiración</label>
        <UInput v-model="form.expires_at" type="datetime-local" />
      </div>

      <div v-if="error" class="text-sm text-red-600">{{ error }}</div>

      <UButton
        color="primary"
        :loading="submitting"
        :disabled="!isValid"
        @click="handleSubmit"
      >
        Crear link de pago
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { WCopyButton } from '@wompi/ui'
import { usePaymentLinksApi } from '~/composables/usePaymentLinksApi'
import type { PaymentLink } from '@wompi/types'

const router = useRouter()
const { createPaymentLink } = usePaymentLinksApi()

const form = reactive({
  name: '',
  description: '',
  amount: null as number | null,
  currency: 'COP',
  expires_at: '',
})

const currencyOptions = ['COP', 'USD']

const submitting = ref(false)
const error = ref<string | null>(null)
const createdLink = ref<PaymentLink | null>(null)

const isValid = computed(() => form.name.trim() !== '' && form.amount && form.amount > 0)

async function handleSubmit() {
  submitting.value = true
  error.value = null
  try {
    const response = await createPaymentLink({
      name: form.name.trim(),
      description: form.description.trim(),
      amount_in_cents: (form.amount || 0) * 100,
      currency: form.currency,
      expires_at: form.expires_at || null,
    })
    createdLink.value = response.data
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Error al crear el link de pago'
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  form.name = ''
  form.description = ''
  form.amount = null
  form.currency = 'COP'
  form.expires_at = ''
  createdLink.value = null
  error.value = null
}
</script>

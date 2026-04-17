<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-900">Crear pago</h1>

    <!-- Success confirmation -->
    <div v-if="store.lastPayoutId" class="bg-green-50 border border-green-200 rounded-lg p-6 space-y-4">
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-check-circle" class="h-6 w-6 text-green-600" />
        <h2 class="text-lg font-semibold text-green-800">Pago creado exitosamente</h2>
      </div>
      <div class="bg-white rounded border p-4">
        <p class="text-xs font-medium text-gray-500 mb-1">ID de transacción</p>
        <div class="flex items-center gap-2">
          <code class="text-sm text-gray-900 break-all flex-1">{{ store.lastPayoutId }}</code>
          <WCopyButton :text="store.lastPayoutId" label="Copiar" />
        </div>
      </div>
      <div v-if="requiresApproval" class="bg-yellow-50 border border-yellow-200 rounded p-3">
        <p class="text-sm text-yellow-800">
          <UIcon name="i-heroicons-exclamation-triangle" class="inline h-4 w-4 mr-1" />
          Este pago requiere aprobación antes de ser procesado.
        </p>
      </div>
      <div class="flex gap-3">
        <UButton color="primary" @click="resetForm">Crear otro pago</UButton>
        <UButton variant="soft" color="neutral" @click="navigateTo('/payouts/transactions')">
          Ver transacciones
        </UButton>
      </div>
    </div>

    <!-- Payment Form -->
    <div v-else class="bg-white rounded-lg border p-6 space-y-5 max-w-2xl">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de destinatario</label>
        <USelect v-model="form.destinationType" :items="destinationTypes" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Banco *</label>
          <UInput v-model="form.bankName" placeholder="Ej: Bancolombia" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de cuenta *</label>
          <USelect v-model="form.accountType" :items="accountTypes" />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Número de cuenta *</label>
        <UInput v-model="form.accountNumber" placeholder="Ej: 12345678901" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Monto (en pesos) *</label>
          <UInput v-model.number="form.amount" type="number" placeholder="50000" :min="1" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de pago</label>
          <USelect v-model="form.paymentType" :items="paymentTypes" />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Concepto *</label>
        <UInput v-model="form.concept" placeholder="Ej: Pago proveedor marzo" />
      </div>

      <div v-if="store.error" class="text-sm text-red-600">{{ store.error }}</div>

      <UButton
        color="primary"
        :loading="store.loading"
        :disabled="!isValid"
        @click="handleSubmit"
      >
        Crear pago
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { WCopyButton } from '@wompi/ui'
import { usePaymentsStore } from '~/stores/payments'
import type { CreatePayoutRequest } from '@wompi/types'

const store = usePaymentsStore()

const requiresApproval = ref(false)

const destinationTypes = ['Cuenta bancaria', 'Favorito']
const accountTypes = ['Ahorros', 'Corriente']
const paymentTypes = ['Pago a proveedor', 'Nómina', 'Reembolso', 'Otro']

const form = reactive({
  destinationType: 'Cuenta bancaria',
  bankName: '',
  accountType: 'Ahorros',
  accountNumber: '',
  amount: null as number | null,
  paymentType: 'Pago a proveedor',
  concept: '',
})

const isValid = computed(() =>
  form.bankName.trim() !== '' &&
  form.accountNumber.trim() !== '' &&
  form.amount !== null && form.amount > 0 &&
  form.concept.trim() !== ''
)

async function handleSubmit() {
  const payload: CreatePayoutRequest = {
    amount_in_cents: (form.amount || 0) * 100,
    destination: {
      type: form.destinationType === 'Favorito' ? 'FAVORITE' : 'BANK_ACCOUNT',
      bank_name: form.bankName.trim(),
      account_number: form.accountNumber.trim(),
      account_type: form.accountType,
    },
    concept: form.concept.trim(),
    payment_type: form.paymentType,
  }

  const result = await store.submitPayout(payload)
  if (result && store.lastPayoutId) {
    // Simulate approval requirement based on amount threshold
    requiresApproval.value = (form.amount || 0) >= 5000000
  }
}

function resetForm() {
  form.bankName = ''
  form.accountNumber = ''
  form.amount = null
  form.concept = ''
  form.destinationType = 'Cuenta bancaria'
  form.accountType = 'Ahorros'
  form.paymentType = 'Pago a proveedor'
  store.lastPayoutId = null
  store.error = null
  requiresApproval.value = false
}
</script>

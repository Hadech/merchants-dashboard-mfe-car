<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-900">Reportes de Payouts</h1>

    <div class="bg-white rounded-lg border p-6 space-y-5 max-w-2xl">
      <WFilterPanel
        :filters="filters"
        :schema="filterSchema"
        @update:filters="handleFiltersUpdate"
        @apply="() => {}"
        @reset="handleReset"
      />

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Formato</label>
        <USelect v-model="format" :items="formatOptions" />
      </div>

      <UButton
        color="primary"
        icon="i-heroicons-arrow-down-tray"
        :loading="downloading"
        @click="handleDownload"
      >
        Descargar reporte
      </UButton>

      <div v-if="downloadSuccess" class="text-sm text-green-600 flex items-center gap-1">
        <UIcon name="i-heroicons-check-circle" class="h-4 w-4" />
        Reporte descargado exitosamente
      </div>

      <div v-if="error" class="text-sm text-red-600">{{ error }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { WFilterPanel } from '@wompi/ui'
import { useApiClient } from '@wompi/api-client'

const api = useApiClient()

const downloading = ref(false)
const downloadSuccess = ref(false)
const error = ref<string | null>(null)
const format = ref('CSV')
const formatOptions = ['CSV', 'Excel']

const filters = reactive({
  status: '',
  date_from: '',
  date_to: '',
})

const filterSchema = [
  {
    key: 'status',
    label: 'Estado',
    type: 'select' as const,
    options: ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'],
  },
  { key: 'date_from', label: 'Fecha desde', type: 'text' as const },
  { key: 'date_to', label: 'Fecha hasta', type: 'text' as const },
]

function handleFiltersUpdate(updated: Record<string, unknown>) {
  Object.assign(filters, updated)
}

function handleReset() {
  filters.status = ''
  filters.date_from = ''
  filters.date_to = ''
}

async function handleDownload() {
  downloading.value = true
  downloadSuccess.value = false
  error.value = null
  try {
    const query: Record<string, string> = { format: format.value.toLowerCase() }
    for (const [k, v] of Object.entries(filters)) {
      if (String(v).trim()) query[k] = String(v).trim()
    }
    await api('/payouts/transactions/report', { query, responseType: 'blob' })
    downloadSuccess.value = true
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Error al descargar reporte'
  } finally {
    downloading.value = false
  }
}
</script>

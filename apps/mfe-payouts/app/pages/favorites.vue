<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Destinatarios favoritos</h1>
      <UButton color="primary" icon="i-heroicons-plus" @click="showForm = true">
        Agregar favorito
      </UButton>
    </div>

    <!-- Add/Edit Form -->
    <div v-if="showForm" class="bg-white rounded-lg border p-6 space-y-4 max-w-lg">
      <h2 class="text-lg font-semibold text-gray-800">
        {{ editingId ? 'Editar favorito' : 'Nuevo favorito' }}
      </h2>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
        <UInput v-model="form.name" placeholder="Ej: Proveedor ABC" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Banco *</label>
        <UInput v-model="form.bankName" placeholder="Ej: Bancolombia" />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Número de cuenta *</label>
          <UInput v-model="form.accountNumber" placeholder="12345678901" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de cuenta</label>
          <USelect v-model="form.accountType" :items="['Ahorros', 'Corriente']" />
        </div>
      </div>
      <div class="flex gap-2">
        <UButton color="primary" :disabled="!isFormValid" @click="handleSave">
          {{ editingId ? 'Guardar cambios' : 'Agregar' }}
        </UButton>
        <UButton variant="soft" color="neutral" @click="cancelForm">Cancelar</UButton>
      </div>
    </div>

    <!-- Favorites List -->
    <WDataTable
      :columns="columns"
      :rows="tableRows"
      :loading="loading"
      :total="favorites.length"
      :page="page"
      :per-page="perPage"
      @update:page="page = $event"
      @update:per-page="perPage = $event"
    >
      <template #cell-actions="{ row }">
        <div class="flex gap-2">
          <UButton size="xs" variant="soft" @click="handleEdit(row)">Editar</UButton>
          <UButton size="xs" color="error" variant="soft" @click="handleDelete(row.id)">
            Eliminar
          </UButton>
        </div>
      </template>
    </WDataTable>

    <div v-if="!loading && favorites.length === 0 && !showForm" class="text-center py-12">
      <UIcon name="i-heroicons-star" class="h-12 w-12 text-gray-300 mx-auto mb-3" />
      <p class="text-gray-500">No tienes destinatarios favoritos</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { WDataTable } from '@wompi/ui'
import { useApiClient } from '@wompi/api-client'

interface Favorite {
  id: string
  name: string
  bank_name: string
  account_number: string
  account_type: string
}

const api = useApiClient()

const page = ref(1)
const perPage = ref(20)
const loading = ref(false)
const favorites = ref<Favorite[]>([])
const showForm = ref(false)
const editingId = ref<string | null>(null)

const form = reactive({
  name: '',
  bankName: '',
  accountNumber: '',
  accountType: 'Ahorros',
})

const isFormValid = computed(() =>
  form.name.trim() !== '' &&
  form.bankName.trim() !== '' &&
  form.accountNumber.trim() !== ''
)

const columns = [
  { key: 'name', label: 'Nombre' },
  { key: 'bank_name', label: 'Banco' },
  { key: 'account_number', label: 'Cuenta' },
  { key: 'account_type', label: 'Tipo' },
  { key: 'actions', label: 'Acciones' },
]

const tableRows = computed(() => favorites.value.map((f) => ({ ...f })))

async function fetchFavorites() {
  loading.value = true
  try {
    const data = await api<{ data: Favorite[] }>('/payouts/favorites')
    favorites.value = data.data || []
  } catch {
    favorites.value = []
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  const body = {
    name: form.name.trim(),
    bank_name: form.bankName.trim(),
    account_number: form.accountNumber.trim(),
    account_type: form.accountType,
  }
  try {
    if (editingId.value) {
      await api(`/payouts/favorites/${editingId.value}`, { method: 'PUT', body })
    } else {
      await api('/payouts/favorites', { method: 'POST', body })
    }
    cancelForm()
    await fetchFavorites()
  } catch {
    // Error handled silently for hackathon
  }
}

function handleEdit(fav: Favorite) {
  editingId.value = fav.id
  form.name = fav.name
  form.bankName = fav.bank_name
  form.accountNumber = fav.account_number
  form.accountType = fav.account_type
  showForm.value = true
}

async function handleDelete(id: string) {
  try {
    await api(`/payouts/favorites/${id}`, { method: 'DELETE' })
    await fetchFavorites()
  } catch {
    // Error handled silently for hackathon
  }
}

function cancelForm() {
  showForm.value = false
  editingId.value = null
  form.name = ''
  form.bankName = ''
  form.accountNumber = ''
  form.accountType = 'Ahorros'
}

onMounted(fetchFavorites)
</script>

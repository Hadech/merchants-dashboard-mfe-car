<template>
  <div class="favorites-page">
    <!-- View Title Bar -->
    <div class="view-title-bar">
      <div class="view-title-bar__container">
        <span class="view-title-bar__text">Pagos a terceros</span>
      </div>
    </div>

    <!-- Content -->
    <div class="favorites-content">
      <div class="section-header">
        <h2 class="section-title">Destinatarios favoritos</h2>
        <UButton
          color="primary"
          icon="i-heroicons-plus"
          class="add-btn"
          @click="showForm = true"
        >
          Agregar favorito
        </UButton>
      </div>

      <!-- Add/Edit Form -->
      <div v-if="showForm" class="form-card">
        <h3 class="form-card__title">
          {{ editingId ? 'Editar favorito' : 'Nuevo favorito' }}
        </h3>

        <div class="form-group">
          <label class="form-label">Nombre *</label>
          <UInput v-model="form.name" placeholder="Ej: Proveedor ABC" class="form-input" />
        </div>

        <div class="form-group">
          <label class="form-label">Banco *</label>
          <UInput v-model="form.bankName" placeholder="Ej: Bancolombia" class="form-input" />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Número de cuenta *</label>
            <UInput v-model="form.accountNumber" placeholder="12345678901" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Tipo de cuenta</label>
            <USelect v-model="form.accountType" :items="['Ahorros', 'Corriente']" class="form-input" />
          </div>
        </div>

        <div class="form-actions">
          <UButton color="primary" class="action-btn" :disabled="!isFormValid" @click="handleSave">
            {{ editingId ? 'Guardar cambios' : 'Agregar' }}
          </UButton>
          <UButton variant="outline" color="neutral" class="action-btn" @click="cancelForm">
            Cancelar
          </UButton>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin text-xl text-gray-400" />
        <span>Cargando favoritos...</span>
      </div>

      <!-- Favorites list -->
      <template v-else-if="favorites.length > 0">
        <div class="favorites-list">
          <div
            v-for="fav in favorites"
            :key="fav.id"
            class="favorite-item"
          >
            <div class="favorite-item__icon">
              <UIcon name="i-heroicons-star-solid" class="star-icon" />
            </div>
            <div class="favorite-item__info">
              <span class="favorite-item__name">{{ fav.name }}</span>
              <span class="favorite-item__bank">{{ fav.bank_name }}</span>
              <span class="favorite-item__account">
                {{ fav.account_type === 'Corriente' ? 'Corriente' : 'Ahorros' }}
                &nbsp;{{ fav.account_number }}
              </span>
            </div>
            <div class="favorite-item__actions">
              <UButton size="xs" variant="outline" color="neutral" @click="handleEdit(fav)">
                Editar
              </UButton>
              <UButton size="xs" variant="outline" color="error" @click="handleDelete(fav.id)">
                Eliminar
              </UButton>
            </div>
          </div>
        </div>
      </template>

      <!-- Empty state -->
      <div v-else-if="!loading && !showForm" class="empty-state">
        <UIcon name="i-heroicons-star" class="empty-icon" />
        <p>No tienes destinatarios favoritos</p>
        <p class="empty-hint">Agrega un favorito para agilizar tus pagos.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApiClient } from '@wompi/api-client'

interface Favorite {
  id: string
  name: string
  bank_name: string
  account_number: string
  account_type: string
}

const api = useApiClient()

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
    // silent
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
    // silent
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

<style scoped>
/* View Title Bar */
.view-title-bar {
  background: #2C2A29;
  color: #fff;
}

.view-title-bar__container {
  max-width: 74.25rem;
  margin: 0 auto;
  height: 100px;
  display: flex;
  align-items: center;
  padding: 0 1.5rem;
}

.view-title-bar__text {
  font-size: 1.6rem;
}

/* Content */
.favorites-content {
  max-width: 74.25rem;
  margin: 0 auto;
  padding: 1.5rem;
}

/* Section header */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 12px;
}

.section-title {
  font-size: 28px;
  font-weight: 700;
  color: #2C2A29;
}

.add-btn {
  border-radius: 2rem;
  font-weight: 600;
}

/* Form card */
.form-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  padding: 32px;
  max-width: 640px;
  box-shadow: 0px 1px 8px 0px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
}

.form-card__title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #2C2A29;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #2C2A29;
}

.form-input {
  width: 100%;
}

.form-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  border-radius: 2rem;
  font-weight: 600;
}

/* Favorites list — card style */
.favorites-list {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  box-shadow: 0px 1px 8px 0px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.favorite-item {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  gap: 16px;
  transition: background 0.2s ease-out;
}

.favorite-item:hover {
  background: #f9f9f9;
}

.favorite-item:not(:last-child) {
  border-bottom: 1px solid #f0f0f0;
}

.favorite-item__icon {
  background: #2C2A29;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.star-icon {
  color: #DFFF61;
  font-size: 1.125rem;
}

.favorite-item__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.favorite-item__name {
  font-size: 1rem;
  font-weight: 700;
  color: #2C2A29;
}

.favorite-item__bank {
  font-size: 0.875rem;
  color: #555;
}

.favorite-item__account {
  font-size: 0.8125rem;
  color: #888;
}

.favorite-item__actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* Loading */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 4rem 0;
  color: #999;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 4rem 0;
  color: #888;
}

.empty-icon {
  font-size: 3rem;
  color: #ddd;
  margin-bottom: 0.5rem;
}

.empty-hint {
  font-size: 0.875rem;
  color: #aaa;
}

/* Responsive */
@media screen and (max-width: 48rem) {
  .view-title-bar__text {
    font-size: 1.3rem;
  }

  .view-title-bar__container {
    justify-content: center;
  }

  .section-title {
    font-size: 22px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-card {
    padding: 20px;
  }

  .favorite-item {
    flex-wrap: wrap;
    padding: 16px;
  }

  .favorite-item__actions {
    width: 100%;
    justify-content: flex-end;
    margin-top: 8px;
  }
}
</style>

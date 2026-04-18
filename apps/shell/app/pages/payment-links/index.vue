<template>
  <div class="payment-links-page">
    <!-- View Title Bar -->
    <div class="view-title-bar">
      <div class="view-title-bar__container">
        <span class="view-title-bar__text">Recibir pagos: Link de pago personalizado</span>
      </div>
    </div>

    <!-- Content -->
    <div class="payment-links-content">
      <!-- Create button -->
      <div class="create-btn-row">
        <button class="create-link-btn" @click="navigateTo('/payment-links/create')">
          <UIcon name="i-heroicons-shopping-bag" class="create-link-btn__icon" />
          Crear link de pago
        </button>
      </div>

      <!-- Links Box -->
      <div class="links-box" v-loading="loading">
        <!-- Tabs: Activos / Inactivos -->
        <div class="links-box__tabs">
          <div
            class="links-box__tab"
            :class="{ active: activeTab === 'active' }"
            @click="changeTab('active')"
          >
            <span>Activos</span>
          </div>
          <div
            class="links-box__tab"
            :class="{ active: activeTab === 'inactive' }"
            @click="changeTab('inactive')"
          >
            <span>Inactivos</span>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="loading-state">
          <UIcon name="i-heroicons-arrow-path" class="animate-spin text-xl text-gray-400" />
          <span>Cargando links de pago...</span>
        </div>

        <!-- Links list -->
        <template v-else-if="links.length > 0">
          <div
            v-for="item in links"
            :key="item.id"
            class="links-box__item"
            @click="navigateTo(`/payment-links/${item.id}`)"
          >
            <div
              class="links-box__item__img"
              :style="{ backgroundImage: item.image_url ? `url('${item.image_url}')` : 'none' }"
            />
            <div class="links-box__item__info">
              <div class="__title">{{ item.name }}</div>
              <div class="__value">{{ item.currency || 'COP' }} {{ formatPrice(item.amount_in_cents) }}</div>
              <div class="__description">{{ cropText(item.description || '') }}</div>
            </div>
            <div class="links-box__item__arrow">
              <UIcon name="i-heroicons-chevron-right" class="arrow-icon" />
            </div>
          </div>
        </template>

        <!-- Empty state -->
        <div v-else-if="hasFetched" class="empty-state">
          <div class="empty-state__content">
            <strong>No tienes ningún link creado aún</strong>
            <p>
              <a class="underlined" @click="navigateTo('/payment-links/create')">Haz click aquí</a>
              para crear un nuevo link de pago.
            </p>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalResults > 0" class="pagination-container">
        <UPagination
          v-model="currentPage"
          :total="totalResults"
          :items-per-page="pageSize"
          @update:model-value="onPageChanged"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePaymentLinksApi } from '~/composables/usePaymentLinksApi'

const { getPaymentLinks } = usePaymentLinksApi()

const loading = ref(false)
const hasFetched = ref(false)
const links = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(25)
const totalResults = ref(0)
const activeTab = ref<'active' | 'inactive'>('active')

function changeTab(tab: 'active' | 'inactive') {
  if (activeTab.value === tab) return
  activeTab.value = tab
  currentPage.value = 1
  fetchLinks()
}

async function fetchLinks() {
  loading.value = true
  try {
    const response = await getPaymentLinks({
      page: currentPage.value,
      page_size: pageSize.value,
      active: activeTab.value === 'active',
      order_by: 'created_at',
      order: 'DESC',
    })
    links.value = response.data ?? []
    totalResults.value = response.meta?.total_results ?? 0
    pageSize.value = response.meta?.page_size ?? 25
  } catch {
    links.value = []
    totalResults.value = 0
  } finally {
    loading.value = false
    hasFetched.value = true
  }
}

function onPageChanged(page: number) {
  currentPage.value = page
  fetchLinks()
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0 }).format(cents / 100)
}

function cropText(text: string) {
  const cropTo = 101
  if (text.length <= cropTo) return text
  return text.slice(0, cropTo) + '...'
}

onMounted(() => fetchLinks())
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
.payment-links-content {
  max-width: 74.25rem;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Create button row */
.create-btn-row {
  text-align: left;
  margin: 1rem 0;
}

.create-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: #2C2A29;
  color: #DFFF61;
  border: none;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 2rem;
  padding: 0.7em 1.5em;
  cursor: pointer;
  transition: opacity 0.2s;
}

.create-link-btn:hover {
  opacity: 0.9;
}

.create-link-btn__icon {
  font-size: 1.2em;
  transform: scale(1.3);
}

/* Links Box — replica legacy */
.links-box {
  position: relative;
  margin-top: 2.5rem;
  background: white;
  border: solid 1px #e0e0e0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  width: 100%;
  border-radius: 3px;
}

/* Tabs */
.links-box__tabs {
  position: absolute;
  top: -2.5rem;
  left: -1px;
  display: flex;
}

.links-box__tab {
  position: relative;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 6rem;
  height: 2.5rem;
  color: #888;
  background: white;
  border: solid 1px #e0e0e0;
  transition: background-color 250ms ease-in-out;
  font-size: 0.875rem;
}

.links-box__tab:hover {
  background-color: #f9f9f9;
}

.links-box__tab.active {
  border-bottom: 1px solid white;
  color: #2C2A29;
}

.links-box__tab.active:hover {
  background-color: #fafafa;
}

/* Link items — card style like legacy */
.links-box__item {
  position: relative;
  cursor: pointer;
  padding: 0.9375rem 1.0625rem;
  display: flex;
  align-items: center;
  transition: background 0.2s ease-out;
}

.links-box__item:hover {
  background: #f9f9f9;
}

.links-box__item:not(:last-child) {
  border-bottom: solid 1px #e0e0e0;
}

/* Image thumbnail */
.links-box__item__img {
  display: inline-block;
  width: 20%;
  max-width: 9.375rem;
  min-width: 5rem;
  height: 7.0625rem;
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-right: 5%;
  flex-shrink: 0;
}

/* Info section */
.links-box__item__info {
  display: inline-block;
  vertical-align: top;
  width: 60%;
  flex: 1;
}

.links-box__item__info .__title {
  font-size: 1rem;
  font-weight: 600;
  color: #2C2A29;
  margin-bottom: 0.3125rem;
}

.links-box__item__info .__value {
  font-size: 1.375rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.links-box__item__info .__description {
  font-size: 0.875rem;
  color: #555;
  margin-bottom: 0.3125rem;
}

/* Arrow */
.links-box__item__arrow {
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
}

.arrow-icon {
  font-size: 1.875rem;
  color: #00C389;
}

/* Loading */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 3rem 0;
  color: #999;
}

/* Empty state */
.empty-state {
  padding: 2rem 1rem;
  text-align: center;
}

.empty-state__content {
  color: #666;
}

.empty-state__content strong {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.underlined {
  text-decoration: underline;
  cursor: pointer;
  color: #2C2A29;
  font-weight: 600;
}

.underlined:hover {
  color: #00C389;
}

/* Pagination */
.pagination-container {
  margin-top: 1.8125rem;
  display: flex;
  justify-content: center;
}

/* Responsive */
@media screen and (max-width: 48rem) {
  .view-title-bar__text {
    font-size: 1.3rem;
  }

  .view-title-bar__container {
    justify-content: center;
  }

  .links-box__item__img {
    height: 3.5rem;
    margin-right: 0.5rem;
  }

  .links-box__item__info .__value {
    font-size: 1.2rem;
    margin-bottom: 0;
  }

  .links-box__item__info .__description {
    display: none;
  }

  .links-box__item__arrow {
    right: 0.5rem;
  }

  .pagination-container {
    margin-top: 0.875rem;
  }
}

@media screen and (max-width: 23.125rem) {
  .links-box__item {
    padding: 0.9375rem 0.5rem;
    font-size: 0.8125rem;
  }
}
</style>

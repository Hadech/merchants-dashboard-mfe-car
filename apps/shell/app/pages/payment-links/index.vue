<template>
  <div class="payment-links">
    <!-- View Title Bar -->
    <div class="view-title-bar">
      <div class="view-title-bar__container">
        <span class="view-title-bar__text">Recibir pagos: Link de pago personalizado</span>
      </div>
    </div>

    <div class="view-content container">
      <!-- Create button -->
      <div class="ta-left mb2">
        <button class="view-cta" @click="navigateTo('/payment-links/create')">
          <span class="ic ic_shopping-basket-add cta-icon"></span>
          Crear link de pago
        </button>
      </div>

      <!-- Links Box -->
      <div class="box-wrapper">
        <div class="payment-links__box">
          <!-- Tabs -->
          <div class="payment-links__box__tabs">
            <div
              class="__tab"
              :class="{ active: activeTab === 'active' }"
              @click="changeTab('active')"
            >
              <span>Activos</span>
            </div>
            <div
              class="__tab"
              :class="{ active: activeTab === 'inactive' }"
              @click="changeTab('inactive')"
            >
              <span>Inactivos</span>
            </div>
          </div>

          <!-- Loading -->
          <div v-if="loading" class="loading-payment-links">
            <div class="loading-spinner"></div>
            <span>Cargando links de pago...</span>
          </div>

          <!-- Items -->
          <template v-else-if="links.length > 0">
            <div
              v-for="item in links"
              :key="item.id"
              class="payment-links__box__item"
              @click="navigateTo(`/payment-links/${item.id}`)"
            >
              <div
                class="payment-links__box__item__img"
                :style="item.image_url ? { backgroundImage: `url('${item.image_url}')` } : {}"
              ></div>
              <div class="payment-links__box__item__info">
                <div class="__title">{{ item.name }}</div>
                <div class="__value">{{ item.currency || 'COP' }} {{ formatPrice(item.amount_in_cents) }}</div>
                <div class="__description">{{ cropText(item.description || '') }}</div>
              </div>
              <div class="payment-links__box__item__arrow">
                <span class="ic ic_angle-right arrow-icon"></span>
              </div>
            </div>
          </template>

          <!-- Empty -->
          <template v-else-if="hasFetched">
            <!-- empty box, alert below -->
          </template>
        </div>

        <!-- Empty alert -->
        <div v-if="hasFetched && links.length === 0 && !loading" class="way-alert">
          <div class="way-alert__content">
            <strong>No tienes ningún link creado aún</strong>
            <p>
              <a class="underlined" @click="navigateTo('/payment-links/create')">Haz click aquí</a>
              para crear un nuevo link de pago.
            </p>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalResults > pageSize" class="pagination-container">
          <button class="page-btn" :disabled="currentPage <= 1" @click="onPageChanged(currentPage - 1)">‹</button>
          <span class="page-info">Página {{ currentPage }} de {{ Math.ceil(totalResults / pageSize) }}</span>
          <button class="page-btn" :disabled="currentPage >= Math.ceil(totalResults / pageSize)" @click="onPageChanged(currentPage + 1)">›</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { createApiClient } from '@wompi/api-client'
import { useAuth } from '@wompi/auth'

const { refreshSession } = useAuth()

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
    const api = createApiClient({ useAuth: true, refreshSession })
    const response = await api<{ data: any[]; meta: { total_results: number; page_size: number } }>(
      '/payment_links',
      {
        query: {
          page: currentPage.value,
          page_size: pageSize.value,
          active: activeTab.value === 'active',
          order_by: 'created_at',
          order: 'DESC',
        },
      },
    )
    links.value = response?.data ?? []
    totalResults.value = response?.meta?.total_results ?? 0
    pageSize.value = response?.meta?.page_size ?? 25
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
  if (text.length <= 101) return text
  return text.slice(0, 101) + '...'
}

onMounted(() => fetchLinks())
</script>

<style scoped>
/* === View Title Bar === */
.view-title-bar { background: #2C2A29; color: #fff; }
.view-title-bar__container { max-width: 74.25rem; margin: 0 auto; height: 100px; display: flex; align-items: center; padding: 0 1.5rem; }
.view-title-bar__text { font-size: 1.6rem; font-weight: 400; }

/* === Content === */
.view-content.container { max-width: 74.25rem; margin: 0 auto; padding: 0 1.5rem; }

/* === Create button — matches legacy el-button--primary pill === */
.ta-left { text-align: left; }
.mb2 { margin: 1rem 0; }
.view-cta {
  display: inline-flex; align-items: center; gap: 0.3rem;
  background: #2C2A29; color: #DFFF61; border: none;
  font-size: 1.1rem; font-weight: 600; border-radius: 2rem;
  padding: 0.8em 1.5em; cursor: pointer; transition: opacity 0.2s;
  font-family: "Open Sans", "Source Sans Pro", sans-serif;
}
.view-cta:hover { opacity: 0.9; }
.cta-icon { font-size: 1.2em; transform: scale(1.5); margin-right: 0.3rem; }

/* === Box wrapper === */
.box-wrapper { margin-top: 1rem; }

/* === Links Box — exact replica of legacy === */
.payment-links__box {
  position: relative; margin-top: 2.5rem;
  background: #fff; border: solid 1px #e0e0e0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08); width: 100%; border-radius: 3px;
}

/* === Tabs — positioned above the box === */
.payment-links__box__tabs {
  position: absolute; top: -2.5rem; left: -1px; display: flex;
}
.__tab {
  position: relative; cursor: pointer; display: inline-flex;
  align-items: center; justify-content: center;
  width: 6rem; height: 2.5rem; color: #888;
  background: #fff; border: solid 1px #e0e0e0;
  transition: background-color 250ms ease-in-out; font-size: 0.875rem;
}
.__tab:hover { background-color: #f9f9f9; }
.__tab.active { border-bottom: 1px solid #fff; color: #2C2A29; }
.__tab.active:hover { background-color: #fafafa; }

/* === Link items — card style === */
.payment-links__box__item {
  position: relative; cursor: pointer;
  padding: 0.9375rem 1.0625rem; display: flex; align-items: center;
  transition: background 0.2s ease-out;
}
.payment-links__box__item:hover { background: #f9f9f9; }
.payment-links__box__item:not(:last-child) { border-bottom: solid 1px #e0e0e0; }

/* Image thumbnail */
.payment-links__box__item__img {
  display: inline-block; width: 20%; max-width: 9.375rem; min-width: 5rem;
  height: 7.0625rem; background-position: center; background-size: contain;
  background-repeat: no-repeat; background-color: #f5f5f5;
  border-radius: 4px; margin-right: 5%; flex-shrink: 0;
}

/* Info */
.payment-links__box__item__info { display: inline-block; vertical-align: top; width: 60%; flex: 1; }
.payment-links__box__item__info .__title { font-size: 1rem; font-weight: 600; color: #2C2A29; margin-bottom: 0.3125rem; }
.payment-links__box__item__info .__value { font-size: 1.375rem; font-weight: 600; color: #333; margin-bottom: 0.25rem; }
.payment-links__box__item__info .__description { font-size: 0.875rem; color: #555; margin-bottom: 0.3125rem; }

/* Arrow */
.payment-links__box__item__arrow { position: absolute; top: 50%; right: 1rem; transform: translateY(-50%); }
.arrow-icon { font-size: 1.875rem; color: #00C389; }

/* === Empty alert — matches legacy WayAlert === */
.way-alert {
  margin-top: 1rem; background: #fff; border: 1px solid #e0e0e0;
  border-radius: 4px; padding: 2rem 1.5rem; text-align: center;
}
.way-alert__content { color: #666; }
.way-alert__content strong { display: block; margin-bottom: 0.5rem; font-size: 1rem; color: #2C2A29; }
.underlined { text-decoration: underline; cursor: pointer; color: #2C2A29; font-weight: 600; }
.underlined:hover { color: #00C389; }

/* === Loading === */
.loading-payment-links {
  display: flex; align-items: center; justify-content: center;
  gap: 0.5rem; padding: 3rem 0; color: #888; font-size: 0.875rem;
}
.loading-spinner {
  width: 20px; height: 20px; border: 2px solid #CACACA;
  border-top-color: #2C2A29; border-radius: 50%; animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* === Pagination === */
.pagination-container {
  margin-top: 1.5rem; display: flex; justify-content: center;
  align-items: center; gap: 1rem; padding-bottom: 1rem;
}
.page-btn {
  width: 32px; height: 32px; border: 1px solid #CACACA; border-radius: 4px;
  background: #fff; cursor: pointer; font-size: 1rem; color: #2C2A29;
}
.page-btn:hover:not(:disabled) { border-color: #2C2A29; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-info { font-size: 0.85rem; color: #616161; }

/* === Responsive === */
@media screen and (max-width: 51.875rem) {
  .payment-links__box__item__img { height: 3.5rem; margin-right: 0.5rem; }
  .payment-links__box__item__info .__value { font-size: 1.2rem; margin-bottom: 0; }
  .payment-links__box__item__info .__description { display: none; }
}
@media screen and (max-width: 48rem) {
  .view-title-bar__text { font-size: 1.3rem; }
  .view-title-bar__container { justify-content: center; }
  .payment-links__box__item__arrow { right: 0.5rem; }
}
@media screen and (max-width: 23.125rem) {
  .payment-links__box__item { padding: 0.9375rem 0.5rem; font-size: 0.8125rem; }
}
</style>

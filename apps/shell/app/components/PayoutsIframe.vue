<template>
  <div class="payouts-iframe-page">
    <div class="view-title-bar">
      <div class="view-title-bar__container">
        <span class="view-title-bar__text">Pagos a terceros</span>
      </div>
    </div>
    <section class="payouts-iframe-section">
      <div v-if="!iframeUrl || iframeLoading" class="iframe-loading">
        <div class="loading-spinner"></div>
        <span>Cargando...</span>
      </div>
      <iframe
        v-if="iframeUrl"
        :src="iframeUrl"
        frameborder="0"
        width="100%"
        height="100%"
        @load="iframeLoading = false"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '@wompi/auth'

const props = defineProps<{ path: string }>()

const { refreshSession } = useAuth()
const iframeUrl = ref('')
const iframeLoading = ref(true)

const WEBSITE_PAYOUTS_URL = (import.meta as any).env?.VITE_WEBSITE_PAYOUTS_URL || 'https://payouts.uat.wompi.dev'

async function generateUrl() {
  let token = localStorage.getItem('token') || ''

  // Try to refresh to get a fresh token
  try {
    const tokens = await refreshSession()
    token = tokens.accessToken || token
  } catch { /* use existing token */ }

  const userPrincipalId = sessionStorage.getItem('userPrincipalID') || ''

  const url = new URL(`${WEBSITE_PAYOUTS_URL}/redirect`)
  url.searchParams.append('code', 'WOMPI_PAYOUTS')
  url.searchParams.append('token', token)
  url.searchParams.append('path', props.path)
  url.searchParams.append('userPrincipalId', userPrincipalId)

  iframeUrl.value = url.toString()
}

onMounted(() => generateUrl())
</script>

<style scoped>
.view-title-bar { background: #2C2A29; color: #fff; }
.view-title-bar__container { max-width: 74.25rem; margin: 0 auto; height: 100px; display: flex; align-items: center; padding: 0 1.5rem; }
.view-title-bar__text { font-size: 1.6rem; font-weight: 400; }
.payouts-iframe-section { height: calc(100vh - 200px); position: relative; }
.payouts-iframe-section iframe { width: 100%; height: 100%; border: none; }
.iframe-loading { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); display: flex; align-items: center; gap: 0.5rem; color: #888; }
.loading-spinner { width: 20px; height: 20px; border: 2px solid #CACACA; border-top-color: #2C2A29; border-radius: 50%; animation: spin 0.6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>

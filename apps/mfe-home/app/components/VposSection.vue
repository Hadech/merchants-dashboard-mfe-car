<script setup lang="ts">
import QrcodeVue from 'qrcode.vue'
import { getWhatsAppShareUrl, getFacebookShareUrl, getXShareUrl } from '~/utils/socialShareUrls'

interface Props {
  vpos: { id: string } | null
  checkoutUrl: string
}

const props = defineProps<Props>()

const copied = ref(false)

const vposLinkUrl = computed(() => {
  if (!props.vpos) return ''
  return `${props.checkoutUrl}/l/${props.vpos.id}`
})

const encodedVposLinkUrl = computed(() => encodeURIComponent(vposLinkUrl.value))

const whatsAppUrl = computed(() => getWhatsAppShareUrl(vposLinkUrl.value))
const facebookUrl = computed(() => getFacebookShareUrl(vposLinkUrl.value))
const xUrl = computed(() => getXShareUrl(vposLinkUrl.value))

async function copyUrl() {
  try {
    await navigator.clipboard.writeText(vposLinkUrl.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // Fallback silently
  }
}
</script>

<template>
  <div v-if="props.vpos" class="vpos-section">
    <div class="vpos-link">
      <p class="section-title">Tu link de pago para compartir</p>
      <div class="url-container">
        <span class="url-text">{{ vposLinkUrl }}</span>
        <button class="copy-btn" @click="copyUrl">
          {{ copied ? '¡Copiado!' : 'Copiar' }}
        </button>
      </div>
      <hr class="divider" />
      <div class="share-buttons">
        <a
          :href="whatsAppUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="share-btn whatsapp"
        >
          Compartir en <strong>WhatsApp</strong>
        </a>
        <a
          :href="facebookUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="share-btn facebook"
        >
          Compartir en <strong>Facebook</strong>
        </a>
        <a
          :href="xUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="share-btn x-share"
        >
          Compartir en <strong>X</strong>
        </a>
      </div>
    </div>
    <div class="vpos-qr">
      <p class="section-title">Tu código QR para compartir</p>
      <div class="qr-wrapper">
        <QrcodeVue
          :value="vposLinkUrl"
          :size="256"
          level="M"
          :background="'#ffffff'"
          :foreground="'#2A2C29'"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.vpos-section {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.vpos-link,
.vpos-qr {
  flex: 1;
  min-width: 280px;
  text-align: center;
}

.section-title {
  font-size: 12px;
  color: #616161;
  margin-bottom: 1rem;
}

.url-container {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 8px 12px;
}

.url-text {
  flex: 1;
  font-size: 13px;
  color: #2a2c29;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.copy-btn {
  background: #2a2c29;
  color: #dfff61;
  border: none;
  border-radius: 100px;
  padding: 6px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.divider {
  border: none;
  border-top: 1px solid #e0e0e0;
  margin: 1rem 0;
}

.share-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.share-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  border-radius: 100px;
  font-size: 14px;
  text-decoration: none;
  color: #2a2c29;
  border: 1px solid #e0e0e0;
  transition: background-color 0.15s;
}

.share-btn:hover {
  background-color: #f5f5f5;
}

.qr-wrapper {
  display: flex;
  justify-content: center;
}
</style>

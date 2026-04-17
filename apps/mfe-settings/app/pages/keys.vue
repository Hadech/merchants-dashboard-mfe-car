<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-900">Llaves de API</h1>

    <div v-if="loading" class="flex items-center justify-center h-32">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin h-6 w-6 text-pink-500" />
    </div>

    <template v-else>
      <!-- Sandbox Keys -->
      <div class="bg-white rounded-lg border p-6 space-y-4">
        <div class="flex items-center gap-2">
          <div class="h-2 w-2 rounded-full bg-yellow-400" />
          <h2 class="text-lg font-semibold text-gray-900">Sandbox</h2>
        </div>

        <div class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Llave pública</label>
            <div class="flex items-center gap-2 bg-gray-50 rounded border p-3">
              <code class="text-sm text-gray-900 flex-1 break-all">{{ keys.sandbox.publicKey }}</code>
              <WCopyButton :text="keys.sandbox.publicKey" label="Copiar" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Llave privada</label>
            <div class="flex items-center gap-2 bg-gray-50 rounded border p-3">
              <code class="text-sm text-gray-900 flex-1 break-all">
                {{ showSandboxPrivate ? keys.sandbox.privateKey : maskedKey }}
              </code>
              <UButton
                size="xs"
                variant="ghost"
                color="neutral"
                :icon="showSandboxPrivate ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                @click="showSandboxPrivate = !showSandboxPrivate"
              />
              <WCopyButton :text="keys.sandbox.privateKey" label="Copiar" />
            </div>
          </div>
        </div>
      </div>

      <!-- Production Keys -->
      <div class="bg-white rounded-lg border p-6 space-y-4">
        <div class="flex items-center gap-2">
          <div class="h-2 w-2 rounded-full bg-green-500" />
          <h2 class="text-lg font-semibold text-gray-900">Producción</h2>
        </div>

        <div class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Llave pública</label>
            <div class="flex items-center gap-2 bg-gray-50 rounded border p-3">
              <code class="text-sm text-gray-900 flex-1 break-all">{{ keys.production.publicKey }}</code>
              <WCopyButton :text="keys.production.publicKey" label="Copiar" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Llave privada</label>
            <div class="flex items-center gap-2 bg-gray-50 rounded border p-3">
              <code class="text-sm text-gray-900 flex-1 break-all">
                {{ showProdPrivate ? keys.production.privateKey : maskedKey }}
              </code>
              <UButton
                size="xs"
                variant="ghost"
                color="neutral"
                :icon="showProdPrivate ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                @click="showProdPrivate = !showProdPrivate"
              />
              <WCopyButton :text="keys.production.privateKey" label="Copiar" />
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-if="error" class="text-sm text-red-600">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { WCopyButton } from '@wompi/ui'
import { useApiClient } from '@wompi/api-client'

const api = useApiClient()

const loading = ref(false)
const error = ref<string | null>(null)
const showSandboxPrivate = ref(false)
const showProdPrivate = ref(false)
const maskedKey = '••••••••••••••••••••••••'

const keys = reactive({
  sandbox: { publicKey: '', privateKey: '' },
  production: { publicKey: '', privateKey: '' },
})

async function fetchKeys() {
  loading.value = true
  error.value = null
  try {
    const data = await api('/merchants/keys')
    const k = data.data || {}
    keys.sandbox.publicKey = k.sandbox_public_key || ''
    keys.sandbox.privateKey = k.sandbox_private_key || ''
    keys.production.publicKey = k.production_public_key || ''
    keys.production.privateKey = k.production_private_key || ''
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Error al cargar llaves'
  } finally {
    loading.value = false
  }
}

onMounted(fetchKeys)
</script>

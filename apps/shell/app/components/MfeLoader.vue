<template>
  <div>
    <Suspense>
      <template #default>
        <component :is="remoteComponent" v-if="remoteComponent" />
      </template>
      <template #fallback>
        <div class="flex items-center justify-center h-64">
          <UIcon name="i-heroicons-arrow-path" class="animate-spin h-8 w-8 text-pink-500" />
        </div>
      </template>
    </Suspense>
    <div v-if="error" class="text-center py-16">
      <UIcon name="i-heroicons-exclamation-triangle" class="h-12 w-12 text-red-500 mx-auto mb-4" />
      <p class="text-gray-600">No se pudo cargar el módulo. Intenta recargar la página.</p>
      <UButton class="mt-4" @click="retry">Reintentar</UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ remoteName: string; exposedModule: string }>()

const remoteComponent = shallowRef()
const error = ref(false)

async function loadMfe() {
  try {
    error.value = false
    // Dynamic import placeholder — Module Federation loadRemote will be used when MF is enabled
    // const module = await loadRemote(`${props.remoteName}/${props.exposedModule}`)
    // remoteComponent.value = module?.default || module

    // For now, show a placeholder since MF remotes aren't available yet
    remoteComponent.value = null
    console.warn(`MFE ${props.remoteName}/${props.exposedModule} — Module Federation not yet configured`)
  } catch (e) {
    console.error(`Error cargando MFE ${props.remoteName}:`, e)
    error.value = true
  }
}

function retry() {
  loadMfe()
}

onMounted(loadMfe)
</script>

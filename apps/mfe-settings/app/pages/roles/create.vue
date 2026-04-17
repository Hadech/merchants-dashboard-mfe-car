<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <UButton
        icon="i-heroicons-arrow-left"
        variant="ghost"
        color="neutral"
        @click="navigateTo('/roles')"
      />
      <h1 class="text-2xl font-bold text-gray-900">Crear rol</h1>
    </div>

    <div class="bg-white rounded-lg border p-6 space-y-5 max-w-2xl">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del rol *</label>
        <UInput v-model="form.name" placeholder="Ej: Administrador, Operador" />
      </div>

      <div>
        <h3 class="text-sm font-medium text-gray-700 mb-3">Permisos por módulo</h3>
        <div v-if="store.availablePermissions.length === 0" class="text-sm text-gray-400">
          Cargando permisos...
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="(perms, moduleName) in store.permissionsByModule"
            :key="moduleName"
            class="border rounded-lg p-4"
          >
            <h4 class="text-sm font-semibold text-gray-800 mb-2 capitalize">{{ moduleName }}</h4>
            <div class="flex flex-wrap gap-3">
              <label
                v-for="perm in perms"
                :key="perm.id"
                class="flex items-center gap-2 text-sm text-gray-600"
              >
                <input
                  type="checkbox"
                  :value="perm.id"
                  v-model="selectedPermissions"
                  class="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                {{ perm.action }}
              </label>
            </div>
          </div>
        </div>
      </div>

      <div v-if="store.error" class="text-sm text-red-600">{{ store.error }}</div>

      <div class="flex gap-3">
        <UButton
          color="primary"
          :loading="store.loading"
          :disabled="!isValid"
          @click="handleSubmit"
        >
          Crear rol
        </UButton>
        <UButton variant="soft" color="neutral" @click="navigateTo('/roles')">
          Cancelar
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRolesStore } from '~/stores/roles'

const store = useRolesStore()

const form = reactive({ name: '' })
const selectedPermissions = ref<string[]>([])

const isValid = computed(() => form.name.trim() !== '')

async function handleSubmit() {
  const result = await store.createRole({
    name: form.name.trim(),
    permissions: selectedPermissions.value,
  })
  if (result && !store.error) {
    navigateTo('/roles')
  }
}

onMounted(() => {
  store.fetchPermissions()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <UButton
        icon="i-heroicons-arrow-left"
        variant="ghost"
        color="neutral"
        @click="navigateTo('/users')"
      />
      <h1 class="text-2xl font-bold text-gray-900">Crear usuario</h1>
    </div>

    <div class="bg-white rounded-lg border p-6 space-y-5 max-w-2xl">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
        <UInput v-model="form.name" placeholder="Nombre completo" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
        <UInput v-model="form.email" type="email" placeholder="usuario@empresa.com" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
        <UInput v-model="form.phone" placeholder="+57 300 123 4567" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
        <USelect v-model="form.role_id" :items="roleOptions" placeholder="Seleccionar rol" />
      </div>

      <div v-if="store.error" class="text-sm text-red-600">{{ store.error }}</div>

      <div class="flex gap-3">
        <UButton
          color="primary"
          :loading="store.loading"
          :disabled="!isValid"
          @click="handleSubmit"
        >
          Crear usuario
        </UButton>
        <UButton variant="soft" color="neutral" @click="navigateTo('/users')">
          Cancelar
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUsersStore } from '~/stores/users'
import { useRolesStore } from '~/stores/roles'
import type { CreateUserRequest } from '@wompi/types'

const store = useUsersStore()
const rolesStore = useRolesStore()

const form = reactive({
  name: '',
  email: '',
  phone: '',
  role_id: '',
})

const roleOptions = computed(() =>
  rolesStore.roles.map(r => ({ label: r.name, value: r.id }))
)

const isValid = computed(() =>
  form.name.trim() !== '' &&
  form.email.trim() !== '' &&
  form.role_id !== ''
)

async function handleSubmit() {
  const payload: CreateUserRequest = {
    name: form.name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    role_id: form.role_id,
  }
  const result = await store.createUser(payload)
  if (result && !store.error) {
    navigateTo('/users')
  }
}

onMounted(() => {
  rolesStore.fetchRoles()
})
</script>

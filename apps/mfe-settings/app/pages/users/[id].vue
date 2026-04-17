<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <UButton
        icon="i-heroicons-arrow-left"
        variant="ghost"
        color="neutral"
        @click="navigateTo('/users')"
      />
      <h1 class="text-2xl font-bold text-gray-900">Detalle de usuario</h1>
    </div>

    <div v-if="store.loading" class="flex items-center justify-center h-32">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin h-6 w-6 text-pink-500" />
    </div>

    <template v-else-if="store.currentUser">
      <div class="bg-white rounded-lg border p-6 space-y-5 max-w-2xl">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">{{ store.currentUser.name }}</h2>
            <p class="text-sm text-gray-500">{{ store.currentUser.email }}</p>
          </div>
          <WStatusBadge :status="store.currentUser.status" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <UInput v-model="editForm.name" :disabled="!editing" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <UInput v-model="editForm.email" type="email" :disabled="!editing" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <UInput v-model="editForm.phone" :disabled="!editing" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <USelect
              v-model="editForm.role_id"
              :items="roleOptions"
              :disabled="!editing"
            />
          </div>
        </div>

        <div v-if="store.error" class="text-sm text-red-600">{{ store.error }}</div>

        <div class="flex gap-3 pt-2">
          <template v-if="!editing">
            <UButton color="primary" @click="editing = true">Editar</UButton>
            <UButton
              v-if="store.currentUser.status === 'ACTIVE'"
              color="error"
              variant="soft"
              :loading="store.loading"
              @click="handleDisable"
            >
              Deshabilitar cuenta
            </UButton>
          </template>
          <template v-else>
            <UButton color="primary" :loading="store.loading" @click="handleSave">
              Guardar cambios
            </UButton>
            <UButton variant="soft" color="neutral" @click="cancelEdit">Cancelar</UButton>
          </template>
        </div>
      </div>
    </template>

    <div v-else class="text-sm text-gray-500">No se encontró el usuario.</div>
  </div>
</template>

<script setup lang="ts">
import { WStatusBadge } from '@wompi/ui'
import { useUsersStore } from '~/stores/users'
import { useRolesStore } from '~/stores/roles'

const route = useRoute()
const store = useUsersStore()
const rolesStore = useRolesStore()

const userId = computed(() => route.params.id as string)
const editing = ref(false)

const editForm = reactive({
  name: '',
  email: '',
  phone: '',
  role_id: '',
})

const roleOptions = computed(() =>
  rolesStore.roles.map(r => ({ label: r.name, value: r.id }))
)

function populateForm() {
  if (store.currentUser) {
    editForm.name = store.currentUser.name
    editForm.email = store.currentUser.email
    editForm.phone = store.currentUser.phone || ''
    editForm.role_id = store.currentUser.role?.id || ''
  }
}

function cancelEdit() {
  editing.value = false
  populateForm()
}

async function handleSave() {
  await store.updateUser(userId.value, {
    name: editForm.name.trim(),
    email: editForm.email.trim(),
    phone: editForm.phone.trim(),
    role_id: editForm.role_id,
  })
  if (!store.error) editing.value = false
}

async function handleDisable() {
  await store.disableUser(userId.value)
}

onMounted(async () => {
  await Promise.all([
    store.fetchUser(userId.value),
    rolesStore.fetchRoles(),
  ])
  populateForm()
})
</script>

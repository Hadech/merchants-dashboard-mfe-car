<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="w-full max-w-md p-8 bg-white rounded-xl shadow-sm">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Wompi Dashboard</h1>
        <p class="text-sm text-gray-500 mt-1">Inicia sesión para continuar</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <UFormField label="Usuario">
          <UInput v-model="credentials.username" type="text" placeholder="Tu usuario o email" required />
        </UFormField>

        <UFormField label="Contraseña">
          <UInput v-model="credentials.password" type="password" placeholder="••••••••" required />
        </UFormField>

        <div v-if="error" class="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          {{ error }}
        </div>

        <UButton type="submit" block :loading="loading" color="primary">
          Iniciar Sesión
        </UButton>
      </form>

      <div class="mt-4 text-center">
        <NuxtLink to="/password-recovery" class="text-sm text-pink-600 hover:underline">
          ¿Olvidaste tu contraseña?
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '@wompi/auth'

definePageMeta({ layout: false })

const { login } = useAuth()

const credentials = reactive({ username: '', password: '' })
const loading = ref(false)
const error = ref<string | null>(null)

async function handleLogin() {
  loading.value = true
  error.value = null
  try {
    await login(credentials)
    navigateTo('/transactions')
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Error al iniciar sesión'
  } finally {
    loading.value = false
  }
}
</script>

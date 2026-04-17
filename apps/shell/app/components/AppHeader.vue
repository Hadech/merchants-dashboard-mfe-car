<template>
  <header class="app-header">
    <div class="app-header__left">
      <span class="app-header__merchant">{{ merchant?.name || 'Mi Comercio' }}</span>
      <span class="app-header__env" :class="{ 'app-header__env--sandbox': isSandboxEnv }">
        {{ environment?.name || 'Producción' }}
      </span>
    </div>
    <div class="app-header__right">
      <NuxtLink to="/my-account" class="app-header__user">
        <i class="ic ic_user" />
        <span>{{ user?.name || user?.userName || 'Usuario' }}</span>
      </NuxtLink>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { Merchant, ApiEnvironment, CognitoUserInfo } from '@wompi/types'

const props = defineProps<{
  merchant: Merchant | null
  environment: ApiEnvironment
  user: CognitoUserInfo | null
}>()

defineEmits<{
  'toggle-environment': []
  logout: []
}>()

const isSandboxEnv = computed(() => props.environment?.type?.includes('test') ?? false)
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}

.app-header__left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.app-header__merchant {
  font-size: 1rem;
  font-weight: 600;
  color: #2C2A29;
}

.app-header__env {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  background-color: #E5FBE4;
  color: #1A624C;
}

.app-header__env--sandbox {
  background-color: #fff2df;
  color: #ff9c1b;
}

.app-header__right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.app-header__user {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: #2C2A29;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.15s ease;
}

.app-header__user:hover {
  color: #00825A;
}

.app-header__user i {
  font-size: 1.25rem;
  color: #2A2C29;
}

@media screen and (max-width: 48rem) {
  .app-header {
    padding: 0.5rem 0;
  }

  .app-header__merchant {
    font-size: 0.875rem;
  }
}
</style>

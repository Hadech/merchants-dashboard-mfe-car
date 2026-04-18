<template>
  <div>
    <!-- Heading -->
    <h2 class="login-heading">¡Bienvenido de vuelta!</h2>

    <!-- Form -->
    <form @submit.prevent="handleLogin" class="login-form">
      <!-- Username field -->
      <div class="login-fields">
        <div class="login-input-wrapper">
          <span class="login-input-icon ic ic_user"></span>
          <input
            v-model="credentials.username"
            type="text"
            placeholder="Nombre de usuario"
            class="login-input"
            required
            autocomplete="username"
          />
        </div>

        <!-- Password field -->
        <div class="login-input-wrapper">
          <span class="login-input-icon ic ic_password"></span>
          <input
            v-model="credentials.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Contraseña"
            class="login-input login-input--with-toggle"
            required
            autocomplete="current-password"
          />
          <button
            type="button"
            class="login-password-toggle"
            @click="showPassword = !showPassword"
            :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
          >
            <span :class="['ic', showPassword ? 'ic_view-slash' : 'ic_view']"></span>
          </button>
        </div>
      </div>

      <!-- Forgot password link -->
      <div class="login-forgot-wrapper">
        <NuxtLink to="/password-recovery" class="link login-forgot-link">
          ¿Olvidaste tu contraseña?
        </NuxtLink>
      </div>

      <!-- Submit button -->
      <button
        type="submit"
        class="btn-primary login-submit-btn"
        :disabled="!isFormValid || loading"
      >
        <template v-if="loading">
          <span class="login-spinner"></span>
          <span>Iniciando sesión...</span>
        </template>
        <template v-else>
          <span>Inicia sesión</span>
          <span class="ic ic_sign-in login-submit-icon"></span>
        </template>
      </button>
    </form>

    <!-- Sign up row -->
    <div class="login-signup-row">
      <span class="login-signup-text">¿No tienes una cuenta?</span>
      <a
        href="https://wompi.com/es/registro"
        class="btn-secondary login-signup-btn"
      >
        Regístrate aquí
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '@wompi/auth'
import { createApiClient } from '@wompi/api-client'

definePageMeta({ layout: 'login' })

const { login } = useAuth()
const toast = useWompiToast('login')

const credentials = reactive({ username: '', password: '' })
const loading = ref(false)
const showPassword = ref(false)

const isFormValid = computed(() =>
  credentials.username.trim().length > 0 && credentials.password.length > 0
)

async function handleLogin() {
  if (!isFormValid.value || loading.value) return

  loading.value = true
  try {
    // 1. Login via sessions/login API (envelope encryption, same as legacy)
    await login(credentials)
    console.log('[Login] Session login successful, userName:', localStorage.getItem('userName'))

    // 2. Fetch merchants to get userPrincipalID
    await fetchAndSetMerchant()

    // 3. Navigate to home
    await navigateTo('/transactions')
  } catch (e: unknown) {
    console.error('[Login] Error:', e)
    const message = e instanceof Error ? e.message : 'Error al iniciar sesión'
    toast.error('No puedes ingresar', message)
  } finally {
    loading.value = false
  }
}

async function fetchAndSetMerchant() {
  try {
    const token = localStorage.getItem('token')
    const refreshToken = localStorage.getItem('refreshToken')

    // We need at least a refreshToken to proceed
    if (!token && !refreshToken) {
      console.warn('[Login] No tokens available to fetch merchants')
      return
    }

    const api = createApiClient({ useAuth: true, usePrefix: true, refreshSession: undefined })

    // Use the email saved during login (from sessionPayload)
    const email = localStorage.getItem('userEmail') || credentials.username.toLowerCase()
    console.log('[Login] Fetching merchants for email:', email)

    const response = await api<{ data: { merchants: Array<{ id: string; permissions: string[]; roleName: string }> } }>(
      `/merchant-users/user/email/${email}`
    )
    console.log('[Login] Merchant response:', JSON.stringify(response).slice(0, 500))

    const merchants = response?.data?.merchants || []
    if (merchants.length > 0) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      const merchant = merchants.find(m => uuidRegex.test(m.id)) || merchants[0]
      sessionStorage.setItem('userPrincipalID', merchant.id)
      localStorage.setItem('userPrincipalID', merchant.id)
      console.log('[Login] userPrincipalID set:', merchant.id)
    } else {
      console.warn('[Login] No merchants found')
    }
  } catch (permError) {
    console.warn('[Login] Could not fetch merchants after login:', permError)
  }
}
</script>

<style scoped>
.login-heading {
  font-size: 1.75rem;
  line-height: 30px;
  letter-spacing: -0.006em;
  color: #2C2A29;
  margin-bottom: 65px;
}

.login-form {
  width: 100%;
  max-width: 360px;
}

/* Input wrapper */
.login-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.login-input-icon {
  position: absolute;
  left: 12px;
  font-size: 18px;
  color: #2C2A29;
  pointer-events: none;
  z-index: 1;
}

.login-input {
  width: 100%;
  height: 40px;
  border: 1px solid #CACACA;
  border-radius: 8px;
  padding: 0 12px 0 40px;
  font-size: 16px;
  font-family: "Open Sans", sans-serif;
  color: #2C2A29;
  outline: none;
  transition: border-color 0.2s ease;
}

.login-input:focus {
  border-color: #2C2A29;
}

.login-input::placeholder {
  color: #969696;
}

.login-input--with-toggle {
  padding-right: 44px;
}

/* Password toggle */
.login-password-toggle {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: #616161;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-password-toggle:hover {
  color: #2C2A29;
}

/* Forgot password */
.login-forgot-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  margin-bottom: 32px;
}

.login-forgot-link {
  color: #2C2A29;
  text-decoration: underline;
  font-size: 0.875rem;
}

/* Submit button */
.login-submit-btn {
  width: 100%;
  height: 48px;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login-submit-icon {
  position: absolute;
  right: 25px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.5rem;
  color: #2C2A29;
}

/* Spinner */
.login-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid #2C2A29;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Sign up row */
.login-signup-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 15px;
  margin-top: 75px;
}

.login-signup-text {
  font-size: 1rem;
  color: #2C2A29;
}

.login-signup-btn {
  height: 40px;
  min-width: auto;
  padding: 0 16px;
  font-size: 0.875rem;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* === Mobile (< 768px) === */
@media screen and (max-width: 768px) {
  .login-heading {
    text-align: center;
  }

  .login-form {
    max-width: 100%;
  }

  .login-signup-row {
    margin-top: 25px;
    margin-bottom: 75px;
    justify-content: center;
  }
}
</style>

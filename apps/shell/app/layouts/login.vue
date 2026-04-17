<template>
  <div class="login-layout">
    <div class="login-page">
      <div class="login-grid">
        <!-- Banner Image (hidden on mobile) -->
        <div class="login-banner">
          <img
            :src="bannerSrc"
            alt="Wompi Login"
            class="login-banner__image"
          />
        </div>

        <!-- Form Area -->
        <div class="login-form-area">
          <img
            :src="logoSrc"
            alt="Wompi"
            class="login-logo"
            width="160"
            height="51"
          />
          <slot />
        </div>
      </div>
    </div>

    <LoginFooter />
  </div>
</template>

<script setup lang="ts">
import '~/assets/css/login.css'

const bannerSrc = ref('/images/banner-nickname.png')
const logoSrc = ref('/images/wompi-logo-black.png')
</script>

<style scoped>
.login-page {
  min-height: calc(100vh - 70px);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #FFFFFF;
  padding: 24px 16px;
}

.login-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 0;
  max-width: 1140px;
  width: 100%;
  align-items: center;
}

.login-banner {
  grid-column: 1 / 6;
}

.login-banner__image {
  width: 100%;
  height: auto;
  border-radius: 32px;
  object-fit: cover;
}

.login-form-area {
  grid-column: 7 / 13;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-left: 40px;
}

.login-logo {
  width: 160px;
  height: 51px;
  object-fit: contain;
  margin-bottom: 53px;
}

/* === Mobile (< 768px) === */
@media screen and (max-width: 768px) {
  .login-page {
    min-height: calc(100vh - 218px);
  }

  .login-grid {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .login-banner {
    display: none;
  }

  .login-form-area {
    grid-column: unset;
    width: 100%;
    max-width: 400px;
    padding-left: 0;
    align-items: center;
  }
}
</style>

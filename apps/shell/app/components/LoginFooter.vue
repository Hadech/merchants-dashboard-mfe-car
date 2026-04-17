<template>
  <footer class="login-footer">
    <div class="login-footer__content">
      <!-- Logo -->
      <img
        :src="logoSrc"
        alt="Wompi"
        class="login-footer__logo"
        width="120"
        height="40"
      />

      <!-- Links -->
      <div class="login-footer__links">
        <a
          href="https://wompi.com/es/terminos-y-condiciones"
          target="_blank"
          rel="noopener noreferrer"
          class="login-footer__link"
        >
          Términos y condiciones
        </a>
        <a
          href="https://wompi.com/es/politica-de-privacidad"
          target="_blank"
          rel="noopener noreferrer"
          class="login-footer__link"
        >
          Política de privacidad
        </a>
      </div>

      <!-- Copyright -->
      <span class="login-footer__copyright">
        © {{ currentYear }} Wompi. Todos los derechos reservados.
      </span>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear()
const logoSrc = ref('/images/wompi-logo-black.png')
</script>

<style scoped>
.login-footer {
  position: sticky;
  bottom: 0;
  width: 100%;
  background-color: #fff;
  border-top: 1px solid #616161;
  height: 70px;
  z-index: 10;
}

.login-footer__content {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 16px;
  gap: 20px;
  max-width: 1140px;
  margin: 0 auto;
  height: 100%;
}

.login-footer__logo {
  width: 120px;
  height: 40px;
  object-fit: contain;
  margin-right: 50px;
  flex-shrink: 0;
}

.login-footer__links {
  display: flex;
  gap: 20px;
  align-items: center;
}

.login-footer__link {
  color: #2C2A29;
  text-decoration: underline;
  font-size: 0.875rem;
  white-space: nowrap;
}

.login-footer__copyright {
  margin-left: auto;
  color: #2C2A29;
  font-size: 0.75rem;
  white-space: nowrap;
}

/* === Mobile (< 768px) === */
@media screen and (max-width: 768px) {
  .login-footer {
    height: 218px;
  }

  .login-footer__content {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 15px;
    text-align: center;
  }

  .login-footer__logo {
    margin-right: 0;
  }

  .login-footer__links {
    flex-direction: column;
    gap: 15px;
  }

  .login-footer__copyright {
    margin-left: 0;
  }
}
</style>

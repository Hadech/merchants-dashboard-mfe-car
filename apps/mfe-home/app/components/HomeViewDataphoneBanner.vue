<script setup lang="ts">
import { useNavigation } from '~/composables/useNavigation'

const { navigateTo } = useNavigation()

function onClick() {
  navigateTo('/dataphones')
}
</script>

<template>
  <div class="dataphone-banner-container">
    <div class="dataphone-banner">
      <div class="dataphone-banner-text-container">
        <p class="description-text">
          Ahora también <span class="hl">puedes recibir pagos</span> con tarjetas
          <span class="hl">en tu comercio</span>, gracias al
        </p>
        <div class="description-ending">
          <p class="description-ending-text">Datáfono</p>
        </div>
      </div>
      <div class="dataphone-banner-button-container">
        <button class="button-dataphone-information" @click="onClick">
          Conoce más y solicita el tuyo
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dataphone-banner-container {
  padding: 35px 0 0 0;
  background-color: #fafafa;
}

.dataphone-banner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  min-height: 220px;
  width: 100%;
  padding: 0 clamp(16px, 5vw, 56px);
  background-color: #d6edfe;
  border-radius: 24px;
}

.dataphone-banner-text-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.description-text {
  color: black;
  font-size: 26px;
  font-weight: 700;
  line-height: 32px;
  letter-spacing: -0.6px;
  max-width: 428px;
}

.description-text .hl {
  background-color: #dfff61;
}

.description-ending {
  display: flex;
  gap: 12px;
}

.description-ending-text {
  color: #00825a;
  font-size: 36px;
  font-weight: 700;
  line-height: 44px;
  letter-spacing: -0.6px;
}

.dataphone-banner-button-container {
  position: relative;
  z-index: 3;
}

.button-dataphone-information {
  width: 249px;
  height: 48px;
  padding: 13px 24px;
  border-radius: 100px;
  background: #000;
  color: #dfff61;
  font-size: 16px;
  font-weight: 600;
  line-height: 22px;
  letter-spacing: -0.3px;
  cursor: pointer;
  border: none;
}

@media screen and (max-width: 768px) {
  .dataphone-banner {
    flex-direction: column;
    justify-content: center;
    height: auto;
    padding: 32px 16px 20px;
  }

  .dataphone-banner-text-container {
    align-items: center;
    text-align: center;
    margin-bottom: 12px;
  }
}
</style>

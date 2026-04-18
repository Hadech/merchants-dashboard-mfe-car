<script setup lang="ts">
import { useNavigation } from '~/composables/useNavigation'

interface Props {
  isPayoutsAvailable: boolean
}

const props = defineProps<Props>()

const { navigateTo } = useNavigation()

const shouldRenderPayoutsBanner = computed(() => !props.isPayoutsAvailable)

function onClick() {
  navigateTo('/payouts/welcome')
}
</script>

<template>
  <div v-if="shouldRenderPayoutsBanner" class="payouts-banner">
    <div class="content">
      <h1 class="title">Con pagos a terceros</h1>
      <p class="description">
        usas los recursos que tienes en tu cuenta Wompi o tu cuenta bancaria para pagar nómina,
        proveedores, servicios y más.
      </p>
      <button class="button" @click="onClick">¡Actívalo ahora!</button>
    </div>
  </div>
</template>

<style scoped>
.payouts-banner {
  display: flex;
  border-radius: 26px;
  background-color: #f0f4ff;
  padding: 2rem 6rem;
}

.content {
  margin-left: auto;
  text-align: center;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: #2a2c29;
}

.description {
  width: 359px;
  color: #2a2c29;
  font-size: 18px;
  font-weight: 400;
  line-height: 20px;
}

.button {
  margin: 24px auto 0 auto;
  width: 224px;
  height: 48px;
  border-radius: 100px;
  background: #2a2c29;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.3px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
}

.button:hover {
  background: #616161;
}

@media screen and (max-width: 768px) {
  .payouts-banner {
    display: block;
    padding: 2rem 1rem;
  }

  .content {
    margin-left: 0;
  }

  .description {
    font-size: 16px;
    line-height: 22px;
    width: 100%;
  }

  .button {
    border-radius: 16px;
  }
}
</style>

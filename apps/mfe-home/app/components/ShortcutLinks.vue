<script setup lang="ts">
import { usePermissions } from '~/composables/usePermissions'
import { useNavigation } from '~/composables/useNavigation'
import { permissionActions, permissionSubjects } from '~/utils/permissionConstants'

const { can } = usePermissions()
const { navigateTo } = useNavigation()
</script>

<template>
  <div class="shortcut-links">
    <div
      v-if="can(permissionActions.create, permissionSubjects.paymentLinks)"
      class="shortcut-card"
      @click="navigateTo('/payment-links/create-link')"
    >
      <div class="card-label">Links de pago</div>
      <div class="card-description">¡Crea links de pago y comienza a vender ahora!</div>
    </div>

    <div
      v-if="can(permissionActions.menu, permissionSubjects.transactions)"
      class="shortcut-card"
      @click="navigateTo('/transactions')"
    >
      <div class="card-label">Transacciones</div>
      <div class="card-description">Consulta el estado y detalle de tus transacciones</div>
    </div>

    <a
      href="https://wompi.statuspage.io/"
      target="_blank"
      rel="noopener noreferrer"
      class="shortcut-card shortcut-link"
    >
      <div class="card-label">Status Page</div>
      <div class="card-description">Conoce el estado de los servicios de Wompi y los medios de pago</div>
    </a>
  </div>
</template>

<style scoped>
.shortcut-links {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.shortcut-card {
  flex: 1;
  min-width: 200px;
  padding: 1rem;
  background: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
}

.shortcut-card:hover {
  transform: translateY(-2px);
  border-color: #2a2c29;
  background: #f5f5f5;
}

.shortcut-link {
  text-decoration: none;
  color: inherit;
}

.card-label {
  font-size: 12px;
  font-weight: 600;
  color: #616161;
  margin-bottom: 8px;
}

.card-description {
  font-size: 0.9rem;
  font-weight: 700;
  color: #2a2c29;
}
</style>

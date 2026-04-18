<script setup lang="ts">
import type { BusinessProcedure } from '@wompi/types'

interface Props {
  businessesProcedures: BusinessProcedure[]
}

const props = defineProps<Props>()

const showStatus = ref(false)

type ApprovalStatus = 'progress' | 'approved' | 'declined'

const status = ref<ApprovalStatus>('progress')

const statusContent: Record<ApprovalStatus, { title: string; description: string; style: string; statusText: string }> = {
  progress: {
    title: 'Tu comercio está en proceso de aprobación',
    description: 'Estamos revisando tu información. Te notificaremos cuando el proceso esté completo.',
    style: '',
    statusText: 'En revisión',
  },
  approved: {
    title: '¡Tu comercio ha sido aprobado!',
    description: 'Ya puedes comenzar a recibir pagos con Wompi.',
    style: 'success',
    statusText: 'Aprobado',
  },
  declined: {
    title: 'Tu comercio no fue aprobado',
    description: 'Contáctanos para revisar tu caso y encontrar una solución.',
    style: 'error',
    statusText: 'Rechazado',
  },
}

const progressStatuses = ['IN_REVIEW', 'PENDING', 'RESCUE']

onMounted(() => {
  const identityValidation = props.businessesProcedures.find((bp) =>
    bp.slug.includes('identity_validation')
  )

  if (identityValidation) {
    if (identityValidation.status === 'DECLINED') {
      status.value = 'declined'
    } else if (progressStatuses.includes(identityValidation.status)) {
      status.value = 'progress'
    } else {
      status.value = 'approved'
    }
  }
})

const currentContent = computed(() => statusContent[status.value])

function toggleShowStatus() {
  showStatus.value = !showStatus.value
}
</script>

<template>
  <div :class="['timeline-approval-status', currentContent.style]">
    <div class="info">
      <div class="text">
        <span class="info-title">{{ currentContent.title }}</span>
        <p class="info-description">{{ currentContent.description }}</p>
      </div>
      <div class="view-detail">
        <button @click="toggleShowStatus">
          {{ showStatus ? 'Cerrar' : 'Ver detalles' }}
        </button>
      </div>
    </div>
    <div v-if="showStatus" class="approval-status">
      <div class="content">
        <p><strong>Estado: </strong>{{ currentContent.statusText }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timeline-approval-status {
  width: 100%;
  min-height: 56px;
  border-radius: 16px;
  padding: 16px 24px;
  margin-bottom: 32px;
  background-color: #e3f2fd;
}

.timeline-approval-status.success {
  background-color: #b0f2ae;
}

.timeline-approval-status.error {
  background-color: #ffd6d6;
}

.info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.text {
  flex: 1;
}

.info-title {
  font-weight: 700;
  font-size: 14px;
  color: #2a2c29;
}

.info-description {
  font-size: 14px;
  color: #2a2c29;
  margin: 4px 0 0;
}

.view-detail button {
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  color: #2a2c29;
}

.approval-status {
  margin-top: 16px;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 16px 24px;
}

.content p {
  font-size: 14px;
  margin: 0;
}

@media screen and (max-width: 768px) {
  .info {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

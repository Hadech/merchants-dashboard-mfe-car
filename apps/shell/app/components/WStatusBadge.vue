<script setup lang="ts">
import { computed } from 'vue'

type Status = 'pending' | 'success' | 'danger' | 'warning'

interface Props {
  status: Status
  label: string
  icon?: string
}

const props = defineProps<Props>()

const colorMap: Record<Status, { bg: string; text: string; icon: string }> = {
  pending: { bg: '#EBF6FE', text: '#27587D', icon: '#44769D' },
  success: { bg: '#E5FBE4', text: '#1A624C', icon: '#40A940' },
  danger: { bg: '#FFEBEB', text: '#A01110', icon: '#F03232' },
  warning: { bg: 'rgba(246, 198, 67, 0.32)', text: '#ff9c1b', icon: '#FFA41C' },
}

const colors = computed(() => colorMap[props.status])
</script>

<template>
  <span
    class="status-badge"
    :style="{
      backgroundColor: colors.bg,
      color: colors.text,
    }"
  >
    <i
      v-if="icon"
      :class="`ic ic_${icon}`"
      :style="{ color: colors.icon }"
    />
    {{ label }}
  </span>
</template>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 400;
  text-transform: capitalize;
  min-width: 80px;
  height: 20px;
  padding: 0 8px;
  justify-content: center;
  white-space: nowrap;
}
</style>

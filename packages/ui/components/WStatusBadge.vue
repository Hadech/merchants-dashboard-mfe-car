<template>
  <UBadge :color="badgeColor" variant="subtle" size="sm">
    {{ status }}
  </UBadge>
</template>

<script setup lang="ts">
type BadgeColor = 'success' | 'error' | 'warning' | 'neutral' | 'info'

const props = defineProps<{
  status: string
}>()

const statusColorMap: Record<string, BadgeColor> = {
  APPROVED: 'success',
  COMPLETED: 'success',
  ACTIVE: 'success',
  DECLINED: 'error',
  REJECTED: 'error',
  ERROR: 'error',
  DISABLED: 'error',
  PENDING: 'warning',
  VOIDED: 'neutral',
}

const badgeColor = computed<BadgeColor>(() => statusColorMap[props.status] ?? 'info')
</script>

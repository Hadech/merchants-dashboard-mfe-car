<script setup lang="ts">
interface Row {
  name: string
  value: string
  isUrl?: boolean
}

defineProps<{
  rows: Row[]
}>()
</script>

<template>
  <div class="details-table">
    <div
      v-for="(row, index) in rows"
      :key="index"
      class="details-table__row"
    >
      <span class="details-table__name">{{ row.name }}</span>
      <span
        class="details-table__value"
        :class="{ url: row.isUrl }"
      >
        {{ row.value }}
      </span>
    </div>
  </div>
</template>

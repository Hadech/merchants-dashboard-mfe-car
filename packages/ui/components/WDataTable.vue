<template>
  <div class="w-data-table">
    <UTable
      :columns="mappedColumns"
      :data="rows"
      :loading="loading"
    />
    <div class="flex items-center justify-between mt-4 px-2">
      <div class="text-sm text-gray-500">
        Mostrando {{ startItem }}–{{ endItem }} de {{ total }}
      </div>
      <div class="flex items-center gap-3">
        <USelect
          :model-value="String(perPage)"
          :items="perPageOptions"
          class="w-20"
          @update:model-value="$emit('update:perPage', Number($event))"
        />
        <div class="flex gap-1">
          <UButton
            icon="i-heroicons-chevron-left"
            variant="ghost"
            size="sm"
            :disabled="page <= 1"
            @click="$emit('update:page', page - 1)"
          />
          <UButton
            icon="i-heroicons-chevron-right"
            variant="ghost"
            size="sm"
            :disabled="page * perPage >= total"
            @click="$emit('update:page', page + 1)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Column {
  key: string
  label: string
  sortable?: boolean
  [k: string]: unknown
}

const props = defineProps<{
  columns: Column[]
  rows: Record<string, unknown>[]
  loading?: boolean
  total: number
  page: number
  perPage: number
}>()

defineEmits<{
  'update:page': [page: number]
  'update:perPage': [perPage: number]
}>()

const perPageOptions = ['10', '20', '50', '100']

// Nuxt UI v3 UTable uses `id` + `header` instead of `key` + `label`
const mappedColumns = computed(() =>
  props.columns.map(col => ({
    id: col.key,
    header: col.label,
    accessorKey: col.key,
    ...col,
  }))
)

const startItem = computed(() => (props.page - 1) * props.perPage + 1)
const endItem = computed(() => Math.min(props.page * props.perPage, props.total))
</script>

<template>
  <div class="w-filter-panel flex flex-wrap items-end gap-3 p-4 bg-gray-50 rounded-lg">
    <template v-for="field in schema" :key="field.key">
      <div class="flex flex-col gap-1 min-w-[180px]">
        <label class="text-xs font-medium text-gray-600">{{ field.label }}</label>

        <USelect
          v-if="field.type === 'select'"
          :model-value="String(localFilters[field.key] ?? '')"
          :items="field.options ?? []"
          placeholder="Todos"
          @update:model-value="updateFilter(field.key, $event)"
        />

        <UInput
          v-else
          :model-value="String(localFilters[field.key] ?? '')"
          :placeholder="field.label"
          @update:model-value="updateFilter(field.key, $event)"
        />
      </div>
    </template>

    <div class="flex gap-2 ml-auto">
      <UButton variant="soft" @click="handleReset">Limpiar</UButton>
      <UButton color="primary" @click="handleApply">Filtrar</UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
interface FilterField {
  key: string
  label: string
  type: 'text' | 'select'
  options?: string[]
}

const props = defineProps<{
  filters: Record<string, unknown>
  schema: FilterField[]
}>()

const emit = defineEmits<{
  'update:filters': [filters: Record<string, unknown>]
  apply: []
  reset: []
}>()

const localFilters = ref<Record<string, unknown>>({ ...props.filters })

watch(() => props.filters, (v) => {
  localFilters.value = { ...v }
}, { deep: true })

function updateFilter(key: string, value: unknown) {
  localFilters.value[key] = value
  emit('update:filters', { ...localFilters.value })
}

function handleApply() {
  emit('update:filters', { ...localFilters.value })
  emit('apply')
}

function handleReset() {
  const cleared: Record<string, unknown> = {}
  for (const field of props.schema) {
    cleared[field.key] = ''
  }
  localFilters.value = cleared
  emit('update:filters', cleared)
  emit('reset')
}
</script>

<template>
  <UButton
    :icon="copied ? 'i-heroicons-check' : 'i-heroicons-clipboard-document'"
    variant="ghost"
    size="sm"
    :color="copied ? 'success' : 'neutral'"
    @click="copy"
  >
    {{ copied ? '¡Copiado!' : label }}
  </UButton>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  text: string
  label?: string
}>(), {
  label: 'Copiar',
})

const copied = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

async function copy() {
  try {
    await navigator.clipboard.writeText(props.text)
    copied.value = true
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea')
    textarea.value = props.text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    copied.value = true
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => { copied.value = false }, 2000)
  }
}
</script>

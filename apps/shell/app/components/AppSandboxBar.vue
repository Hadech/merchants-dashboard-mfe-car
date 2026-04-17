<script setup lang="ts">
// Sandbox environment indicator bar
</script>

<template>
  <div class="sandbox-bar">
    <slot>
      <span>Ambiente de pruebas (Sandbox)</span>
    </slot>
  </div>
</template>

<style scoped>
.sandbox-bar {
  height: 3rem;
  background-color: #ff9c1b;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 0.875rem;
  font-weight: 600;
  width: 100%;
}

@media screen and (max-width: 48rem) {
  .sandbox-bar {
    height: 2.55rem;
  }
}
</style>

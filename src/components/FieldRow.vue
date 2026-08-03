<script setup lang="ts">
import SymbolText from "@/components/SymbolText.vue";

defineProps<{
  label: string;
  symbol: string;
  unit: string;
}>();
</script>

<template>
  <div class="field-row">
    <div class="field-label">
      {{ label }}
    </div>
    <div class="field-symbol">
      <SymbolText :value="symbol" />
    </div>
    <div class="field-unit">
      {{ unit }}
    </div>
    <div class="field-input">
      <slot />
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.field-row {
  @apply grid grid-cols-[minmax(0,1fr)_2.5rem_3rem_4.5rem] divide-x divide-slate-300 border-b border-slate-300 last:border-b-0;
}

.field-label {
  @apply px-2 py-1;
}

.field-symbol {
  @apply px-1 py-1 text-center font-mono;
}

.field-unit {
  @apply px-1 py-1 text-center font-mono;
}

.field-input {
  @apply bg-white;
}
</style>

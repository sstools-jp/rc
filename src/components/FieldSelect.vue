<script setup lang="ts">
type FieldSelectOption = {
  value: string;
  label: string;
};

defineProps<{
  value: string;
  options: FieldSelectOption[];
}>();

const emit = defineEmits<{
  change: [value: string];
}>();

function handleChange(event: Event) {
  emit("change", (event.target as HTMLSelectElement).value);
}
</script>

<template>
  <select class="field-select" :value="value" @change="handleChange">
    <option v-for="option in options" :key="option.value" :value="option.value">
      {{ option.label }}
    </option>
  </select>
</template>

<style scoped>
@reference "tailwindcss";

.field-select {
  @apply box-border block h-full w-full border border-transparent px-1 py-0.5 text-right font-mono outline-none placeholder:text-slate-400;
  @apply focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 focus:ring-inset;
}
</style>

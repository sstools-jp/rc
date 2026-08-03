<script setup lang="ts">
import { cn } from "@/utils/cn";

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

const className = cn(
  "box-border block h-full w-full border border-transparent px-1 py-0.5 text-right font-mono outline-none placeholder:text-slate-400",
  "focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 focus:ring-inset",
);

function handleChange(event: Event) {
  emit("change", (event.target as HTMLSelectElement).value);
}
</script>

<template>
  <select
    :class="className"
    :value="value"
    @change="handleChange"
  >
    <option
      v-for="option in options"
      :key="option.value"
      :value="option.value"
    >
      {{ option.label }}
    </option>
  </select>
</template>

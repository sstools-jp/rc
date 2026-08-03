<script setup lang="ts">
import SymbolText from "@/components/SymbolText.vue";
import { cn } from "@/utils/cn";

const GRID_ROW_CLASS = cn(
  "grid grid-cols-[minmax(0,1fr)_2.5rem_3rem_4.5rem]",
  "divide-x divide-slate-300",
  "border-b border-slate-300 last:border-b-0",
);

defineProps<{
  label: string;
  symbol: string;
  unit: string;
}>();
</script>

<template>
  <div :class="GRID_ROW_CLASS">
    <div class="px-2 py-1">
      {{ label }}
    </div>
    <div class="px-1 py-1 text-center font-mono">
      <SymbolText :value="symbol" />
    </div>
    <div class="px-1 py-1 text-center font-mono">
      {{ unit }}
    </div>
    <div class="bg-white">
      <slot />
    </div>
  </div>
</template>

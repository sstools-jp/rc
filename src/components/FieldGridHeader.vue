<script setup lang="ts">
import { cn } from "@/utils/cn";

const GRID_ROW_CLASS = cn(
  "grid grid-cols-[minmax(0,1fr)_2.5rem_3rem_4.5rem]",
  "divide-x divide-slate-300",
  "border-b border-slate-300 last:border-b-0",
);
</script>

<template>
  <div :class="cn(GRID_ROW_CLASS, 'bg-slate-200/50 text-xs font-semibold tracking-wider text-slate-600')">
    <div class="px-2 py-1 text-center">
      項目名
    </div>
    <div class="px-1 py-1 text-center">
      記号
    </div>
    <div class="px-1 py-1 text-center">
      単位
    </div>
    <div class="px-1 py-1 text-center">
      入力値
    </div>
  </div>
</template>

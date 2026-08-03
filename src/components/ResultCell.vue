<script setup lang="ts">
import { computed } from "vue";
import Tooltip from "@/components/Tooltip.vue";
import type { TooltipContent } from "@/types/tooltip-content";
import SelectableText from "@/components/SelectableText.vue";
import SymbolText from "@/components/SymbolText.vue";

const props = defineProps<{
  label: string;
  symbol?: string;
  /** 記号に表示するツールチップ */
  symbolTooltip?: TooltipContent;
  value: string;
  /** 計算結果の幅 (Tailwindのw-[number]相当) */
  valueWidth?: number;
  unit?: string;
}>();

const valueWidthStyle = computed(() =>
  props.valueWidth === undefined ? undefined : { width: `${props.valueWidth / 4}rem` },
);
</script>

<template>
  <article class="result-cell">
    <span class="result-label">{{ label }}</span>
    <div class="result-value-group">
      <template v-if="symbol">
        <span class="result-symbol">
          <Tooltip v-if="symbolTooltip" :content="symbolTooltip">
            <SymbolText :value="symbol" />
          </Tooltip>
          <SymbolText v-else :value="symbol" />
        </span>
        <span class="result-equals">=</span>
      </template>
      <SelectableText :style="valueWidthStyle">
        {{ value }}
      </SelectableText>
      <span class="result-unit">{{ unit ?? "" }}</span>
    </div>
  </article>
</template>

<style scoped>
@reference "tailwindcss";

.result-cell {
  @apply flex border-b border-slate-400 px-2 py-1 text-sm last:border-b-0;
}

.result-label {
  @apply flex flex-1 items-center gap-1;
}

.result-value-group {
  @apply space-x-2 text-right font-mono;
}

.result-symbol {
  @apply inline-block w-2.5 text-left text-slate-700;
}

.result-equals {
  @apply inline-block w-2 text-left text-slate-700;
}

.result-unit {
  @apply inline-block w-9 text-left text-slate-700 select-none;
}
</style>

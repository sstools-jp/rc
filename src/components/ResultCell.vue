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
  <article class="flex border-b border-slate-400 px-2 py-1 text-sm last:border-b-0">
    <span class="flex flex-1 items-center gap-1">{{ label }}</span>
    <div class="space-x-2 text-right font-mono">
      <template v-if="symbol">
        <span class="inline-block w-2.5 text-left text-slate-700">
          <Tooltip
            v-if="symbolTooltip"
            :content="symbolTooltip"
          >
            <SymbolText :value="symbol" />
          </Tooltip>
          <SymbolText
            v-else
            :value="symbol"
          />
        </span>
        <span class="inline-block w-2 text-left text-slate-700">=</span>
      </template>
      <SelectableText :style="valueWidthStyle">
        {{ value }}
      </SelectableText>
      <span class="inline-block w-9 text-left text-slate-700 select-none">{{ unit ?? "" }}</span>
    </div>
  </article>
</template>

<script setup lang="ts">
/**
 * シングルクリックで全選択状態になるテキスト
 */

import { ref } from "vue";
import { cn } from "@/utils/cn";

defineProps<{
  className?: string;
  style?: Record<string, string>;
}>();

const spanRef = ref<HTMLSpanElement | null>(null);

/** クリックでテキスト全選択 */
function handleSelect() {
  const selection = window.getSelection();
  const range = document.createRange();

  if (!spanRef.value || !selection) return;

  range.selectNodeContents(spanRef.value);
  selection.removeAllRanges();
  selection.addRange(range);
}
</script>

<template>
  <span ref="spanRef" class="selectable-text" :class="cn(className)" :style="style" @click="handleSelect">
    <slot />
  </span>
</template>

<style scoped>
@reference "tailwindcss";

.selectable-text {
  @apply inline-block select-all;
}
</style>

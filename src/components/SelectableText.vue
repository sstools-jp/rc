<script setup lang="ts">
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
  <span
    ref="spanRef"
    :class="cn('inline-block select-all', className)"
    :style="style"
    @click="handleSelect"
  >
    <slot />
  </span>
</template>

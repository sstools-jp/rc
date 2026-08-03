<script setup lang="ts">
import type { SectionForceMode } from "@/types/section-force-mode";

defineProps<{
  value: SectionForceMode;
}>();

const emit = defineEmits<{
  change: [value: SectionForceMode];
}>();
</script>

<template>
  <fieldset class="mr-1 flex gap-3 text-xs">
    <legend class="sr-only">
      断面力タイプ
    </legend>
    <label class="flex gap-1.5">
      <input
        type="radio"
        name="section-force-mode"
        :checked="value === '3'"
        @change="emit('change', '3')"
      >
      <span>3断面力</span>
    </label>
    <label class="flex gap-1.5">
      <input
        type="radio"
        name="section-force-mode"
        :checked="value === '6'"
        @change="emit('change', '6')"
      >
      <span>6断面力</span>
    </label>
  </fieldset>
</template>

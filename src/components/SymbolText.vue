<script setup lang="ts">
/**
 * 数式記号を表示する。
 * 2文字以上なら先頭を通常表示し、残りを下付き文字として表示する。
 */
defineProps<{
  value: string;
}>();
</script>

<template>
  <template v-if="value.length <= 1">
    {{ value }}
  </template>
  <template v-else>
    {{ value[0] }}<sub>{{ value.slice(1) }}</sub>
  </template>
</template>

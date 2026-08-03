<script setup lang="ts">
import { cn } from "@/utils/cn";

defineProps<{
  message: string;
  isVisible: boolean;
  className?: string;
}>();
</script>

<template>
  <div
    role="status"
    aria-live="polite"
    class="toast"
    :class="cn(isVisible ? 'toast--visible' : 'toast--hidden', className)"
  >
    {{ message }}
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.toast {
  @apply pointer-events-none fixed bottom-16 left-1/2 z-50 -translate-x-1/2 rounded-sm;
  @apply border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 shadow-lg;
  @apply transition-all duration-200 ease-out;
}

.toast--visible {
  @apply translate-y-0 opacity-100;
}

.toast--hidden {
  @apply translate-y-2 opacity-0;
}
</style>

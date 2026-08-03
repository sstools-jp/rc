<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>

<template>
  <section class="flex break-inside-avoid flex-col">
    <div
      class="relative z-10 -mb-4 ml-2 flex h-8 w-fit items-center rounded-xs border border-slate-300 bg-white px-3"
    >
      <h2 class="font-semibold text-slate-700">
        {{ title }}
      </h2>
    </div>
    <div
      aria-live="polite"
      class="mb-2 flex w-sm flex-col gap-4 rounded-sm border border-slate-300 bg-white p-4 pt-6"
    >
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>

<template>
  <section class="section-card">
    <div class="section-title-badge">
      <h2 class="section-title">
        {{ title }}
      </h2>
    </div>
    <div class="section-body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
@reference "tailwindcss";

.section-card {
  @apply flex break-inside-avoid flex-col;
}

.section-title-badge {
  @apply relative z-10 -mb-4 ml-2 flex h-8 w-fit items-center rounded-xs border border-slate-300 bg-white px-3;
}

.section-title {
  @apply font-semibold text-slate-700;
}

.section-body {
  @apply mb-2 flex w-sm flex-col gap-4 rounded-sm border border-slate-300 bg-white p-4 pt-6;
}
</style>

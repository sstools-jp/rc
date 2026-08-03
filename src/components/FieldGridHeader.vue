<script setup lang="ts"></script>

<template>
  <div class="grid-header">
    <div class="header-cell header-label">項目名</div>
    <div class="header-cell">記号</div>
    <div class="header-cell">単位</div>
    <div class="header-cell">入力値</div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.grid-header {
  @apply grid grid-cols-[minmax(0,1fr)_2.5rem_3rem_4.5rem] divide-x divide-slate-300 border-b border-slate-300 bg-slate-200/50 text-xs font-semibold tracking-wider text-slate-600 last:border-b-0;
}

.header-cell {
  @apply px-1 py-1 text-center;
}

.header-label {
  @apply px-2;
}
</style>

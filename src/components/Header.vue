<script setup lang="ts">
import { computed } from "vue";
import { FaBandsGithub } from "@kalimahapps/vue-icons/fa";

const appVersion = computed(() => __APP_VERSION__);
</script>

<template>
  <header class="header">
    <div class="header-inner">
      <h1 class="title">
        RC断面計算【円環断面】
        <small class="version">ver {{ appVersion }}</small>
      </h1>
      <div class="header-right">
        <a href="https://github.com/sstools-jp/rc" target="_blank" rel="noreferrer" class="github-link">
          <FaBandsGithub class="github-icon" aria-hidden="true" />
          sstools-jp/rc
        </a>
      </div>
    </div>
  </header>
</template>

<style scoped>
@reference "tailwindcss";

.header {
  @apply overflow-hidden border-b border-slate-300 bg-white px-4 pt-2 pb-1;
}

.header-inner {
  @apply flex items-end justify-between gap-4 sm:items-center;
}

.title {
  @apply flex flex-col gap-1 text-lg sm:flex-row sm:items-end;
}

.version {
  @apply pb-1 font-mono text-xs text-slate-500;
}

.header-right {
  @apply flex flex-col items-end gap-1 max-sm:pb-1;
}

.github-link {
  @apply inline-flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-slate-900;
}

.github-icon {
  @apply h-5 w-5;
}
</style>

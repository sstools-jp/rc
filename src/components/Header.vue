<script setup lang="ts">
import { computed } from "vue";
import { FaBandsGithub } from "@kalimahapps/vue-icons/fa";

const appVersion = computed(() => __APP_VERSION__);
</script>

<template>
  <header class="overflow-hidden border-b border-slate-300 bg-white px-4 pt-2 pb-1">
    <div class="flex items-end justify-between gap-4 sm:items-center">
      <h1 class="flex flex-col gap-1 text-lg sm:flex-row sm:items-end">
        RC断面計算【円環断面】
        <small class="pb-1 font-mono text-xs text-slate-500">ver {{ appVersion }}</small>
      </h1>
      <div class="flex flex-col items-end gap-1 max-sm:pb-1">
        <a
          href="https://github.com/sstools-jp/rc"
          target="_blank"
          rel="noreferrer"
          class="inline-flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-slate-900"
        >
          <FaBandsGithub
            class="h-5 w-5"
            aria-hidden="true"
          />
          sstools-jp/rc
        </a>
      </div>
    </div>
  </header>
</template>

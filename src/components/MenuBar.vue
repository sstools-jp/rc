<script setup lang="ts">
import AppButton from "@/components/AppButton.vue";
import { LuClipboardCopy, LuFileSearch, LuLink, LuPrinter } from "@kalimahapps/vue-icons/lu";

defineProps<{
  canCopy: boolean;
  copyError: string | null;
  shareUrlError: string | null;
  isPrintPreviewEnabled: boolean;
}>();

const emit = defineEmits<{
  print: [];
  openPrintPreview: [];
  copyClipboard: [];
  copyShareUrl: [];
}>();
</script>

<template>
  <nav class="flex flex-wrap items-center gap-1 border-b border-slate-300 bg-white px-4 py-1">
    <AppButton
      :icon="LuPrinter"
      :disabled="!isPrintPreviewEnabled"
      class="text-blue-700"
      @click="emit('print')"
    >
      印刷
    </AppButton>
    <AppButton
      :icon="LuFileSearch"
      :disabled="!isPrintPreviewEnabled"
      class="text-blue-700"
      @click="emit('openPrintPreview')"
    >
      印刷プレビュー
    </AppButton>
    <AppButton
      :icon="LuClipboardCopy"
      :disabled="!canCopy"
      @click="emit('copyClipboard')"
    >
      計算結果をコピー
    </AppButton>
    <AppButton
      :icon="LuLink"
      @click="emit('copyShareUrl')"
    >
      URLをコピー
    </AppButton>
    <p
      v-if="copyError"
      class="text-sm text-rose-600"
    >
      {{ copyError }}
    </p>
    <p
      v-if="shareUrlError"
      class="text-sm text-rose-600"
    >
      {{ shareUrlError }}
    </p>
  </nav>
</template>

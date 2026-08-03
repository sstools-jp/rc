<script setup lang="ts">
import { ref } from "vue";
import InputForm from "@/components/InputForm.vue";
import Header from "@/components/Header.vue";
import MenuBar from "@/components/MenuBar.vue";
import PrintPreviewContent from "@/components/PrintPreviewContent.vue";
import SectionPreviewPanel from "@/components/SectionPreviewPanel.vue";
import ResultPanel from "@/components/ResultPanel.vue";
import PrintPreviewModal from "@/components/PrintPreviewModal.vue";
import { useAnnularSectionPageState } from "@/composables/usePageState";
import { useAnnularSectionPreviewClipboard } from "@/composables/useAnnularSectionPreviewClipboard";
import Toast from "@/components/Toast.vue";
import { buildAnnularSectionShareUrl } from "@/utils/annular-section-page-state";
import { printElementContent } from "@/utils/print-preview-frame";
import { copyTextToClipboard } from "@/utils/clipboard";
import { useTransientToast } from "@/composables/useTransientToast";

const printPreviewContentRef = ref<HTMLDivElement | null>(null);
const { message: toastMessage, isVisible: toastIsVisible, showToast } = useTransientToast();
const shareUrlError = ref<string | null>(null);
const {
  form,
  committedForm,
  result,
  issues,
  isPrintPreviewOpen,
  sectionForceMode,
  handleSubmit,
  handleReset,
  updateField,
  commitField,
  updateSectionForceMode,
  openPrintPreview,
  closePrintPreview,
} = useAnnularSectionPageState();
const { canCopy, copyError, handleCopy } = useAnnularSectionPreviewClipboard({
  form: committedForm.value,
  sectionForceMode: sectionForceMode.value,
  result: result.value,
  onCopySuccess: () => showToast("クリップボードにコピーしました。"),
});

/** URL をコピーするハンドラー */
const handleCopyShareUrl = async () => {
  try {
    shareUrlError.value = null;
    const shareUrl = buildAnnularSectionShareUrl(form.value, sectionForceMode.value);
    await copyTextToClipboard(shareUrl);
    showToast("URLをコピーしました。");
  } catch {
    shareUrlError.value = "URLのコピーに失敗しました。";
  }
};

const handlePrint = async () => {
  const printRoot = printPreviewContentRef.value;

  if (!printRoot) {
    window.print();
    return;
  }

  try {
    await printElementContent(printRoot);
  } catch {
    window.print();
  }
};
</script>

<template>
  <div class="app-root">
    <Header />
    <MenuBar
      :can-copy="canCopy"
      :copy-error="copyError"
      :share-url-error="shareUrlError"
      :is-print-preview-enabled="result !== null"
      @print="handlePrint"
      @open-print-preview="openPrintPreview"
      @copy-clipboard="handleCopy"
      @copy-share-url="handleCopyShareUrl"
    />

    <!-- 印刷プレビュー -->
    <div aria-hidden="true" class="print-preview-hidden">
      <PrintPreviewContent
        ref="printPreviewContentRef"
        :form="committedForm"
        :section-force-mode="sectionForceMode"
        :result="result"
      />
    </div>

    <Toast v-if="toastMessage" :message="toastMessage" :is-visible="toastIsVisible" />

    <main class="app-main">
      <div class="app-columns">
        <!-- 入力フォームパネル -->
        <InputForm
          :form="form"
          :issues="issues"
          :section-force-mode="sectionForceMode"
          @submit="handleSubmit"
          @reset="handleReset"
          @change-field="(field, value) => updateField(field)(value)"
          @commit-field="(field, value) => commitField(field)(value)"
          @change-section-force-mode="updateSectionForceMode"
        />
        <!-- 結果表示パネル -->
        <ResultPanel :result="result" />
        <!-- 断面図プレビュー -->
        <SectionPreviewPanel :form="committedForm" :result="result" />
      </div>
    </main>

    <PrintPreviewModal
      :open="isPrintPreviewOpen"
      :form="committedForm"
      :section-force-mode="sectionForceMode"
      :result="result"
      @close="closePrintPreview"
    />
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.app-root {
  @apply min-h-screen bg-slate-100;
}

.print-preview-hidden {
  @apply fixed top-0 -left-2500 h-0 w-0 overflow-hidden;
}

.app-main {
  @apply flex w-full;
}

.app-columns {
  @apply m-4 columns-1 gap-2 min-[810px]:columns-2 min-[1210px]:columns-3;
}
</style>

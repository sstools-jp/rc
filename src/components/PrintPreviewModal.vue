<script setup lang="ts">
import { ref } from "vue";
import { Dialog, DialogPanel } from "@headlessui/vue";
import type { AnnularSectionResult } from "@/models/annular-section";
import type { FormState } from "@/forms/form-state";
import AppButton from "@/components/AppButton.vue";
import Toast from "@/components/Toast.vue";
import type { SectionForceMode } from "@/types/section-force-mode";
import PrintPreviewContent from "@/components/PrintPreviewContent.vue";
import { printElementContent } from "@/utils/print-preview-frame";
import { FePrinter, FeX } from "@kalimahapps/vue-icons/fe";
import { cn } from "@/utils/cn";
import { useAnnularSectionPreviewClipboard } from "@/composables/useAnnularSectionPreviewClipboard";
import { useTransientToast } from "@/composables/useTransientToast";
import { LuClipboardCopy } from "@kalimahapps/vue-icons/lu";

const props = defineProps<{
  /** モーダルの開閉状態 */
  open: boolean;
  /** フォームの状態 */
  form: FormState;
  /** 断面力モード */
  sectionForceMode: SectionForceMode;
  /** 計算結果 */
  result: AnnularSectionResult | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { message: toastMessage, isVisible: toastIsVisible, showToast } = useTransientToast();
const { canCopy, copyError, handleCopy } = useAnnularSectionPreviewClipboard({
  form: props.form,
  sectionForceMode: props.sectionForceMode,
  result: props.result,
  onCopySuccess: () => showToast("クリップボードにコピーしました。"),
});
const printContentRef = ref<{ rootRef: HTMLDivElement | null } | null>(null);

const handlePrintPreview = async () => {
  const printRoot = printContentRef.value?.rootRef;

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
  <Dialog
    :open="open"
    class="relative z-50 print:static print:z-auto"
    @close="emit('close')"
  >
    <div
      class="fixed inset-0 bg-slate-950/60 print:hidden"
      aria-hidden="true"
    />

    <div class="fixed inset-0 flex items-center justify-center sm:p-4 print:static print:block print:p-0">
      <DialogPanel
        :class="
          cn(
            'flex max-h-svh flex-col overflow-hidden bg-slate-100 shadow-2xl sm:max-h-[calc(100vh-2rem)] sm:max-w-5xl sm:rounded-sm',
            'print:max-h-none print:max-w-none print:overflow-visible print:rounded-none print:bg-white print:shadow-none',
          )
        "
      >
        <div class="flex flex-col gap-3 p-4 print:hidden">
          <div class="flex flex-row items-center gap-2">
            <div class="flex flex-row gap-2">
              <AppButton
                :icon="FePrinter"
                class="text-blue-700"
                @click="handlePrintPreview"
              >
                印刷
              </AppButton>
              <AppButton
                :icon="LuClipboardCopy"
                :disabled="!canCopy"
                @click="handleCopy"
              >
                <span class="sm:hidden">コピー</span>
                <span class="hidden sm:inline">クリップボードにコピー</span>
              </AppButton>
            </div>

            <div class="ml-auto flex flex-row items-center">
              <AppButton
                aria-label="閉じる"
                class="w-9 px-0"
                @click="emit('close')"
              >
                <FeX
                  class="h-6 w-6"
                  aria-hidden="true"
                />
              </AppButton>
            </div>
          </div>
          <p
            v-if="copyError"
            class="text-sm text-rose-600"
          >
            {{ copyError }}
          </p>
        </div>

        <Toast
          v-if="toastMessage"
          :message="toastMessage"
          :is-visible="toastIsVisible"
        />

        <div class="overflow-auto p-4 pt-0 print:overflow-visible print:p-0">
          <PrintPreviewContent
            ref="printContentRef"
            :form="form"
            :section-force-mode="sectionForceMode"
            :result="result"
          />
        </div>
      </DialogPanel>
    </div>
  </Dialog>
</template>

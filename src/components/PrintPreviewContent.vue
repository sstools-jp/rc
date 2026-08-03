<script setup lang="ts">
import { ref } from "vue";
import type { FormState } from "@/forms/form-state";
import type { AnnularSectionResult } from "@/models/annular-section";
import type { SectionForceMode } from "@/types/section-force-mode";
import PrintPreviewTable from "@/components/PrintPreviewTable.vue";
import { buildInputPreviewSections, buildResultPreviewSections } from "@/utils/print-preview-data";
import { cn } from "@/utils/cn";

const props = withDefaults(
  defineProps<{
    form: FormState;
    sectionForceMode: SectionForceMode;
    result: AnnularSectionResult | null;
    className?: string;
  }>(),
  {
    className: "",
  },
);

const rootRef = ref<HTMLDivElement | null>(null);

const inputSections = buildInputPreviewSections(props.form, props.sectionForceMode);
const resultSections = buildResultPreviewSections(props.result);

defineExpose<{
  rootRef: typeof rootRef;
}>({
  rootRef,
});
</script>

<template>
  <div ref="rootRef" class="print-preview-content" :class="cn(className)">
    <h4 class="print-preview-title">RC断面計算【円環断面】</h4>
    <PrintPreviewTable
      title="入力値"
      :sections="inputSections"
      value-header="入力値"
      :include-section-label="true"
    />

    <div class="print-preview-spacer" />

    <PrintPreviewTable
      title="計算結果"
      :sections="resultSections"
      value-header="算出値"
      :include-section-label="false"
    />
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.print-preview-content {
  @apply rounded-sm bg-white p-8 shadow-sm print:rounded-none print:p-0 print:shadow-none;
}

.print-preview-title {
  @apply mb-4 text-center text-xl font-semibold;
}

.print-preview-spacer {
  @apply h-8;
}
</style>

<script setup lang="ts">
import SymbolText from "@/components/SymbolText.vue";
import type { PrintPreviewSection } from "@/utils/print-preview-data";

defineProps<{
  title: string;
  sections: PrintPreviewSection[];
  valueHeader: string;
  includeSectionLabel: boolean;
}>();
</script>

<template>
  <section>
    <h5 class="print-table-title">
      {{ title }}
    </h5>

    <div class="print-table-wrapper">
      <table class="print-table">
        <thead>
          <tr class="print-table-header-row">
            <th :colspan="includeSectionLabel ? 2 : 1" class="print-table-header-cell" scope="col">項目</th>
            <th class="print-table-header-cell print-table-header-cell--symbol" scope="col">記号</th>
            <th class="print-table-header-cell print-table-header-cell--unit" scope="col">単位</th>
            <th class="print-table-header-cell print-table-header-cell--value" scope="col">
              {{ valueHeader }}
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="section in sections" :key="section.title">
            <tr
              v-for="(row, rowIndex) in section.rows"
              :key="`${section.title}-${row.symbol ?? row.label}`"
              class="print-table-row"
            >
              <td
                v-if="includeSectionLabel && rowIndex === 0"
                :rowspan="section.rows.length"
                class="print-table-section-label"
                style="writing-mode: vertical-rl; text-orientation: upright"
              >
                {{ section.title }}
              </td>
              <td class="print-table-cell">
                {{ row.label }}
              </td>
              <td class="print-table-cell print-table-cell--center">
                <SymbolText :value="row.symbol ?? '-'" />
              </td>
              <td class="print-table-cell print-table-cell--center">
                {{ row.unit ?? "-" }}
              </td>
              <td class="print-table-cell print-table-cell--right">
                {{ row.value }}
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
@reference "tailwindcss";

.print-table-title {
  @apply mb-2;
}

.print-table-wrapper {
  @apply max-w-full overflow-x-auto;
}

.print-table {
  @apply w-lg border-collapse border-2 border-slate-600 text-sm print:text-[12px];
}

.print-table-header-row {
  @apply bg-slate-200;
}

.print-table-header-cell {
  @apply border border-slate-600 px-1 py-0.5 text-center font-semibold;
}

.print-table-header-cell--symbol {
  @apply w-12;
}

.print-table-header-cell--unit {
  @apply w-18;
}

.print-table-header-cell--value {
  @apply w-24;
}

.print-table-row {
  @apply border border-slate-600;
}

.print-table-section-label {
  @apply border border-slate-600 bg-slate-50 text-center align-middle;
}

.print-table-cell {
  @apply border border-slate-600 px-1 py-0.5 font-mono;
}

.print-table-cell--center {
  @apply text-center;
}

.print-table-cell--right {
  @apply text-right;
}
</style>

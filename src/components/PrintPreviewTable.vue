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
    <h5 class="mb-2">
      {{ title }}
    </h5>

    <div class="max-w-full overflow-x-auto">
      <table class="w-lg border-collapse border-2 border-slate-600 text-sm print:text-[12px]">
        <thead>
          <tr class="bg-slate-200">
            <th
              :colspan="includeSectionLabel ? 2 : 1"
              class="border border-slate-600 px-1 py-0.5 text-center font-semibold"
              scope="col"
            >
              項目
            </th>
            <th
              class="w-12 border border-slate-600 px-1 py-0.5 text-center font-semibold"
              scope="col"
            >
              記号
            </th>
            <th
              class="w-18 border border-slate-600 px-1 py-0.5 text-center font-semibold"
              scope="col"
            >
              単位
            </th>
            <th
              class="w-24 border border-slate-600 px-1 py-0.5 text-center font-semibold"
              scope="col"
            >
              {{ valueHeader }}
            </th>
          </tr>
        </thead>
        <tbody>
          <template
            v-for="section in sections"
            :key="section.title"
          >
            <tr
              v-for="(row, rowIndex) in section.rows"
              :key="`${section.title}-${row.symbol ?? row.label}`"
              class="border border-slate-600"
            >
              <td
                v-if="includeSectionLabel && rowIndex === 0"
                :rowspan="section.rows.length"
                class="border border-slate-600 bg-slate-50 text-center align-middle"
                style="writing-mode: vertical-rl; text-orientation: upright"
              >
                {{ section.title }}
              </td>
              <td class="border border-slate-600 px-1 py-0.5 font-mono">
                {{ row.label }}
              </td>
              <td class="border border-slate-600 px-1 py-0.5 text-center font-mono">
                <SymbolText :value="row.symbol ?? '-'" />
              </td>
              <td class="border border-slate-600 px-1 py-0.5 text-center font-mono">
                {{ row.unit ?? "-" }}
              </td>
              <td class="border border-slate-600 px-1 py-0.5 text-right font-mono">
                {{ row.value }}
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </section>
</template>

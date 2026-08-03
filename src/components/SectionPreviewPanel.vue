<script setup lang="ts">
import type { FormState } from "@/forms/form-state";
import type { AnnularSectionResult } from "@/models/annular-section";
import CrossSectionPreview from "@/components/CrossSectionPreview.vue";
import SectionCard from "@/components/SectionCard.vue";

defineProps<{
  form: FormState;
  result: AnnularSectionResult | null;
}>();
</script>

<template>
  <SectionCard title="断面図">
    <CrossSectionPreview
      :form="form"
      :result="result"
    />
  </SectionCard>
</template>

<script setup lang="ts">
import FieldRow from "@/components/FieldRow.vue";
import FieldInput from "@/components/FieldInput.vue";
import FieldSelect from "@/components/FieldSelect.vue";
import type { FormState } from "@/forms/form-state";
import { REBAR_MATERIALS, getRebarYieldStrengthMm2 } from "@/models/rebar";

const props = defineProps<{
  label: string;
  form: FormState;
}>();

const emit = defineEmits<{
  changeField: [field: keyof FormState, value: string];
  commitField: [field: keyof FormState, value: string];
}>();

const isMaterialMode = props.form.rebarStrengthMode === "material";

const rebarMaterialOptions = REBAR_MATERIALS.map((material) => ({
  value: material.name,
  label: material.name,
}));

function handleMaterialChange(value: string) {
  emit("changeField", "rebarMaterialName", value);
  emit("commitField", "rebarMaterialName", value);
  const nextStrength = getRebarYieldStrengthMm2(value as (typeof REBAR_MATERIALS)[number]["name"]);
  emit("changeField", "rebarYieldStrength_NPerMm2", String(nextStrength));
  emit("commitField", "rebarYieldStrength_NPerMm2", String(nextStrength));
}
</script>

<template>
  <FieldRow
    :label="label"
    symbol="σsy"
    unit="N/mm²"
  >
    <FieldSelect
      v-if="isMaterialMode"
      :value="form.rebarMaterialName"
      :options="rebarMaterialOptions"
      @change="handleMaterialChange"
    />
    <FieldInput
      v-else
      :value="form.rebarYieldStrength_NPerMm2"
      @change="(v) => emit('changeField', 'rebarYieldStrength_NPerMm2', v)"
      @blur="(v) => emit('commitField', 'rebarYieldStrength_NPerMm2', v)"
    />
  </FieldRow>
</template>

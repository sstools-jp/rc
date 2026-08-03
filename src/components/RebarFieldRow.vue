<script setup lang="ts">
import FieldRow from "@/components/FieldRow.vue";
import FieldInput from "@/components/FieldInput.vue";
import FieldSelect from "@/components/FieldSelect.vue";
import type { FormState } from "@/forms/form-state";
import { REBAR_DIAMETERS_MM } from "@/models/rebar";

const props = defineProps<{
  label: string;
  form: FormState;
}>();

const emit = defineEmits<{
  changeField: [field: keyof FormState, value: string];
  commitField: [field: keyof FormState, value: string];
}>();

const isRound = props.form.rebarKind === "round";
const symbol = isRound ? "φ" : "D";
const unit = isRound ? "mm" : "-";

const rebarDiameterOptions = REBAR_DIAMETERS_MM.map((diameter) => ({
  value: String(diameter),
  label: `D${diameter}`,
}));

function handleChange(field: keyof FormState, value: string) {
  emit("changeField", field, value);
}

function handleCommit(field: keyof FormState, value: string) {
  emit("commitField", field, value);
}
</script>

<template>
  <FieldRow :label="label" :symbol="symbol" :unit="unit">
    <FieldInput
      v-if="isRound"
      :value="form.roundRebarDiameter_Mm"
      @change="(v) => handleChange('roundRebarDiameter_Mm', v)"
      @blur="(v) => handleCommit('roundRebarDiameter_Mm', v)"
    />
    <FieldSelect
      v-else
      :value="form.rebarDiameter_Mm"
      :options="rebarDiameterOptions"
      @change="
        (v) => {
          handleChange('rebarDiameter_Mm', v);
          handleCommit('rebarDiameter_Mm', v);
        }
      "
    />
  </FieldRow>
</template>

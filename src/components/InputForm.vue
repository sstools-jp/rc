<script setup lang="ts">
import AppButton from "@/components/AppButton.vue";
import MoreActionsMenu from "@/components/MoreActionsMenu.vue";
import type { SectionForceMode } from "@/types/section-force-mode";
import type { AnnularSectionValidationIssue } from "@/models/annular-section";
import { CONCRETE_DESIGN_STRENGTHS_N_PER_MM2 } from "@/models/concrete";
import type { FormState } from "@/forms/form-state";
import FieldGridHeader from "@/components/FieldGridHeader.vue";
import FieldInput from "@/components/FieldInput.vue";
import FieldRow from "@/components/FieldRow.vue";
import FieldSelect from "@/components/FieldSelect.vue";
import RebarFieldRow from "@/components/RebarFieldRow.vue";
import RebarStrengthFieldRow from "@/components/RebarStrengthFieldRow.vue";
import SectionCard from "@/components/SectionCard.vue";
import { usePersistedMaterialParamsEditable } from "@/composables/usePersistedMaterialParamsEditable";

const CONCRETE_DESIGN_STRENGTH_OPTIONS = CONCRETE_DESIGN_STRENGTHS_N_PER_MM2.map((strength) => ({
  value: String(strength),
  label: String(strength),
}));

const props = defineProps<{
  /** フォームの状態 */
  form: FormState;
  /** 入力の検証問題リスト */
  issues: AnnularSectionValidationIssue[];
  /** 断面力タイプ */
  sectionForceMode: SectionForceMode;
}>();

const emit = defineEmits<{
  submit: [event: Event];
  reset: [];
  changeField: [field: keyof FormState, value: string];
  commitField: [field: keyof FormState, value: string];
  changeSectionForceMode: [value: SectionForceMode];
}>();

const {
  youngRatioEditable,
  concreteStrengthFactorEditable,
  setYoungRatioEditable,
  setConcreteStrengthFactorEditable,
} = usePersistedMaterialParamsEditable();

/** 断面力のオプションメニュー */
const sectionForceMenuGroups = [
  {
    key: "section-force-type",
    label: "断面力タイプ",
    items: [
      {
        key: "sf-3",
        label: "3断面力",
        selected: props.sectionForceMode === "3",
        onClick: () => emit("changeSectionForceMode", "3"),
      },
      {
        key: "sf-6",
        label: "6断面力",
        selected: props.sectionForceMode === "6",
        onClick: () => emit("changeSectionForceMode", "6"),
      },
    ],
  },
];

/** 寸法・鉄筋のオプションメニュー */
const geometryMenuGroups = [
  {
    key: "rebar-kind",
    label: "鉄筋径の種類",
    items: [
      {
        key: "rebar-db",
        label: "異形棒鋼 (DB)",
        selected: props.form.rebarKind === "deformed",
        onClick: () => {
          emit("changeField", "rebarKind", "deformed");
          emit("commitField", "rebarKind", "deformed");
        },
      },
      {
        key: "rebar-rb",
        label: "丸鋼 (RB)",
        selected: props.form.rebarKind === "round",
        onClick: () => {
          emit("changeField", "rebarKind", "round");
          emit("commitField", "rebarKind", "round");
        },
      },
    ],
  },
];

/** 諸係数のオプションメニュー */
const materialParamsMenuGroups = [
  {
    key: "rebar-strength-mode",
    label: "鉄筋降伏強度",
    items: [
      {
        key: "strength-material",
        label: "材質選択",
        selected: props.form.rebarStrengthMode === "material",
        onClick: () => {
          emit("changeField", "rebarStrengthMode", "material");
          emit("commitField", "rebarStrengthMode", "material");
        },
      },
      {
        key: "strength-direct",
        label: "数値入力",
        selected: props.form.rebarStrengthMode === "numeric",
        onClick: () => {
          emit("changeField", "rebarStrengthMode", "numeric");
          emit("commitField", "rebarStrengthMode", "numeric");
        },
      },
    ],
  },
  {
    key: "change-enable",
    label: "編集を有効化",
    items: [
      {
        key: "young-ratio",
        label: "ヤング係数比",
        selected: youngRatioEditable.value,
        onClick: () => setYoungRatioEditable((current) => !current),
      },
      {
        key: "concrete-strength-factor",
        label: "コンクリート強度補正係数",
        selected: concreteStrengthFactorEditable.value,
        onClick: () => setConcreteStrengthFactorEditable((current) => !current),
      },
    ],
  },
];

function handleChangeField(field: keyof FormState, value: string) {
  emit("changeField", field, value);
}

function handleCommitField(field: keyof FormState, value: string) {
  emit("commitField", field, value);
}

function handleSubmit(event: Event) {
  emit("submit", event);
}
</script>

<template>
  <SectionCard title="入力値">
    <form
      class="flex flex-col gap-1"
      @submit.prevent="handleSubmit"
    >
      <div class="flex items-start justify-between">
        <h3 class="text-sm text-slate-700">
          断面力
        </h3>
        <MoreActionsMenu :groups="sectionForceMenuGroups" />
      </div>
      <div class="overflow-hidden border border-slate-400 bg-slate-50/80 text-sm">
        <FieldGridHeader />
        <template v-if="sectionForceMode === '3'">
          <FieldRow
            label="曲げモーメント"
            symbol="M"
            unit="kN.m"
          >
            <FieldInput
              :value="form.my_KNm"
              @change="(v) => handleChangeField('my_KNm', v)"
              @blur="(v) => handleCommitField('my_KNm', v)"
            />
          </FieldRow>
          <FieldRow
            label="せん断力"
            symbol="S"
            unit="kN"
          >
            <FieldInput
              :value="form.fz_KN"
              @change="(v) => handleChangeField('fz_KN', v)"
              @blur="(v) => handleCommitField('fz_KN', v)"
            />
          </FieldRow>
          <FieldRow
            label="軸力（引張を正）"
            symbol="N"
            unit="kN"
          >
            <FieldInput
              :value="form.fx_KN"
              @change="(v) => handleChangeField('fx_KN', v)"
              @blur="(v) => handleCommitField('fx_KN', v)"
            />
          </FieldRow>
        </template>
        <template v-else-if="sectionForceMode === '6'">
          <FieldRow
            label="軸力（引張を正）"
            symbol="Fx"
            unit="kN"
          >
            <FieldInput
              :value="form.fx_KN"
              @change="(v) => handleChangeField('fx_KN', v)"
              @blur="(v) => handleCommitField('fx_KN', v)"
            />
          </FieldRow>
          <FieldRow
            label="せん断力（面外）"
            symbol="Fy"
            unit="kN"
          >
            <FieldInput
              :value="form.fy_KN"
              @change="(v) => handleChangeField('fy_KN', v)"
              @blur="(v) => handleCommitField('fy_KN', v)"
            />
          </FieldRow>
          <FieldRow
            label="せん断力（面内）"
            symbol="Fz"
            unit="kN"
          >
            <FieldInput
              :value="form.fz_KN"
              @change="(v) => handleChangeField('fz_KN', v)"
              @blur="(v) => handleCommitField('fz_KN', v)"
            />
          </FieldRow>
          <FieldRow
            label="ねじりモーメント"
            symbol="Mx"
            unit="kN.m"
          >
            <FieldInput
              :value="form.mx_KNm"
              @change="(v) => handleChangeField('mx_KNm', v)"
              @blur="(v) => handleCommitField('mx_KNm', v)"
            />
          </FieldRow>
          <FieldRow
            label="曲げモーメント（面内）"
            symbol="My"
            unit="kN.m"
          >
            <FieldInput
              :value="form.my_KNm"
              @change="(v) => handleChangeField('my_KNm', v)"
              @blur="(v) => handleCommitField('my_KNm', v)"
            />
          </FieldRow>
          <FieldRow
            label="曲げモーメント（面外）"
            symbol="Mz"
            unit="kN.m"
          >
            <FieldInput
              :value="form.mz_KNm"
              @change="(v) => handleChangeField('mz_KNm', v)"
              @blur="(v) => handleCommitField('mz_KNm', v)"
            />
          </FieldRow>
        </template>
      </div>

      <div class="mt-4 flex items-center justify-between">
        <h3 class="text-sm text-slate-700">
          寸法・鉄筋
        </h3>
        <MoreActionsMenu :groups="geometryMenuGroups" />
      </div>
      <div class="overflow-hidden border border-slate-400 bg-slate-50/80 text-sm">
        <FieldGridHeader />
        <div>
          <FieldRow
            label="外径半径"
            symbol="r"
            unit="mm"
          >
            <FieldInput
              :value="form.outerRadius_Mm"
              @change="(v) => handleChangeField('outerRadius_Mm', v)"
              @blur="(v) => handleCommitField('outerRadius_Mm', v)"
            />
          </FieldRow>
          <FieldRow
            label="内径半径"
            symbol="r0"
            unit="mm"
          >
            <FieldInput
              :value="form.innerRadius_Mm"
              @change="(v) => handleChangeField('innerRadius_Mm', v)"
              @blur="(v) => handleCommitField('innerRadius_Mm', v)"
            />
          </FieldRow>
          <FieldRow
            label="鉄筋位置（半径）"
            symbol="rs"
            unit="mm"
          >
            <FieldInput
              :value="form.rebarRadius_Mm"
              @change="(v) => handleChangeField('rebarRadius_Mm', v)"
              @blur="(v) => handleCommitField('rebarRadius_Mm', v)"
            />
          </FieldRow>
          <RebarFieldRow
            label="鉄筋径"
            :form="form"
            @change-field="handleChangeField"
            @commit-field="handleCommitField"
          />
          <FieldRow
            label="鉄筋本数"
            symbol="H"
            unit="本"
          >
            <FieldInput
              :value="form.barCount"
              input-mode="decimal"
              @change="(v) => handleChangeField('barCount', v)"
              @blur="(v) => handleCommitField('barCount', v)"
            />
          </FieldRow>
        </div>
      </div>

      <div class="mt-4 flex items-center justify-between">
        <h3 class="text-sm text-slate-700">
          諸係数
        </h3>
        <MoreActionsMenu :groups="materialParamsMenuGroups" />
      </div>
      <div class="overflow-hidden border border-slate-400 bg-slate-50/80 text-sm">
        <FieldGridHeader />
        <div>
          <RebarStrengthFieldRow
            label="鉄筋降伏強度"
            :form="form"
            @change-field="handleChangeField"
            @commit-field="handleCommitField"
          />
          <FieldRow
            label="コンクリート設計基準強度"
            symbol="σck"
            unit="N/mm²"
          >
            <FieldSelect
              :value="form.concreteDesignStrength_NPerMm2"
              :options="CONCRETE_DESIGN_STRENGTH_OPTIONS"
              @change="
                (v) => {
                  handleChangeField('concreteDesignStrength_NPerMm2', v);
                  handleCommitField('concreteDesignStrength_NPerMm2', v);
                }
              "
            />
          </FieldRow>
          <FieldRow
            label="ヤング係数比"
            symbol="n"
            unit="-"
          >
            <FieldInput
              :value="form.youngRatio"
              :read-only="!youngRatioEditable"
              @change="(v) => handleChangeField('youngRatio', v)"
              @blur="(v) => handleCommitField('youngRatio', v)"
            />
          </FieldRow>
          <FieldRow
            label="コンクリート強度補正係数"
            symbol="kc"
            unit="-"
          >
            <FieldInput
              :value="form.concreteStrengthFactor"
              :read-only="!concreteStrengthFactorEditable"
              @change="(v) => handleChangeField('concreteStrengthFactor', v)"
              @blur="(v) => handleCommitField('concreteStrengthFactor', v)"
            />
          </FieldRow>
        </div>
      </div>

      <div class="mt-2 flex flex-row gap-3">
        <AppButton
          type="submit"
          variant="primary"
        >
          計算
        </AppButton>
        <AppButton @click="emit('reset')">
          リセット
        </AppButton>
      </div>
    </form>

    <div
      v-if="issues.length > 0"
      aria-live="polite"
      class="border border-rose-200 bg-rose-50 px-3 py-3 text-rose-900"
    >
      <p class="text-sm font-semibold">
        入力エラー
      </p>
      <ul class="mt-2 list-disc space-y-1 ps-5 text-sm">
        <li
          v-for="issue in issues"
          :key="`${String(issue.field)}-${issue.message}`"
        >
          {{ issue.message }}
        </li>
      </ul>
    </div>
    <p
      v-else
      class="rounded-xs border border-sky-200 bg-sky-50 px-3 py-3 text-sm text-sky-900"
    >
      エラーはありません。
    </p>
  </SectionCard>
</template>

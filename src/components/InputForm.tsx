import type { SubmitEventHandler } from "react";
import { AppButton } from "@/components/AppButton";
import MoreActionsMenu from "@/components/MoreActionsMenu";
import type { SectionForceMode } from "@/components/SectionForceModeSelector";
import { type AnnularSectionValidationIssue } from "@/models/annular-section";
import { CONCRETE_DESIGN_STRENGTHS_N_PER_MM2 } from "@/models/concrete";
import type { FormState } from "@/forms/form-state";
import {
  FieldGridHeader,
  FieldInput,
  FieldRow,
  FieldSelect,
  RebarFieldRow,
  RebarStrengthFieldRow,
} from "@/components/InputFormFields";
import { SectionCard } from "@/components/SectionCard";

const CONCRETE_DESIGN_STRENGTH_OPTIONS = CONCRETE_DESIGN_STRENGTHS_N_PER_MM2.map((strength) => ({
  value: String(strength),
  label: String(strength),
}));

type AnnularSectionInputFormProps = {
  /** フォームの状態 */
  form: FormState;
  /** 入力の検証問題リスト */
  issues: AnnularSectionValidationIssue[];
  /** フォームの送信イベントハンドラ */
  onSubmit: SubmitEventHandler<HTMLFormElement>;
  /** フォームのリセットハンドラ */
  onReset: () => void;
  /** フォームのフィールド更新ハンドラ */
  onChangeField: (field: keyof FormState) => (value: string) => void;
  /** フォームのフィールド確定ハンドラ */
  onCommitField: (field: keyof FormState) => (value: string) => void;
  /** 断面力タイプ */
  sectionForceMode: SectionForceMode;
  /** 断面力タイプ更新ハンドラ */
  onChangeSectionForceMode: (value: SectionForceMode) => void;
};

/** 入力フォームパネル */
export function AnnularSectionInputFormPanel({
  form,
  issues,
  onSubmit,
  onReset,
  onChangeField,
  onCommitField,
  sectionForceMode,
  onChangeSectionForceMode,
}: AnnularSectionInputFormProps) {
  const sectionForceMenuGroups = [
    {
      key: "section-force-type",
      label: "断面力タイプ",
      items: [
        {
          key: "sf-3",
          label: "3断面力",
          selected: sectionForceMode === "3",
          onClick: () => onChangeSectionForceMode("3" as SectionForceMode),
        },
        {
          key: "sf-6",
          label: "6断面力",
          selected: sectionForceMode === "6",
          onClick: () => onChangeSectionForceMode("6" as SectionForceMode),
        },
      ],
    },
  ];

  const geometryMenuGroups = [
    {
      key: "rebar-kind",
      label: "鉄筋径の種類",
      items: [
        {
          key: "rebar-db",
          label: "異形棒鋼 (DB)",
          selected: form.rebarKind === "deformed",
          onClick: () => {
            onChangeField("rebarKind")("deformed");
            onCommitField("rebarKind")("deformed");
          },
        },
        {
          key: "rebar-rb",
          label: "丸鋼 (RB)",
          selected: form.rebarKind === "round",
          onClick: () => {
            onChangeField("rebarKind")("round");
            onCommitField("rebarKind")("round");
          },
        },
      ],
    },
    {
      key: "rebar-strength-mode",
      label: "鉄筋降伏強度",
      items: [
        {
          key: "strength-material",
          label: "材質選択",
          selected: form.rebarStrengthMode === "material",
          onClick: () => {
            onChangeField("rebarStrengthMode")("material");
            onCommitField("rebarStrengthMode")("material");
          },
        },
        {
          key: "strength-direct",
          label: "直接入力",
          selected: form.rebarStrengthMode === "direct",
          onClick: () => {
            onChangeField("rebarStrengthMode")("direct");
            onCommitField("rebarStrengthMode")("direct");
          },
        },
      ],
    },
  ];

  return (
    <SectionCard title="入力値">
      <form onSubmit={onSubmit} className="flex flex-col gap-1">
        <div className="flex items-start justify-between">
          <h3 className="text-sm text-slate-700">断面力</h3>
          <MoreActionsMenu groups={sectionForceMenuGroups} />
        </div>
        <div className="overflow-hidden border border-slate-400 bg-slate-50/80 text-sm">
          <FieldGridHeader />
          {sectionForceMode === "3" && (
            <>
              <FieldRow label="曲げモーメント" symbol="M" unit="kN.m">
                <FieldInput
                  value={form.my_KNm}
                  onChange={onChangeField("my_KNm")}
                  onBlur={onCommitField("my_KNm")}
                />
              </FieldRow>
              <FieldRow label="せん断力" symbol="S" unit="kN">
                <FieldInput
                  value={form.fz_KN}
                  onChange={onChangeField("fz_KN")}
                  onBlur={onCommitField("fz_KN")}
                />
              </FieldRow>
              <FieldRow label="軸力（引張を正）" symbol="N" unit="kN">
                <FieldInput
                  value={form.fx_KN}
                  onChange={onChangeField("fx_KN")}
                  onBlur={onCommitField("fx_KN")}
                />
              </FieldRow>
            </>
          )}
          {sectionForceMode === "6" && (
            <>
              <FieldRow label="軸力" symbol="Fx" unit="kN">
                <FieldInput
                  value={form.fx_KN}
                  onChange={onChangeField("fx_KN")}
                  onBlur={onCommitField("fx_KN")}
                />
              </FieldRow>
              <FieldRow label="せん断力（面外）" symbol="Fy" unit="kN">
                <FieldInput
                  value={form.fy_KN}
                  onChange={onChangeField("fy_KN")}
                  onBlur={onCommitField("fy_KN")}
                />
              </FieldRow>
              <FieldRow label="せん断力（面内）" symbol="Fz" unit="kN">
                <FieldInput
                  value={form.fz_KN}
                  onChange={onChangeField("fz_KN")}
                  onBlur={onCommitField("fz_KN")}
                />
              </FieldRow>
              <FieldRow label="ねじりモーメント" symbol="Mx" unit="kN.m">
                <FieldInput
                  value={form.mx_KNm}
                  onChange={onChangeField("mx_KNm")}
                  onBlur={onCommitField("mx_KNm")}
                />
              </FieldRow>
              <FieldRow label="曲げモーメント（面内）" symbol="My" unit="kN.m">
                <FieldInput
                  value={form.my_KNm}
                  onChange={onChangeField("my_KNm")}
                  onBlur={onCommitField("my_KNm")}
                />
              </FieldRow>
              <FieldRow label="曲げモーメント（面外）" symbol="Mz" unit="kN.m">
                <FieldInput
                  value={form.mz_KNm}
                  onChange={onChangeField("mz_KNm")}
                  onBlur={onCommitField("mz_KNm")}
                />
              </FieldRow>
            </>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <h3 className="text-sm text-slate-700">寸法・鉄筋</h3>
          <MoreActionsMenu groups={geometryMenuGroups} />
        </div>
        <div className="overflow-hidden border border-slate-400 bg-slate-50/80 text-sm">
          <FieldGridHeader />
          <div>
            <FieldRow label="外径半径" symbol="r" unit="mm">
              <FieldInput
                value={form.outerRadius_Mm}
                onChange={onChangeField("outerRadius_Mm")}
                onBlur={onCommitField("outerRadius_Mm")}
              />
            </FieldRow>
            <FieldRow label="内径半径" symbol="r0" unit="mm">
              <FieldInput
                value={form.innerRadius_Mm}
                onChange={onChangeField("innerRadius_Mm")}
                onBlur={onCommitField("innerRadius_Mm")}
              />
            </FieldRow>
            <FieldRow label="鉄筋位置（有効半径）" symbol="rs" unit="mm">
              <FieldInput
                value={form.rebarRadius_Mm}
                onChange={onChangeField("rebarRadius_Mm")}
                onBlur={onCommitField("rebarRadius_Mm")}
              />
            </FieldRow>
            <RebarFieldRow
              label="鉄筋径"
              form={form}
              onChangeField={onChangeField}
              onCommitField={onCommitField}
            />
            <FieldRow label="鉄筋本数" symbol="H" unit="本">
              <FieldInput
                value={form.barCount}
                onChange={onChangeField("barCount")}
                onBlur={onCommitField("barCount")}
                inputMode="decimal"
              />
            </FieldRow>
            <RebarStrengthFieldRow
              label="鉄筋降伏強度"
              form={form}
              onChangeField={onChangeField}
              onCommitField={onCommitField}
            />
            <FieldRow label="コンクリート設計基準強度" symbol="σck" unit="N/mm²">
              <FieldSelect
                value={form.concreteDesignStrength_NPerMm2}
                onChange={(value) => {
                  onChangeField("concreteDesignStrength_NPerMm2")(value);
                  onCommitField("concreteDesignStrength_NPerMm2")(value);
                }}
                options={CONCRETE_DESIGN_STRENGTH_OPTIONS}
              />
            </FieldRow>
            <FieldRow label="ヤング係数比" symbol="n" unit="-">
              <FieldInput
                value={form.youngRatio}
                onChange={onChangeField("youngRatio")}
                onBlur={onCommitField("youngRatio")}
              />
            </FieldRow>
            <FieldRow label="コンクリート強度補正係数" symbol="kc" unit="-">
              <FieldInput
                value={form.concreteStrengthFactor}
                onChange={onChangeField("concreteStrengthFactor")}
                onBlur={onCommitField("concreteStrengthFactor")}
              />
            </FieldRow>
          </div>
        </div>

        <div className="mt-2 flex flex-row gap-3">
          <AppButton type="submit" variant="primary">
            計算
          </AppButton>
          <AppButton onClick={onReset}>リセット</AppButton>
        </div>
      </form>

      {issues.length > 0 ? (
        <div aria-live="polite" className="border border-rose-200 bg-rose-50 px-3 py-3 text-rose-900">
          <p className="text-sm font-semibold">入力エラー</p>
          <ul className="mt-2 list-disc space-y-1 ps-5 text-sm">
            {issues.map((issue) => (
              <li key={`${String(issue.field)}-${issue.message}`}>{issue.message}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="rounded-xs border border-sky-200 bg-sky-50 px-3 py-3 text-sm text-sky-900">
          エラーはありません。
        </p>
      )}
    </SectionCard>
  );
}

export default AnnularSectionInputFormPanel;

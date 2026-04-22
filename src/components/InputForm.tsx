import type { ReactNode, SubmitEventHandler } from "react";
import { AppButton } from "@/components/AppButton";
import { SymbolText } from "@/components/SymbolText";
import { SectionForceModeSelector, type SectionForceMode } from "@/components/SectionForceModeSelector";
import { type AnnularSectionValidationIssue } from "@/model/annular-section";
import { CONCRETE_DESIGN_STRENGTHS_N_PER_MM2 } from "@/model/concrete";
import { REBAR_DIAMETERS_MM } from "@/model/rebar";
import type { FormState } from "@/forms/form-state";
import { cn } from "@/utils/cn";

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
  return (
    <section className="flex w-md flex-col gap-4 rounded-sm border border-slate-300 bg-white p-5">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <section className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-4">
            <h2>断面力</h2>
            <SectionForceModeSelector value={sectionForceMode} onChange={onChangeSectionForceMode} />
          </div>
          <div className="overflow-hidden border border-slate-400 bg-slate-50/80 text-sm">
            <FieldGridHeader />
            {/* 3断面力 */}
            {sectionForceMode === "3" && (
              <div>
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
              </div>
            )}
            {/* 6断面力 */}
            {sectionForceMode === "6" && (
              <div>
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
              </div>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-1">
          <h2>寸法・鉄筋</h2>
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
              <RebarFieldRow form={form} onChangeField={onChangeField} onCommitField={onCommitField} />
              <FieldRow label="鉄筋本数" symbol="H" unit="本">
                <FieldInput
                  value={form.barCount}
                  onChange={onChangeField("barCount")}
                  onBlur={onCommitField("barCount")}
                  inputMode="decimal"
                />
              </FieldRow>
              <FieldRow label="鉄筋降伏強度" symbol="σsy" unit="N/mm²">
                <FieldInput
                  value={form.rebarYieldStrength_NPerMm2}
                  onChange={onChangeField("rebarYieldStrength_NPerMm2")}
                  onBlur={onCommitField("rebarYieldStrength_NPerMm2")}
                />
              </FieldRow>
              <FieldRow label="コンクリート設計基準強度" symbol="σck" unit="N/mm²">
                <FieldSelect
                  value={form.concreteDesignStrength_NPerMm2}
                  onChange={(value) => {
                    onChangeField("concreteDesignStrength_NPerMm2")(value);
                    onCommitField("concreteDesignStrength_NPerMm2")(value);
                  }}
                  options={CONCRETE_DESIGN_STRENGTHS_N_PER_MM2.map((strength) => ({
                    value: String(strength),
                    label: String(strength),
                  }))}
                />
              </FieldRow>
              <FieldRow label="ヤング係数比" symbol="n" unit="-">
                <FieldInput
                  value={form.youngRatio}
                  onChange={onChangeField("youngRatio")}
                  onBlur={onCommitField("youngRatio")}
                />
              </FieldRow>
            </div>
          </div>
        </section>

        <div className="flex flex-row gap-3">
          <AppButton type="submit" variant="primary">
            計算
          </AppButton>
          <AppButton onClick={onReset}>リセット</AppButton>
        </div>
      </form>

      {issues.length > 0 ? (
        <div aria-live="polite" className="border border-rose-200 bg-rose-50 px-3 py-3 text-rose-900">
          <p className="text-sm font-semibold">入力エラー</p>
          <ul className="mt-2 space-y-1 text-sm">
            {issues.map((issue) => (
              <li key={`${issue.field}-${issue.message}`}>{issue.message}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="rounded-xs border border-sky-200 bg-sky-50 px-3 py-3 text-sm text-sky-900">
          「計算」を押すと計算結果が表示されます。
        </p>
      )}
    </section>
  );
}

type FieldRowProps = {
  /** 項目の名称 */
  label: string;
  /** 項目の記号 */
  symbol: string;
  /** 項目の単位 */
  unit: string;
  children: ReactNode;
};

/** 入力用の行コンポーネント */
function FieldRow({ label, symbol, unit, children }: FieldRowProps) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_3rem_4rem_6rem] divide-x divide-slate-400 border-b border-slate-400 last:border-b-0">
      <div className="px-2 py-1">{label}</div>
      <div className="px-1 py-1 text-center font-mono">
        <SymbolText value={symbol} />
      </div>
      <div className="px-1 py-1 text-center font-mono">{unit}</div>
      <div className="bg-white">{children}</div>
    </div>
  );
}

function FieldGridHeader() {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_3rem_4rem_6rem] divide-x divide-slate-400 border-b border-slate-400 bg-slate-200/50 text-xs font-semibold text-slate-600">
      <div className="px-2 py-1 text-center">項目名</div>
      <div className="px-1 py-1 text-center">記号</div>
      <div className="px-1 py-1 text-center">単位</div>
      <div className="px-1 py-1 text-center">入力値</div>
    </div>
  );
}

type RebarFieldRowProps = {
  form: FormState;
  onChangeField: (field: keyof FormState) => (value: string) => void;
  onCommitField: (field: keyof FormState) => (value: string) => void;
};

/** 鉄筋径入力用のコンポーネント */
function RebarFieldRow({ form, onChangeField, onCommitField }: RebarFieldRowProps) {
  const isRound = form.rebarKind === "round";
  const symbol = isRound ? "φ" : "D";
  const unit = isRound ? "mm" : "-";

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_3rem_4rem_6rem] divide-x divide-slate-400 border-b border-slate-400 last:border-b-0">
      {/* 項目名 */}
      <div className="px-2 py-1 align-top">
        <div className="flex flex-col gap-1">
          <span>鉄筋径</span>
          <div className="flex flex-wrap gap-x-3 text-xs text-slate-700">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="rebarKind"
                value="deformed"
                checked={!isRound}
                onChange={(event) => {
                  onChangeField("rebarKind")(event.target.value);
                  onCommitField("rebarKind")(event.target.value);
                }}
              />
              異形棒鋼
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="rebarKind"
                value="round"
                checked={isRound}
                onChange={(event) => {
                  onChangeField("rebarKind")(event.target.value);
                  onCommitField("rebarKind")(event.target.value);
                }}
              />
              丸鋼
            </label>
          </div>
        </div>
      </div>
      {/* 記号 */}
      <div className="flex items-center justify-center px-1 py-1 text-center font-mono">
        <SymbolText value={symbol} />
      </div>
      {/* 単位 */}
      <div className="flex items-center justify-center px-1 py-1 text-center font-mono">{unit}</div>
      {/* 入力値 */}
      <div className="bg-white">
        {isRound ? (
          // 丸鋼の場合は数値入力
          <FieldInput
            value={form.roundRebarDiameter_Mm}
            onChange={onChangeField("roundRebarDiameter_Mm")}
            onBlur={onCommitField("roundRebarDiameter_Mm")}
          />
        ) : (
          // 異形棒鋼の場合はセレクトボックス
          <FieldSelect
            value={form.rebarDiameter_Mm}
            onChange={(value) => {
              onChangeField("rebarDiameter_Mm")(value);
              onCommitField("rebarDiameter_Mm")(value);
            }}
            options={REBAR_DIAMETERS_MM.map((diameter) => ({
              value: String(diameter),
              label: `D${diameter}`,
            }))}
          />
        )}
      </div>
    </div>
  );
}

type FieldInputProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur: (value: string) => void;
  inputMode?: "decimal" | "numeric";
};

/** 数値入力用のコンポーネント */
function FieldInput({ value, onChange, onBlur, inputMode = "decimal" }: FieldInputProps) {
  const className = cn(
    "block h-full w-full border border-transparent [appearance:textfield] px-1 py-0.5 text-right font-mono outline-none box-border placeholder:text-slate-400",
    "focus:border-amber-500 focus:ring-2 focus:ring-inset focus:ring-amber-500/15",
    "[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
  );

  return (
    <input
      type="number"
      inputMode={inputMode}
      step="any"
      className={className}
      value={value}
      onFocus={(event) => {
        event.currentTarget.select();
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
          event.preventDefault();
        }
      }}
      onWheel={(event) => event.currentTarget.blur()}
      onChange={(event) => onChange(event.target.value)}
      onBlur={(event) => onBlur(event.currentTarget.value)}
    />
  );
}

type FieldSelectOption = {
  value: string;
  label: string;
};

type FieldSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: Array<FieldSelectOption>;
};

/** 選択入力用のコンポーネント */
function FieldSelect({ value, onChange, options }: FieldSelectProps) {
  const className = cn(
    "block h-full w-full border border-transparent px-1 py-0.5 text-right font-mono outline-none box-border placeholder:text-slate-400",
    "focus:border-amber-500 focus:ring-2 focus:ring-inset focus:ring-amber-500/15",
  );

  return (
    <select className={className} value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

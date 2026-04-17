import clsx from "clsx";
import type { ReactNode, SubmitEventHandler } from "react";
import { AppButton } from "@/components/AppButton";
import { SymbolText } from "@/components/SymbolText";
import { SectionForceModeSelector, type SectionForceMode } from "@/components/SectionForceModeSelector";
import { type AnnularSectionValidationIssue } from "@/model/annular-section";
import { REBAR_DIAMETERS_MM } from "@/model/rebar";
import type { FormState } from "@/forms/form-state";

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
  sectionForceMode,
  onChangeSectionForceMode,
}: AnnularSectionInputFormProps) {
  return (
    <section className="flex w-120 flex-col gap-4 rounded-sm border border-slate-300 bg-white p-5">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <section className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl">断面力</h2>
            <SectionForceModeSelector value={sectionForceMode} onChange={onChangeSectionForceMode} />
          </div>
          <table className="border-collapse overflow-hidden border border-slate-400 bg-slate-50/80">
            <thead className="bg-slate-200/50 text-sm">
              <tr className="border-b border-slate-400 text-slate-500">
                <th scope="col" className="border-x border-slate-400 py-1">
                  項目名
                </th>
                <th scope="col" className="border-x border-slate-400 py-1">
                  記号
                </th>
                <th scope="col" className="border-x border-slate-400 py-1">
                  単位
                </th>
                <th scope="col" className="border-x border-slate-400 py-1">
                  入力値
                </th>
              </tr>
            </thead>
            {/* 3断面力 */}
            {sectionForceMode === "3" && (
              <tbody className="text-md">
                <FieldRow label="曲げモーメント" symbol="M" unit="kN.m">
                  <FieldInput value={form.myKNm} onChange={onChangeField("myKNm")} />
                </FieldRow>
                <FieldRow label="せん断力" symbol="S" unit="kN">
                  <FieldInput value={form.fzKN} onChange={onChangeField("fzKN")} />
                </FieldRow>
                <FieldRow label="軸力（引張を正）" symbol="N" unit="kN">
                  <FieldInput value={form.fxKN} onChange={onChangeField("fxKN")} />
                </FieldRow>
              </tbody>
            )}
            {/* 6断面力 */}
            {sectionForceMode === "6" && (
              <tbody className="text-md">
                <FieldRow label="軸力" symbol="Fx" unit="kN">
                  <FieldInput value={form.fxKN} onChange={onChangeField("fxKN")} />
                </FieldRow>
                <FieldRow label="せん断力（面外）" symbol="Fy" unit="kN">
                  <FieldInput value={form.fyKN} onChange={onChangeField("fyKN")} />
                </FieldRow>
                <FieldRow label="せん断力（面内）" symbol="Fz" unit="kN">
                  <FieldInput value={form.fzKN} onChange={onChangeField("fzKN")} />
                </FieldRow>
                <FieldRow label="ねじりモーメント" symbol="Mx" unit="kN.m">
                  <FieldInput value={form.mxKNm} onChange={onChangeField("mxKNm")} />
                </FieldRow>
                <FieldRow label="曲げモーメント（面内）" symbol="My" unit="kN.m">
                  <FieldInput value={form.myKNm} onChange={onChangeField("myKNm")} />
                </FieldRow>
                <FieldRow label="曲げモーメント（面外）" symbol="Mz" unit="kN.m">
                  <FieldInput value={form.mzKNm} onChange={onChangeField("mzKNm")} />
                </FieldRow>
              </tbody>
            )}
          </table>
        </section>

        <section className="flex flex-col gap-1">
          <h2 className="text-xl">寸法・鉄筋</h2>
          <table className="border-collapse overflow-hidden border border-slate-400 bg-slate-50/80">
            <thead className="bg-slate-200/50 text-sm">
              <tr className="border-b border-slate-400 text-slate-500">
                <th scope="col" className="border-x border-slate-400 py-1">
                  項目名
                </th>
                <th scope="col" className="border-x border-slate-400 py-1">
                  記号
                </th>
                <th scope="col" className="border-x border-slate-400 py-1">
                  単位
                </th>
                <th scope="col" className="border-x border-slate-400 py-1">
                  入力値
                </th>
              </tr>
            </thead>
            <tbody className="text-md">
              <FieldRow label="外径半径" symbol="r" unit="mm">
                <FieldInput value={form.outerRadiusMm} onChange={onChangeField("outerRadiusMm")} />
              </FieldRow>
              <FieldRow label="内径半径" symbol="r0" unit="mm">
                <FieldInput value={form.innerRadiusMm} onChange={onChangeField("innerRadiusMm")} />
              </FieldRow>
              <FieldRow label="鉄筋位置（有効半径）" symbol="rs" unit="mm">
                <FieldInput value={form.rebarRadiusMm} onChange={onChangeField("rebarRadiusMm")} />
              </FieldRow>
              <FieldRow label="鉄筋径" symbol="D" unit="-">
                <FieldSelect
                  value={form.rebarDiameterMm}
                  onChange={onChangeField("rebarDiameterMm")}
                  options={REBAR_DIAMETERS_MM.map((diameter) => ({
                    value: String(diameter),
                    label: `D${diameter}`,
                  }))}
                />
              </FieldRow>
              <FieldRow label="鉄筋本数" symbol="H" unit="本">
                <FieldInput
                  value={form.barCount}
                  onChange={onChangeField("barCount")}
                  inputMode="decimal"
                  step="any"
                />
              </FieldRow>
              <FieldRow label="鉄筋降伏強度" symbol="σsy" unit="N/mm²">
                <FieldInput
                  value={form.rebarYieldStrengthNPerMm2}
                  onChange={onChangeField("rebarYieldStrengthNPerMm2")}
                />
              </FieldRow>
              <FieldRow label="コンクリート設計基準強度" symbol="σck" unit="N/mm²">
                <FieldInput
                  value={form.concreteDesignStrengthNPerMm2}
                  onChange={onChangeField("concreteDesignStrengthNPerMm2")}
                />
              </FieldRow>
              <FieldRow label="ヤング係数比" symbol="n" unit="-">
                <FieldInput value={form.youngRatio} onChange={onChangeField("youngRatio")} />
              </FieldRow>
            </tbody>
          </table>
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
    <tr className="border-b border-slate-400 last:border-b-0">
      {/* 項目名 */}
      <td className="border-x border-slate-400 px-2 py-1">{label}</td>
      {/* 記号 */}
      <td className="w-12 border-x border-slate-400 px-1 py-1 text-center font-mono">
        <SymbolText value={symbol} />
      </td>
      {/* 単位 */}
      <td className="w-16 border-x border-slate-400 px-1 py-1 text-center font-mono">{unit}</td>
      {/* 入力値 */}
      <td className="w-24 border-x border-slate-400 bg-white">{children}</td>
    </tr>
  );
}

type FieldInputProps = {
  value: string;
  onChange: (value: string) => void;
  inputMode?: "decimal" | "numeric";
  step?: string;
};

/** 数値入力用のコンポーネント */
function FieldInput({ value, onChange, inputMode = "decimal", step }: FieldInputProps) {
  const className = clsx(
    "w-full [appearance:textfield] px-1 py-0.5 text-right font-mono outline-none placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
  );

  return (
    <input
      type="number"
      inputMode={inputMode}
      step={step}
      className={className}
      value={value}
      onKeyDown={(event) => {
        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
          event.preventDefault();
        }
      }}
      onWheel={(event) => event.currentTarget.blur()}
      onChange={(event) => onChange(event.target.value)}
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
  const className = clsx(
    "w-full px-1 py-0.5 text-right font-mono outline-none placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15",
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

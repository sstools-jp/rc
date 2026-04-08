import { useState, type FormEvent, type ReactNode } from "react";
import {
  AnnularSectionCalculator,
  type AnnularSectionInput,
  type AnnularSectionResult,
  type AnnularSectionValidationIssue,
  REBAR_DIAMETERS_MM,
} from "./model/annular-section";
import clsx from "clsx";

// フォームの状態を定義する型
type FormState = {
  momentKNmm: string;
  shearKN: string;
  axialKN: string;
  outerRadiusMm: string;
  innerRadiusMm: string;
  rebarRadiusMm: string;
  rebarDiameterMm: string;
  barCount: string;
  youngRatio: string;
};

// フォームの初期状態を定義
const DEFAULT_FORM_STATE: FormState = {
  momentKNmm: "",
  shearKN: "",
  axialKN: "",
  outerRadiusMm: "",
  innerRadiusMm: "",
  rebarRadiusMm: "",
  rebarDiameterMm: "22",
  barCount: "",
  youngRatio: "15",
};

// 文字列を数値に変換するユーティリティ関数
function parseNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

// 数値を指定された小数点以下の桁数でフォーマットするユーティリティ関数
function formatValue(value: number | undefined, digits = 4): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "-";
  }

  return new Intl.NumberFormat("ja-JP", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(value);
}

// パーセント表示用のフォーマット関数
function formatPercent(value: number | undefined): string {
  return `${formatValue(value, 3)} %`;
}

// フォームの状態から計算用の入力オブジェクトを作成するユーティリティ関数
function buildInput(form: FormState): AnnularSectionInput {
  return {
    momentKNmm: parseNumber(form.momentKNmm),
    shearKN: parseNumber(form.shearKN),
    axialKN: parseNumber(form.axialKN),
    outerRadiusMm: parseNumber(form.outerRadiusMm),
    innerRadiusMm: parseNumber(form.innerRadiusMm),
    rebarRadiusMm: parseNumber(form.rebarRadiusMm),
    rebarDiameterMm: parseNumber(form.rebarDiameterMm) as AnnularSectionInput["rebarDiameterMm"],
    barCount: parseNumber(form.barCount),
    youngRatio: parseNumber(form.youngRatio),
  };
}

// 初期状態の入力から結果を作成するユーティリティ関数
function createResult(form: FormState): AnnularSectionResult | null {
  const calculator = new AnnularSectionCalculator(buildInput(form));
  const validationIssues = calculator.validate();

  if (validationIssues.length > 0) {
    return null;
  }

  try {
    return calculator.calculate();
  } catch {
    return null;
  }
}

function App() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM_STATE);
  const [result, setResult] = useState<AnnularSectionResult | null>(() => createResult(DEFAULT_FORM_STATE));
  const [issues, setIssues] = useState<AnnularSectionValidationIssue[]>([]);
  const [statusMessage, setStatusMessage] = useState("入力を待機しています。");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const input = buildInput(form);
    const calculator = new AnnularSectionCalculator(input);
    const validationIssues = calculator.validate();

    if (validationIssues.length > 0) {
      setIssues(validationIssues);
      setResult(null);
      setStatusMessage("入力値を確認してください。");
      return;
    }

    try {
      const nextResult = calculator.calculate();
      setResult(nextResult);
      setIssues([]);
      setStatusMessage("計算が完了しました。");
    } catch (error) {
      const message = error instanceof Error ? error.message : "計算に失敗しました。";
      setIssues([{ field: "momentKNmm", message }]);
      setResult(null);
      setStatusMessage(message);
    }
  };

  const handleReset = () => {
    setForm(DEFAULT_FORM_STATE);
    setResult(createResult(DEFAULT_FORM_STATE));
    setIssues([]);
    setStatusMessage("入力を待機しています。");
  };

  const updateField = (field: keyof FormState) => (value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-black">
      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 pt-6 pb-24 sm:px-6 lg:px-8 lg:pt-8 lg:pb-28">
        <header className="overflow-hidden border border-slate-200 bg-white px-6 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h1 className="text-3xl font-bold text-slate-950 sm:text-3xl">ＲＣ計算［円環断面］</h1>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
          <form
            onSubmit={handleSubmit}
            className="flex h-full flex-col gap-6 border border-slate-200 bg-white/90 p-5"
          >
            <h2 className="text-xl">断面力・寸法・鉄筋</h2>

            <div className="overflow-hidden border border-slate-200 bg-slate-50/80">
              <table className="w-full border-collapse">
                <thead className="hidden sm:table-header-group">
                  <tr className="border-b border-slate-200 text-left text-sm font-semibold tracking-[0.18em] text-slate-500 uppercase">
                    <th scope="col" className="py-1 text-center">
                      項目
                    </th>
                    <th scope="col" className="py-1 text-center">
                      記号
                    </th>
                    <th scope="col" className="py-1 text-center">
                      単位
                    </th>
                    <th scope="col" className="py-1 text-center">
                      入力値
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <FieldRow label="曲げモーメント" symbol="M" unit="kN.mm">
                    <FieldInput value={form.momentKNmm} onChange={updateField("momentKNmm")} />
                  </FieldRow>
                  <FieldRow label="せん断力" symbol="S" unit="kN">
                    <FieldInput value={form.shearKN} onChange={updateField("shearKN")} />
                  </FieldRow>
                  <FieldRow label="軸力（圧縮を正）" symbol="N" unit="kN">
                    <FieldInput value={form.axialKN} onChange={updateField("axialKN")} />
                  </FieldRow>
                  <FieldRow label="外径半径" symbol="r" unit="mm">
                    <FieldInput value={form.outerRadiusMm} onChange={updateField("outerRadiusMm")} />
                  </FieldRow>
                  <FieldRow label="内径半径" symbol="r0" unit="mm">
                    <FieldInput value={form.innerRadiusMm} onChange={updateField("innerRadiusMm")} />
                  </FieldRow>
                  <FieldRow label="鉄筋位置（有効半径）" symbol="rs" unit="mm">
                    <FieldInput value={form.rebarRadiusMm} onChange={updateField("rebarRadiusMm")} />
                  </FieldRow>
                  <FieldRow label="鉄筋径" symbol="D" unit="-">
                    <FieldSelect
                      value={form.rebarDiameterMm}
                      onChange={updateField("rebarDiameterMm")}
                      options={REBAR_DIAMETERS_MM.map((diameter) => ({
                        value: String(diameter),
                        label: `D${diameter}`,
                      }))}
                    />
                  </FieldRow>
                  <FieldRow label="鉄筋本数" symbol="H" unit="本">
                    <FieldInput
                      value={form.barCount}
                      onChange={updateField("barCount")}
                      inputMode="numeric"
                      step="1"
                    />
                  </FieldRow>
                  <FieldRow label="ヤング係数比" symbol="n" unit="-">
                    <FieldInput value={form.youngRatio} onChange={updateField("youngRatio")} />
                  </FieldRow>
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                className="inline-flex min-h-8 items-center justify-center bg-blue-600 px-5 text-white hover:bg-blue-700"
              >
                計算
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex min-h-8 items-center justify-center border border-slate-300 bg-white px-4 text-slate-700 hover:border-slate-400 hover:bg-slate-50"
              >
                リセット
              </button>
            </div>

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
              <p className="border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-900">
                「計算」を押すと計算結果が表示されます。
              </p>
            )}
          </form>

          <section
            aria-live="polite"
            className="flex h-full flex-col gap-6 border border-slate-200 bg-white/90 p-5"
          >
            <h2 className="text-xl">計算結果</h2>

            <div className="overflow-hidden border border-slate-200 bg-slate-50/80">
              <ResultCell label="中立軸角度" value={formatValue(result?.neutralAxisAngleDeg, 4)} unit="°" />
              <ResultCell
                label="中立軸位置"
                value={formatValue(result?.neutralAxisPositionMm, 2)}
                unit="mm"
              />
              <ResultCell
                label="結合モーメント"
                value={formatValue(result?.combinedMomentKNmm, 2)}
                unit="kN.mm"
              />
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-semibold text-slate-900">断面情報</h3>
              <div className="overflow-hidden border border-slate-200 bg-slate-50/80">
                <ResultCell label="断面積" value={formatValue(result?.sectionAreaMm2, 0)} unit="mm²" />
                <ResultCell label="全断面積" value={formatValue(result?.fullSectionAreaMm2, 0)} unit="mm²" />
                <ResultCell
                  label="内部断面積"
                  value={formatValue(result?.innerSectionAreaMm2, 0)}
                  unit="mm²"
                />
                <ResultCell
                  label="鉄筋1本断面積"
                  value={formatValue(result?.rebarAreaPerBarMm2, 2)}
                  unit="mm²"
                />
                <ResultCell
                  label="鉄筋総断面積"
                  value={formatValue(result?.totalRebarAreaMm2, 0)}
                  unit="mm²"
                />
                <ResultCell label="鉄筋比" value={formatPercent(result?.rebarRatioPercent)} unit="" />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-semibold text-slate-900">係数</h3>
              <div className="overflow-hidden border border-slate-200 bg-slate-50/80">
                <ResultCell label="α" value={formatValue(result?.alpha, 4)} unit="-" />
                <ResultCell label="γ" value={formatValue(result?.gamma, 4)} unit="-" />
                <ResultCell
                  label="コンクリート圧縮係数"
                  value={formatValue(result?.concreteCompressionCoefficient, 4)}
                  unit="-"
                />
                <ResultCell
                  label="鋼材応力度係数"
                  value={formatValue(result?.steelStressCoefficient, 4)}
                  unit="-"
                />
                <ResultCell label="せん断係数" value={formatValue(result?.shearCoefficient, 4)} unit="-" />
                <ResultCell label="ヤング係数比" value={formatValue(result?.youngRatio, 2)} unit="-" />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-semibold text-slate-900">応力度</h3>
              <div className="overflow-hidden border border-slate-200 bg-slate-50/80">
                <ResultCell
                  label="コンクリート圧縮応力度"
                  value={formatValue(result?.concreteCompressionStressNPerMm2, 4)}
                  unit="N/mm²"
                />
                <ResultCell
                  label="鉄筋応力度"
                  value={formatValue(result?.rebarStressNPerMm2, 4)}
                  unit="N/mm²"
                />
                <ResultCell
                  label="コンクリートせん断応力度"
                  value={formatValue(result?.concreteShearStressNPerMm2, 4)}
                  unit="N/mm²"
                />
              </div>
            </div>
          </section>
        </section>
      </main>

      <StatusBar message={statusMessage} />
    </div>
  );
}

// ステータスバーコンポーネント
type StatusBarProps = {
  message: string;
};
function StatusBar({ message }: StatusBarProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-md sm:px-6 lg:px-8"
    >
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3">
        <span aria-hidden="true" className="inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
        <p className="text-sm text-slate-700">{message}</p>
      </div>
    </div>
  );
}

// 入力用の行コンポーネント
type FieldRowProps = {
  label: string;
  symbol: string;
  unit: string;
  children: ReactNode;
};
function FieldRow({ label, symbol, unit, children }: FieldRowProps) {
  return (
    <tr className="border-b border-slate-200 last:border-b-0">
      <td className="px-2 py-1">{label}</td>
      <td className="px-1 py-1 text-center font-mono">{symbol}</td>
      <td className="px-1 py-1 text-center font-mono">{unit}</td>
      <td className="w-26 px-1 py-1">{children}</td>
    </tr>
  );
}

// 数値入力用のコンポーネント
type FieldInputProps = {
  value: string;
  onChange: (value: string) => void;
  inputMode?: "decimal" | "numeric";
  step?: string;
};
function FieldInput({ value, onChange, inputMode = "decimal", step }: FieldInputProps) {
  const className = clsx(
    "w-full border border-slate-300 bg-white px-1 py-1 text-right font-mono outline-none placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15",
  );

  return (
    <input
      type="number"
      inputMode={inputMode}
      step={step}
      className={className}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

// 選択入力用のコンポーネント
type FieldSelectOption = {
  value: string;
  label: string;
};
type FieldSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: Array<FieldSelectOption>;
};
function FieldSelect({ value, onChange, options }: FieldSelectProps) {
  const className = clsx(
    "w-full border border-slate-300 bg-white px-1 py-1 text-right font-mono outline-none placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15",
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

// 結果表示用セルコンポーネント
type ResultCellProps = {
  label: string;
  value: string;
  unit: string;
};
function ResultCell({ label, value, unit }: ResultCellProps) {
  return (
    <article className="grid grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)] gap-3 border-b border-slate-200 px-4 py-3 last:border-b-0 sm:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
      <span className="">{label}</span>
      <div className="space-x-1 text-right font-mono">
        <span>{value}</span>
        {unit ? <span className="select-none">{unit}</span> : null}
      </div>
    </article>
  );
}

export default App;

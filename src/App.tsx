import { useEffect, useState, type ReactNode } from "react";
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
  momentKNm: string;
  shearKN: string;
  axialKN: string;
  outerRadiusMm: string;
  innerRadiusMm: string;
  rebarRadiusMm: string;
  rebarDiameterMm: string;
  barCount: string;
  youngRatio: string;
  rebarYieldStrengthNPerMm2: string;
  concreteDesignStrengthNPerMm2: string;
};

// フォームの初期状態を定義
const DEFAULT_FORM_STATE: FormState = {
  momentKNm: "",
  shearKN: "",
  axialKN: "",
  outerRadiusMm: "",
  innerRadiusMm: "",
  rebarRadiusMm: "",
  rebarDiameterMm: "22",
  barCount: "",
  youngRatio: "15",
  rebarYieldStrengthNPerMm2: "",
  concreteDesignStrengthNPerMm2: "",
};

// ローカルストレージ用のキー
const FORM_STORAGE_KEY = "rc-calc:annular-section-form";

// ローカルストレージからフォームの状態を読み込み／保存する関数
function isFormState(value: unknown): value is FormState {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.momentKNm === "string" &&
    typeof candidate.shearKN === "string" &&
    typeof candidate.axialKN === "string" &&
    typeof candidate.outerRadiusMm === "string" &&
    typeof candidate.innerRadiusMm === "string" &&
    typeof candidate.rebarRadiusMm === "string" &&
    typeof candidate.rebarDiameterMm === "string" &&
    typeof candidate.barCount === "string" &&
    typeof candidate.youngRatio === "string" &&
    typeof candidate.rebarYieldStrengthNPerMm2 === "string" &&
    typeof candidate.concreteDesignStrengthNPerMm2 === "string"
  );
}

// ローカルストレージからフォームの状態を読み込む関数
function loadFormState(): FormState {
  if (typeof window === "undefined") {
    return DEFAULT_FORM_STATE;
  }

  try {
    const storedValue = window.localStorage.getItem(FORM_STORAGE_KEY);
    if (!storedValue) {
      return DEFAULT_FORM_STATE;
    }

    const parsedValue = JSON.parse(storedValue) as unknown;
    if (!isFormState(parsedValue)) {
      return DEFAULT_FORM_STATE;
    }

    return { ...DEFAULT_FORM_STATE, ...parsedValue };
  } catch {
    return DEFAULT_FORM_STATE;
  }
}

// フォームの状態をローカルストレージに保存する関数
function saveFormState(form: FormState): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(form));
  } catch {
    // 保存に失敗しても計算処理は継続する
  }
}

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

// 記号の2文字目以降を下付きで表示するコンポーネント
function SymbolText({ value }: { value: string }) {
  if (value.length <= 1) {
    return <>{value}</>;
  }

  return (
    <>
      {value[0]}
      <sub>{value.slice(1)}</sub>
    </>
  );
}

// フォームの状態から計算用の入力オブジェクトを作成するユーティリティ関数
function buildInput(form: FormState): AnnularSectionInput {
  return {
    momentKNm: parseNumber(form.momentKNm),
    shearKN: parseNumber(form.shearKN),
    axialKN: parseNumber(form.axialKN),
    outerRadiusMm: parseNumber(form.outerRadiusMm),
    innerRadiusMm: parseNumber(form.innerRadiusMm),
    rebarRadiusMm: parseNumber(form.rebarRadiusMm),
    rebarDiameterMm: parseNumber(form.rebarDiameterMm) as AnnularSectionInput["rebarDiameterMm"],
    barCount: parseNumber(form.barCount),
    youngRatio: parseNumber(form.youngRatio),
    rebarYieldStrengthNPerMm2: parseNumber(form.rebarYieldStrengthNPerMm2),
    concreteDesignStrengthNPerMm2: parseNumber(form.concreteDesignStrengthNPerMm2),
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

const INITIAL_FORM_STATE = loadFormState();

function App() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM_STATE);
  const [result, setResult] = useState<AnnularSectionResult | null>(() => createResult(INITIAL_FORM_STATE));
  const [issues, setIssues] = useState<AnnularSectionValidationIssue[]>([]);
  const [statusMessage, setStatusMessage] = useState("入力を待機しています。");

  useEffect(() => {
    saveFormState(form);
  }, [form]);

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
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
      setIssues([{ field: "momentKNm", message }]);
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
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 pt-6 pb-24 sm:px-6 lg:px-8 lg:pt-8 lg:pb-28">
        <header className="overflow-hidden border border-slate-200 bg-white px-6 py-6">
          <h1 className="text-3xl">ＲＣ計算［円環断面］</h1>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
          <form
            onSubmit={handleSubmit}
            className="flex h-full flex-col gap-6 border border-slate-200 bg-white p-5"
          >
            <h2 className="text-xl">断面力・寸法・鉄筋</h2>

            <div className="overflow-hidden border border-slate-200 bg-slate-50/80">
              <table className="w-full border-collapse">
                <thead className="hidden sm:table-header-group">
                  <tr className="border-b border-slate-200 text-sm text-slate-500">
                    <th scope="col" className="py-1">
                      項目
                    </th>
                    <th scope="col" className="py-1">
                      記号
                    </th>
                    <th scope="col" className="py-1">
                      単位
                    </th>
                    <th scope="col" className="py-1">
                      入力値
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <FieldRow label="曲げモーメント" symbol="M" unit="kN.m">
                    <FieldInput value={form.momentKNm} onChange={updateField("momentKNm")} />
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
                  <FieldRow label="鉄筋降伏強度" symbol="σsy" unit="N/mm²">
                    <FieldInput
                      value={form.rebarYieldStrengthNPerMm2}
                      onChange={updateField("rebarYieldStrengthNPerMm2")}
                    />
                  </FieldRow>
                  <FieldRow label="コンクリート設計基準強度" symbol="σck" unit="N/mm²">
                    <FieldInput
                      value={form.concreteDesignStrengthNPerMm2}
                      onChange={updateField("concreteDesignStrengthNPerMm2")}
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
            className="flex h-full flex-col gap-6 border border-slate-200 bg-white p-5"
          >
            <h2 className="text-xl">計算結果</h2>

            <CollapsibleSection title="中立軸および換算曲げモーメント" defaultOpen>
              <ResultCell label="中立軸角度" value={formatValue(result?.neutralAxisAngleDeg, 4)} unit="deg" />
              <ResultCell
                label="中立軸位置"
                value={formatValue(result?.neutralAxisPositionMm, 1)}
                unit="mm"
              />
              <ResultCell
                label="換算曲げモーメント"
                value={formatValue(result?.combinedMomentKNm, 1)}
                unit="kN.m"
              />
            </CollapsibleSection>

            <CollapsibleSection title="発生応力度">
              <ResultCell
                label="コンクリート圧縮応力度"
                value={formatValue(result?.concreteCompressionStressNPerMm2, 1)}
                unit="N/mm²"
              />
              <ResultCell
                label="鉄筋応力度"
                value={formatValue(result?.rebarStressNPerMm2, 1)}
                unit="N/mm²"
              />
              <ResultCell
                label="コンクリートせん断応力度"
                value={formatValue(result?.concreteShearStressNPerMm2, 1)}
                unit="N/mm²"
              />
            </CollapsibleSection>

            <CollapsibleSection title="断面情報">
              <ResultCell label="断面積" value={formatValue(result?.sectionAreaMm2, 0)} unit="mm²" />
              <ResultCell label="全断面積" value={formatValue(result?.fullSectionAreaMm2, 0)} unit="mm²" />
              <ResultCell label="内部断面積" value={formatValue(result?.innerSectionAreaMm2, 0)} unit="mm²" />
              <ResultCell
                label="鉄筋1本断面積"
                value={formatValue(result?.rebarAreaPerBarMm2, 2)}
                unit="mm²"
              />
              <ResultCell label="鉄筋総断面積" value={formatValue(result?.totalRebarAreaMm2, 0)} unit="mm²" />
              <ResultCell label="鉄筋比" value={formatValue(result?.rebarRatioPercent, 2)} unit="%" />
            </CollapsibleSection>

            <CollapsibleSection title="係数">
              <ResultCell label="α" value={formatValue(result?.alpha, 4)} />
              <ResultCell label="γ" value={formatValue(result?.gamma, 4)} />
              <ResultCell
                label="コンクリート圧縮係数"
                value={formatValue(result?.concreteCompressionCoefficient, 4)}
              />
              <ResultCell label="鋼材応力度係数" value={formatValue(result?.steelStressCoefficient, 4)} />
              <ResultCell label="せん断係数" value={formatValue(result?.shearCoefficient, 4)} />
              <ResultCell label="ヤング係数比" value={formatValue(result?.youngRatio, 2)} />
            </CollapsibleSection>
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
      className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white px-4 py-3 shadow-md sm:px-6 lg:px-8"
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
      <td className="px-1 py-1 text-center font-mono"><SymbolText value={symbol} /></td>
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
    "w-full border border-slate-300 bg-white px-1 py-0.5 text-right font-mono outline-none placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15",
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
    "w-full border border-slate-300 bg-white px-1 py-0.5 text-right font-mono outline-none placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15",
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
  unit?: string;
};
function ResultCell({ label, value, unit }: ResultCellProps) {
  return (
    <article className="flex border-b border-slate-200 px-3 py-2 last:border-b-0">
      <span className="flex-1">{label}</span>
      <div className="space-x-2 text-right font-mono">
        <span className="inline-block">{value}</span>
        {unit ? <span className="inline-block w-10 text-left select-none">{unit}</span> : null}
      </div>
    </article>
  );
}

// 折りたたみ可能なセクションコンポーネント
type CollapsibleSectionProps = {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
};
function CollapsibleSection({ title, defaultOpen = false, children }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="space-y-3">
      <h3>
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          aria-expanded={isOpen}
          className="flex w-full items-center gap-2 rounded-sm text-left font-semibold outline-none"
        >
          <span
            aria-hidden="true"
            className={clsx(
              "inline-block h-0 w-0 shrink-0 border-y-[5px] border-l-[7px] border-y-transparent border-l-slate-600",
              isOpen ? "rotate-90" : "rotate-0",
            )}
          />
          <span>{title}</span>
        </button>
      </h3>

      {isOpen ? (
        <div className="overflow-hidden border border-slate-200 bg-slate-50/80">{children}</div>
      ) : null}
    </section>
  );
}

export default App;

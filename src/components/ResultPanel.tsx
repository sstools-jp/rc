import { useState, type ReactNode } from "react";
import clsx from "clsx";
import { AppButton } from "@/components/AppButton";
import type { FormState } from "@/forms/form-state";
import type { AnnularSectionResult } from "@/model/annular-section";
import { formatNumber } from "@/utils/number-format";
import { CrossSectionPreview } from "@/components/CrossSectionPreview";

type AnnularSectionResultPanelProps = {
  form: FormState;
  result: AnnularSectionResult | null;
  onOpenPrintPreview: () => void;
};

/** 計算結果表示パネル */
export function AnnularSectionResultPanel({
  form,
  result,
  onOpenPrintPreview,
}: AnnularSectionResultPanelProps) {
  const section = result?.section;
  const loading = result?.loading;
  const neutralAxis = result?.neutralAxis;
  const stress = result?.stress;
  const strength = result?.strength;

  return (
    <section
      aria-live="polite"
      className="flex w-120 flex-col gap-6 rounded-sm border border-slate-300 bg-white p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-xl">計算結果</h2>
        <AppButton onClick={onOpenPrintPreview} disabled={result === null}>
          印刷用テーブル
        </AppButton>
      </div>

      <CollapsibleSection title="断面プレビュー" defaultOpen>
        <CrossSectionPreview form={form} result={result} />
      </CollapsibleSection>

      <CollapsibleSection title="中立軸および換算曲げモーメント" defaultOpen>
        <ResultCell label="中立軸角度" value={formatNumber(neutralAxis?.neutralAxisAngleDeg, 4)} unit="deg" />
        <ResultCell
          label="中立軸位置"
          value={formatNumber(neutralAxis?.neutralAxisPositionMm, 1)}
          unit="mm"
        />
        <ResultCell
          label="換算曲げモーメント"
          value={formatNumber(loading?.combinedMomentKNm, 1)}
          unit="kN.m"
        />
      </CollapsibleSection>

      <CollapsibleSection title="発生応力度" defaultOpen>
        <ResultCell
          label="コンクリート圧縮応力度"
          value={formatNumber(stress?.concreteCompressionStressNPerMm2, 1)}
          unit="N/mm²"
        />
        <ResultCell label="鉄筋応力度" value={formatNumber(stress?.rebarStressNPerMm2, 1)} unit="N/mm²" />
        <ResultCell
          label="コンクリートせん断応力度"
          value={formatNumber(stress?.concreteShearStressNPerMm2, 1)}
          unit="N/mm²"
        />
        <ResultCell
          label="鉄筋せん断応力度"
          value={formatNumber(stress?.rebarShearStressNPerMm2, 1)}
          unit="N/mm²"
        />
      </CollapsibleSection>

      <CollapsibleSection title="終局耐力" defaultOpen>
        <ResultCell
          label="コンクリート終局曲げモーメント"
          value={formatNumber(strength?.concreteUltimateMomentKNm, 0)}
          unit="kN.m"
        />
        <ResultCell
          label="鉄筋降伏曲げモーメント"
          value={formatNumber(strength?.rebarYieldMomentKNm, 0)}
          unit="kN.m"
        />
      </CollapsibleSection>

      <CollapsibleSection title="断面情報" defaultOpen>
        <ResultCell label="鉄筋総断面積" value={formatNumber(section?.totalRebarAreaMm2, 0)} unit="mm²" />
        <ResultCell label="鉄筋比" value={formatNumber(section?.rebarRatioPercent, 2)} unit="%" />
      </CollapsibleSection>

      <CollapsibleSection title="係数">
        <ResultCell label="α" value={formatNumber(section?.alpha, 4)} />
        <ResultCell label="γ" value={formatNumber(section?.gamma, 4)} />
        <ResultCell
          label="コンクリート圧縮係数"
          value={formatNumber(neutralAxis?.concreteCompressionCoefficient, 4)}
        />
        <ResultCell label="鋼材応力度係数" value={formatNumber(neutralAxis?.steelStressCoefficient, 4)} />
        <ResultCell label="せん断係数" value={formatNumber(neutralAxis?.shearCoefficient, 4)} />
      </CollapsibleSection>
    </section>
  );
}

type ResultCellProps = {
  label: string;
  value: string;
  unit?: string;
};

/** 結果表示用セルコンポーネント */
function ResultCell({ label, value, unit }: ResultCellProps) {
  return (
    <article className="flex border-b border-slate-400 px-3 py-1 last:border-b-0">
      <span className="flex-1">{label}</span>
      <div className="space-x-2 text-right font-mono">
        <span className="inline-block">{value}</span>
        {unit ? <span className="inline-block w-10 text-left select-none">{unit}</span> : null}
      </div>
    </article>
  );
}

type CollapsibleSectionProps = {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

/** 折りたたみ可能なセクションコンポーネント */
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
        <div className="overflow-hidden border border-slate-400 bg-slate-50/80">{children}</div>
      ) : null}
    </section>
  );
}

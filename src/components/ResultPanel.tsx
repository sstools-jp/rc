import type { AnnularSectionResult } from "@/models/annular-section";
import { formatNumber } from "@/utils/number-format";
import AccordionSection from "@/components/AccordionSection";
import resultTooltips from "@/data/resultTooltips";
import { SelectableText } from "@/components/SelectableText";
import { SectionCard } from "@/components/SectionCard";
import { SymbolText } from "@/components/SymbolText";

/** 計算結果表示パネル */
export function AnnularSectionResultPanel({ result }: { result: AnnularSectionResult | null }) {
  const section = result?.section;
  const loading = result?.loading;
  const neutralAxis = result?.neutralAxis;
  const stress = result?.stress;
  const strength = result?.strength;

  return (
    <SectionCard title="計算結果">
      <div className="flex w-full flex-col gap-2">
        <AccordionSection title="中立軸および合成断面力" tooltip={resultTooltips.neutral.lines} defaultOpen>
          <ResultCell
            label="中立軸角度"
            symbol="θ"
            value={formatNumber(neutralAxis?.neutralAxisAngleDeg, 4)}
            unit="deg"
          />
          <ResultCell
            label="中立軸位置"
            symbol="x"
            value={formatNumber(neutralAxis?.neutralAxisPosition_Mm, 1)}
            unit="mm"
          />
          <ResultCell
            label="合成曲げモーメント"
            symbol="Mo"
            value={formatNumber(loading?.combinedMoment_KNm, 1)}
            unit="kN.m"
          />
        </AccordionSection>

        <AccordionSection title="発生応力度" tooltip={resultTooltips.stress.lines} defaultOpen>
          <ResultCell
            label="コンクリート圧縮応力度"
            symbol="σc"
            value={formatNumber(stress?.concreteCompressionStress_NPerMm2, 2)}
            unit="N/mm²"
          />
          <ResultCell
            label="鉄筋引張応力度"
            symbol="σs"
            value={formatNumber(stress?.rebarStress_NPerMm2, 2)}
            unit="N/mm²"
          />
          <ResultCell
            label="コンクリートせん断応力度"
            symbol="τc"
            value={formatNumber(stress?.concreteShearStress_NPerMm2, 2)}
            unit="N/mm²"
          />
          <ResultCell
            label="鉄筋せん断応力度"
            symbol="τs"
            value={formatNumber(stress?.rebarShearStress_NPerMm2, 2)}
            unit="N/mm²"
          />
        </AccordionSection>

        <AccordionSection title="終局耐力" tooltip={resultTooltips.ultimate.lines} defaultOpen>
          <ResultCell
            label="コンクリート終局曲げモーメント"
            symbol="Mc"
            value={formatNumber(strength?.concreteUltimateMoment_KNm, 0)}
            unit="kN.m"
          />
          <ResultCell
            label="鉄筋降伏曲げモーメント"
            symbol="Mb"
            value={formatNumber(strength?.rebarYieldMoment_KNm, 0)}
            unit="kN.m"
          />
        </AccordionSection>

        <AccordionSection title="断面積" tooltip={resultTooltips.area.lines} defaultOpen>
          <ResultCell
            label="鉄筋総断面積"
            symbol="As"
            value={formatNumber(section?.rebarTotalArea_Mm2, 0)}
            unit="mm²"
          />
          <ResultCell
            label="コンクリート総断面積"
            symbol="Ac"
            value={formatNumber(section?.concreteSectionArea_Mm2, 0)}
            unit="mm²"
          />
          <ResultCell
            label="鉄筋比"
            symbol="p"
            value={formatNumber(section?.rebarRatioPercent, 2)}
            unit="%"
          />
        </AccordionSection>

        <AccordionSection title="係数" tooltip={resultTooltips.coefficient.lines}>
          <ResultCell label="幾何係数" symbol="α" value={formatNumber(section?.alpha, 4)} />
          <ResultCell label="幾何係数" symbol="γ" value={formatNumber(section?.gamma, 4)} />
          <ResultCell
            label="コンクリート圧縮係数"
            symbol="κc"
            value={formatNumber(neutralAxis?.concreteCompressionCoefficient, 4)}
          />
          <ResultCell
            label="鋼材応力度係数"
            symbol="κs"
            value={formatNumber(neutralAxis?.steelStressCoefficient, 4)}
          />
          <ResultCell label="せん断係数" symbol="κv" value={formatNumber(neutralAxis?.shearCoefficient, 4)} />
        </AccordionSection>
      </div>
    </SectionCard>
  );
}

type ResultCellProps = {
  label: string;
  symbol?: string;
  value: string;
  unit?: string;
};

/** 結果表示用セルコンポーネント */
function ResultCell({ label, symbol, value, unit }: ResultCellProps) {
  return (
    <article className="flex border-b border-slate-400 px-2 py-1 text-sm last:border-b-0">
      <span className="flex flex-1 items-center gap-1">{label}</span>
      <div className="space-x-2 text-right font-mono">
        {symbol && (
          <>
            <span className="inline-block w-2.5 text-left text-slate-700">
              <SymbolText value={symbol} />
            </span>
            <span className="inline-block w-2 text-left text-slate-700">=</span>
          </>
        )}
        <SelectableText>{value}</SelectableText>
        {unit ? <span className="inline-block w-9 text-left text-slate-700 select-none">{unit}</span> : null}
      </div>
    </article>
  );
}

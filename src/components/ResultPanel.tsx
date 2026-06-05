import type { AnnularSectionResult } from "@/models/annular-section";
import { formatNumber } from "@/utils/number-format";
import { AccordionSection } from "@/components/AccordionSection";
import { resultTooltips } from "@/data/resultTooltips";
import { Tooltip } from "@/components/Tooltip";
import type { TooltipContent } from "@/components/Tooltip";
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
        <AccordionSection title="中立軸および合成断面力" defaultOpen>
          <ResultCell
            label="中立軸位置"
            symbol="x"
            symbolTooltip={resultTooltips.x}
            value={formatNumber(neutralAxis?.neutralAxisPosition_Mm, 1)}
            valueWidth={12}
            unit="mm"
          />
          <ResultCell
            label="合成曲げモーメント"
            symbol="Mo"
            symbolTooltip={resultTooltips.M_o}
            value={formatNumber(loading?.combinedMoment_KNm, 1)}
            valueWidth={12}
            unit="kN.m"
          />
        </AccordionSection>

        <AccordionSection title="発生応力度">
          <ResultCell
            label="コンクリート圧縮応力度"
            symbol="σc"
            symbolTooltip={resultTooltips.sigma_c}
            value={formatNumber(stress?.concreteCompressionStress_NPerMm2, 2)}
            valueWidth={12}
            unit="N/mm²"
          />
          <ResultCell
            label="鉄筋引張応力度"
            symbol="σs"
            symbolTooltip={resultTooltips.sigma_s}
            value={formatNumber(stress?.rebarStress_NPerMm2, 2)}
            valueWidth={12}
            unit="N/mm²"
          />
          <ResultCell
            label="コンクリートせん断応力度"
            symbol="τc"
            symbolTooltip={resultTooltips.tau_c}
            value={formatNumber(stress?.concreteShearStress_NPerMm2, 2)}
            valueWidth={12}
            unit="N/mm²"
          />
          <ResultCell
            label="鉄筋せん断応力度"
            symbol="τs"
            symbolTooltip={resultTooltips.tau_s}
            value={formatNumber(stress?.rebarShearStress_NPerMm2, 2)}
            valueWidth={12}
            unit="N/mm²"
          />
        </AccordionSection>

        <AccordionSection title="終局耐力" defaultOpen>
          <ResultCell
            label="コンクリート終局曲げモーメント"
            symbol="Mc"
            symbolTooltip={resultTooltips.M_c}
            value={formatNumber(strength?.concreteUltimateMoment_KNm, 0)}
            valueWidth={10}
            unit="kN.m"
          />
          <ResultCell
            label="鉄筋降伏曲げモーメント"
            symbol="Mb"
            symbolTooltip={resultTooltips.M_b}
            value={formatNumber(strength?.rebarYieldMoment_KNm, 0)}
            valueWidth={10}
            unit="kN.m"
          />
        </AccordionSection>

        <AccordionSection title="断面積" defaultOpen>
          <ResultCell
            label="鉄筋総断面積"
            symbol="As"
            symbolTooltip={resultTooltips.A_s}
            value={formatNumber(section?.rebarTotalArea_Mm2, 0)}
            valueWidth={14}
            unit="mm²"
          />
          <ResultCell
            label="コンクリート総断面積"
            symbol="Ac"
            symbolTooltip={resultTooltips.A_c}
            value={formatNumber(section?.concreteSectionArea_Mm2, 0)}
            valueWidth={14}
            unit="mm²"
          />
          <ResultCell
            label="鉄筋比（コンクリート実断面）"
            symbol="p"
            symbolTooltip={resultTooltips.p}
            value={formatNumber(section?.actualRebarRatioPercent, 2)}
            valueWidth={14}
            unit="%"
          />
        </AccordionSection>

        <AccordionSection title="係数">
          <ResultCell
            label="中立軸角度"
            symbol="θ"
            symbolTooltip={resultTooltips.theta}
            value={formatNumber(neutralAxis?.neutralAxisAngleDeg, 4)}
            valueWidth={14}
            unit="deg"
          />
          <ResultCell
            label="幾何係数"
            symbol="α"
            symbolTooltip={resultTooltips.alpha}
            value={formatNumber(section?.alpha, 4)}
            valueWidth={14}
          />
          <ResultCell
            label="幾何係数"
            symbol="γ"
            symbolTooltip={resultTooltips.gamma}
            value={formatNumber(section?.gamma, 4)}
            valueWidth={14}
          />
          <ResultCell
            label="コンクリート圧縮応力度係数"
            symbol="fc"
            symbolTooltip={resultTooltips.f_c}
            value={formatNumber(neutralAxis?.concreteCompressionCoefficient, 4)}
            valueWidth={14}
          />
          <ResultCell
            label="鋼材応力度係数"
            symbol="fs"
            symbolTooltip={resultTooltips.f_s}
            value={formatNumber(neutralAxis?.steelStressCoefficient, 4)}
            valueWidth={14}
          />
          <ResultCell
            label="せん断応力度係数"
            symbol="fv"
            symbolTooltip={resultTooltips.f_v}
            value={formatNumber(neutralAxis?.shearCoefficient, 4)}
            valueWidth={14}
          />
        </AccordionSection>
      </div>
    </SectionCard>
  );
}

type ResultCellProps = {
  label: string;
  symbol?: string;
  /** 記号に表示するツールチップ */
  symbolTooltip?: TooltipContent;
  value: string;
  /** 計算結果の幅 (Tailwindのw-[number]相当) */
  valueWidth?: number;
  unit?: string;
};

/** 結果表示用セルコンポーネント */
function ResultCell({ label, symbol, symbolTooltip, value, valueWidth, unit }: ResultCellProps) {
  const valueWidthStyle = valueWidth === undefined ? undefined : { width: `${valueWidth / 4}rem` };

  return (
    <article className="flex border-b border-slate-400 px-2 py-1 text-sm last:border-b-0">
      <span className="flex flex-1 items-center gap-1">{label}</span>
      <div className="space-x-2 text-right font-mono">
        {symbol && (
          <>
            <span className="inline-block w-2.5 text-left text-slate-700">
              {symbolTooltip ? (
                <Tooltip content={symbolTooltip}>
                  <SymbolText value={symbol} />
                </Tooltip>
              ) : (
                <SymbolText value={symbol} />
              )}
            </span>
            <span className="inline-block w-2 text-left text-slate-700">=</span>
          </>
        )}
        <SelectableText style={valueWidthStyle}>{value}</SelectableText>
        <span className="inline-block w-9 text-left text-slate-700 select-none">{unit ?? ""}</span>
      </div>
    </article>
  );
}

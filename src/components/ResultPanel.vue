<script setup lang="ts">
import { IoInformationCircle } from "@kalimahapps/vue-icons/io";
import type { AnnularSectionResult } from "@/models/annular-section";
import { formatNumber } from "@/utils/number-format";
import AccordionSection from "@/components/AccordionSection.vue";
import { resultTooltips } from "@/data/resultTooltips";
import ResultCell from "@/components/ResultCell.vue";
import SectionCard from "@/components/SectionCard.vue";

defineProps<{
  result: AnnularSectionResult | null;
}>();
</script>

<template>
  <SectionCard title="計算結果">
    <div class="flex w-full flex-col gap-2">
      <AccordionSection
        title="中立軸および合成断面力"
        default-open
      >
        <ResultCell
          label="中立軸位置"
          symbol="x"
          :symbol-tooltip="resultTooltips.x"
          :value="formatNumber(result?.neutralAxis?.neutralAxisPosition_Mm, 1)"
          :value-width="12"
          unit="mm"
        />
        <ResultCell
          label="合成曲げモーメント"
          symbol="Mo"
          :symbol-tooltip="resultTooltips.M_o"
          :value="formatNumber(result?.loading?.combinedMoment_KNm, 1)"
          :value-width="12"
          unit="kN.m"
        />
      </AccordionSection>

      <AccordionSection title="発生応力度">
        <ResultCell
          label="コンクリート圧縮応力度"
          symbol="σc"
          :symbol-tooltip="resultTooltips.sigma_c"
          :value="formatNumber(result?.stress?.concreteCompressionStress_NPerMm2, 2)"
          :value-width="12"
          unit="N/mm²"
        />
        <ResultCell
          label="鉄筋引張応力度"
          symbol="σs"
          :symbol-tooltip="resultTooltips.sigma_s"
          :value="formatNumber(result?.stress?.rebarStress_NPerMm2, 2)"
          :value-width="12"
          unit="N/mm²"
        />
        <ResultCell
          label="コンクリートせん断応力度"
          symbol="τc"
          :symbol-tooltip="resultTooltips.tau_c"
          :value="formatNumber(result?.stress?.concreteShearStress_NPerMm2, 2)"
          :value-width="12"
          unit="N/mm²"
        />
        <ResultCell
          label="鉄筋せん断応力度"
          symbol="τs"
          :symbol-tooltip="resultTooltips.tau_s"
          :value="formatNumber(result?.stress?.rebarShearStress_NPerMm2, 2)"
          :value-width="12"
          unit="N/mm²"
        />
      </AccordionSection>

      <AccordionSection
        title="終局耐力"
        default-open
      >
        <ResultCell
          label="コンクリート終局曲げモーメント"
          symbol="Mc"
          :symbol-tooltip="resultTooltips.M_c"
          :value="formatNumber(result?.strength?.concreteUltimateMoment_KNm, 0)"
          :value-width="10"
          unit="kN.m"
        />
        <ResultCell
          label="鉄筋降伏曲げモーメント"
          symbol="Mb"
          :symbol-tooltip="resultTooltips.M_b"
          :value="formatNumber(result?.strength?.rebarYieldMoment_KNm, 0)"
          :value-width="10"
          unit="kN.m"
        />
      </AccordionSection>

      <AccordionSection
        title="断面積"
        default-open
      >
        <ResultCell
          label="鉄筋総断面積"
          symbol="As"
          :symbol-tooltip="resultTooltips.A_s"
          :value="formatNumber(result?.section?.rebarTotalArea_Mm2, 0)"
          :value-width="14"
          unit="mm²"
        />
        <ResultCell
          label="コンクリート総断面積"
          symbol="Ac"
          :symbol-tooltip="resultTooltips.A_c"
          :value="formatNumber(result?.section?.concreteSectionArea_Mm2, 0)"
          :value-width="14"
          unit="mm²"
        />
        <ResultCell
          label="鉄筋比（コンクリート実断面）"
          symbol="p"
          :symbol-tooltip="resultTooltips.p"
          :value="formatNumber(result?.section?.actualRebarRatioPercent, 2)"
          :value-width="14"
          unit="%"
        />
      </AccordionSection>

      <AccordionSection title="係数">
        <ResultCell
          label="中立軸角度"
          symbol="θ"
          :symbol-tooltip="resultTooltips.theta"
          :value="formatNumber(result?.neutralAxis?.neutralAxisAngleDeg, 4)"
          :value-width="14"
          unit="deg"
        />
        <ResultCell
          label="幾何係数"
          symbol="α"
          :symbol-tooltip="resultTooltips.alpha"
          :value="formatNumber(result?.section?.alpha, 4)"
          :value-width="14"
        />
        <ResultCell
          label="幾何係数"
          symbol="γ"
          :symbol-tooltip="resultTooltips.gamma"
          :value="formatNumber(result?.section?.gamma, 4)"
          :value-width="14"
        />
        <ResultCell
          label="コンクリート圧縮応力度係数"
          symbol="fc"
          :symbol-tooltip="resultTooltips.f_c"
          :value="formatNumber(result?.neutralAxis?.concreteCompressionCoefficient, 4)"
          :value-width="14"
        />
        <ResultCell
          label="鋼材応力度係数"
          symbol="fs"
          :symbol-tooltip="resultTooltips.f_s"
          :value="formatNumber(result?.neutralAxis?.steelStressCoefficient, 4)"
          :value-width="14"
        />
        <ResultCell
          label="せん断応力度係数"
          symbol="fv"
          :symbol-tooltip="resultTooltips.f_v"
          :value="formatNumber(result?.neutralAxis?.shearCoefficient, 4)"
          :value-width="14"
        />
      </AccordionSection>
      <div class="text-xs text-slate-500">
        <IoInformationCircle class="mr-1 inline-block h-5 w-5" />
        記号をホバーすると算出式が表示されます
      </div>
    </div>
  </SectionCard>
</template>

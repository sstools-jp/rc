import type { AnnularSectionResult } from "@/models/annular-section";
import type { FormState } from "@/forms/form-state";
import type { SectionForceMode } from "@/components/SectionForceModeSelector";
import { formatNumber, parseNumber } from "@/utils/number-format";

export type PrintPreviewRow = {
  label: string;
  symbol?: string;
  unit?: string;
  value: string;
};

export type PrintPreviewSection = {
  title: string;
  rows: PrintPreviewRow[];
};

export type CopyBlock = {
  title: string;
  header: string;
  sections: PrintPreviewSection[];
};

/** フォームの入力値から印刷用の断面データを構築する関数 */
export function buildInputPreviewSections(
  form: FormState,
  sectionForceMode: SectionForceMode,
): PrintPreviewSection[] {
  const forceRows =
    sectionForceMode === "3"
      ? [
          {
            label: "曲げモーメント",
            symbol: "M",
            unit: "kN.m",
            value: formatNumber(parseNumber(form.my_KNm), 2),
          },
          { label: "せん断力", symbol: "S", unit: "kN", value: formatNumber(parseNumber(form.fz_KN), 2) },
          {
            label: "軸力（引張を正）",
            symbol: "N",
            unit: "kN",
            value: formatNumber(parseNumber(form.fx_KN), 2),
          },
        ]
      : [
          {
            label: "軸力（引張を正）",
            symbol: "Fx",
            unit: "kN",
            value: formatNumber(parseNumber(form.fx_KN), 2),
          },
          {
            label: "せん断力（面外）",
            symbol: "Fy",
            unit: "kN",
            value: formatNumber(parseNumber(form.fy_KN), 2),
          },
          {
            label: "せん断力（面内）",
            symbol: "Fz",
            unit: "kN",
            value: formatNumber(parseNumber(form.fz_KN), 2),
          },
          {
            label: "ねじりモーメント",
            symbol: "Mx",
            unit: "kN.m",
            value: formatNumber(parseNumber(form.mx_KNm), 2),
          },
          {
            label: "曲げモーメント（面内）",
            symbol: "My",
            unit: "kN.m",
            value: formatNumber(parseNumber(form.my_KNm), 2),
          },
          {
            label: "曲げモーメント（面外）",
            symbol: "Mz",
            unit: "kN.m",
            value: formatNumber(parseNumber(form.mz_KNm), 2),
          },
        ];

  return [
    { title: "断面力", rows: forceRows },
    {
      title: "寸法・鉄筋",
      rows: [
        {
          label: "半径（外径）",
          symbol: "r",
          unit: "mm",
          value: formatNumber(parseNumber(form.outerRadius_Mm), 0),
        },
        {
          label: "半径（内径）",
          symbol: "r0",
          unit: "mm",
          value: formatNumber(parseNumber(form.innerRadius_Mm), 0),
        },
        {
          label: "鉄筋位置（半径）",
          symbol: "rs",
          unit: "mm",
          value: formatNumber(parseNumber(form.rebarRadius_Mm), 0),
        },
        form.rebarKind === "round"
          ? {
              label: "丸鋼径",
              symbol: "φ",
              unit: "mm",
              value: formatNumber(parseNumber(form.roundRebarDiameter_Mm), 0),
            }
          : {
              label: "鉄筋径",
              symbol: "D",
              value: `D${form.rebarDiameter_Mm}`,
            },
        { label: "鉄筋本数", symbol: "H", unit: "本", value: formatNumber(parseNumber(form.barCount), 0) },
      ],
    },
    {
      title: "諸係数",
      rows: [
        form.rebarStrengthMode === "material"
          ? {
              label: "鉄筋材質",
              value: String(form.rebarMaterialName),
            }
          : {
              label: "鉄筋降伏強度",
              symbol: "fy",
              unit: "N/mm²",
              value: formatNumber(parseNumber(form.rebarYieldStrength_NPerMm2), 0),
            },
        {
          label: "コンクリート設計基準強度",
          symbol: "σck",
          unit: "N/mm²",
          value: formatNumber(parseNumber(form.concreteDesignStrength_NPerMm2), 0),
        },
        {
          label: "ヤング係数比",
          symbol: "n",
          value: formatNumber(parseNumber(form.youngRatio), 0),
        },
        {
          label: "コンクリート強度補正係数",
          symbol: "kc",
          value: formatNumber(parseNumber(form.concreteStrengthFactor), 2),
        },
      ],
    },
  ];
}

/**
 * 計算結果から印刷用の断面データを構築する関数
 *
 * 結果が `null` の場合は空の値を表示する
 */
export function buildResultPreviewSections(result: AnnularSectionResult | null): PrintPreviewSection[] {
  const section = result?.section;
  const loading = result?.loading;
  const neutralAxis = result?.neutralAxis;
  const stress = result?.stress;
  const strength = result?.strength;

  return [
    {
      title: "中立軸・合成断面力",
      rows: [
        {
          label: "中立軸位置",
          symbol: "x",
          unit: "mm",
          value: formatNumber(neutralAxis?.neutralAxisPosition_Mm, 1),
        },
        {
          label: "合成曲げモーメント",
          symbol: "Mo",
          unit: "kN.m",
          value: formatNumber(loading?.combinedMoment_KNm, 1),
        },
      ],
    },
    {
      title: "発生応力度",
      rows: [
        {
          label: "コンクリート圧縮応力度",
          symbol: "σc",
          unit: "N/mm²",
          value: formatNumber(stress?.concreteCompressionStress_NPerMm2, 2),
        },
        {
          label: "鉄筋引張応力度",
          symbol: "σs",
          unit: "N/mm²",
          value: formatNumber(stress?.rebarStress_NPerMm2, 2),
        },
        {
          label: "コンクリートせん断応力度",
          symbol: "τc",
          unit: "N/mm²",
          value: formatNumber(stress?.concreteShearStress_NPerMm2, 2),
        },
        {
          label: "鉄筋せん断応力度",
          symbol: "τs",
          unit: "N/mm²",
          value: formatNumber(stress?.rebarShearStress_NPerMm2, 2),
        },
      ],
    },
    {
      title: "終局耐力",
      rows: [
        {
          label: "コンクリート終局曲げモーメント",
          symbol: "Mc",
          unit: "kN.m",
          value: formatNumber(strength?.concreteUltimateMoment_KNm, 1),
        },
        {
          label: "鉄筋降伏曲げモーメント",
          symbol: "Mb",
          unit: "kN.m",
          value: formatNumber(strength?.rebarYieldMoment_KNm, 1),
        },
      ],
    },
    {
      title: "断面情報",
      rows: [
        {
          label: "鉄筋総断面積",
          symbol: "As",
          unit: "mm²",
          value: formatNumber(section?.rebarTotalArea_Mm2, 0),
        },
        {
          label: "鉄筋比",
          symbol: "p",
          unit: "%",
          value: formatNumber(section?.rebarRatioPercent, 2),
        },
      ],
    },
  ];
}

/**
 * クリップボードにコピーするテキストを構築する関数
 *
 * 表計算ソフトへの貼り付けを想定してTSV形式で出力する
 */
export function buildClipboardText(blocks: CopyBlock[]): string {
  const lines: string[] = [];

  for (const block of blocks) {
    lines.push(block.title);
    lines.push(block.header);

    for (const section of block.sections) {
      for (const row of section.rows) {
        lines.push([section.title, row.label, row.symbol ?? "-", row.unit ?? "-", row.value].join("\t"));
      }
    }

    lines.push("");
  }

  return lines.join("\n").trimEnd();
}

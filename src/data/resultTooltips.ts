export type TooltipDoc = {
  key: string;
  title: string;
  lines: string[];
};

export const resultTooltips: Record<string, TooltipDoc> = {
  neutral: {
    key: "neutral",
    title: "中立軸および換算曲げモーメント",
    lines: ["- 換算曲げモーメント", "  - せん断力の影響を考慮して、実際の曲げモーメントに換算した値"],
  },
  stress: {
    key: "stress",
    title: "発生応力度",
    lines: [
      "- コンクリート圧縮応力度",
      "- 鉄筋引張応力度",
      String.raw`  $\\sigma_s=\\min(E_s\\,\\epsilon_s,\\,\\sigma_{sy})$`,
      "- コンクリートせん断応力度",
      "- 鉄筋せん断応力度",
    ],
  },
  ultimate: {
    key: "ultimate",
    title: "終局耐力",
    lines: [
      "- コンクリート終局曲げモーメント",
      String.raw`  $M_c = \\{ M \\mid \\sigma_c(M) = \\sigma_{cy} \\}$`,
      "- 鉄筋降伏曲げモーメント",
      String.raw`  $M_b = \\{ M \\mid \\sigma_s(M) = \\sigma_{sy} \\}$`,
    ],
  },
  area: {
    key: "area",
    title: "断面積",
    lines: [
      "- コンクリート総断面積",
      String.raw`  $A_c = \\pi \\left( \\dfrac{D^2 - d^2}{4} \\right)$`,
      "- 鉄筋総断面積",
      String.raw`  $A_s = n \\times \\dfrac{\\pi d_s^2}{4}$`,
      "- 鉄筋比",
      String.raw`  $\\dfrac{A_s}{A_c} \\times 100\\%$`,
    ],
  },
};

export default resultTooltips;

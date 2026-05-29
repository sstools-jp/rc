export type TooltipDoc = {
  key: string;
  title: string;
  lines: string[];
};

/** Markdown 数式 (タグ付きテンプレートリテラルとして使用) */
const math = (strings: TemplateStringsArray, ...values: Array<string | number>) =>
  `$${String.raw(strings, ...values)}$`;

export const resultTooltips: Record<string, TooltipDoc> = {
  neutral: {
    key: "neutral",
    title: "中立軸および換算曲げモーメント",
    lines: ["換算曲げモーメント", math`M' = M + N \times r`],
  },
  stress: {
    key: "stress",
    title: "発生応力度",
    lines: [
      "コンクリート圧縮応力度",
      math`\sigma_c = \dfrac{M' \times 1000}{r^3}\,\kappa_c`,
      "---",
      "鉄筋引張応力度",
      math`\sigma_s=\min(E_s\,\epsilon_s,\,\sigma_{sy})`,
      "---",
      "コンクリートせん断応力度",
      math`\tau = \dfrac{V \times 1000}{r^2} \kappa_s + \dfrac{M_x \times 1000^2}{Z_p}`,
      math`\tau_c = \min(\tau,\,\tau_{c0})`,
      "---",
      "鉄筋せん断応力度",
      math`\tau_s = \max(\tau - \tau_{c0},\,0)`,
    ],
  },
  ultimate: {
    key: "ultimate",
    title: "終局耐力",
    lines: [
      "コンクリート終局曲げモーメント",
      math`M_c = \{ M \mid \sigma_c(M) = \sigma_{cy} \}`,
      "---",
      "鉄筋降伏曲げモーメント",
      math`M_b = \{ M \mid \sigma_s(M) = \sigma_{sy} \}`,
    ],
  },
  area: {
    key: "area",
    title: "断面積",
    lines: [
      "鉄筋総断面積",
      math`A_s = n \times \dfrac{\pi d_s^2}{4}`,
      "---",
      "コンクリート総断面積",
      math`A_c = \pi \left( \dfrac{D^2 d^2}{4} \right)`,
      "---",
      "鉄筋比",
      math`\dfrac{A_s}{A_c} \times 100\%`,
    ],
  },
};

export default resultTooltips;

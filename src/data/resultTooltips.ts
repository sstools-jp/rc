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
    title: "中立軸および合成断面力",
    lines: [
      "中立軸位置",
      math`x = \dfrac{\kappa_c}{\kappa_c + \kappa_s}(r_o + r_s)`,
      "---",
      "合成曲げモーメント",
      math`M_o = M + N \times r`,
    ],
  },
  stress: {
    key: "stress",
    title: "発生応力度",
    lines: [
      "コンクリート圧縮応力度",
      math`\sigma_c = \dfrac{M_o}{r^3}\,\kappa_c`,
      "---",
      "鉄筋引張応力度",
      math`\sigma_s=\min(E_s\,\epsilon_s,\,\sigma_{sy})`,
      "---",
      "コンクリートせん断応力度",
      math`\tau = \dfrac{V}{r^2} \kappa_s + \dfrac{M_x}{Z_p}`,
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
      math`p = \dfrac{A_s}{A_c} \times 100\%`,
    ],
  },
  coefficient: {
    key: "coefficient",
    title: "係数",
    lines: [
      "中立軸角度",
      math`\theta = \arg\min_\theta \left|f(\theta)\right|`,
      "---",
      "幾何係数",
      math`\alpha = \dfrac{r_s}{r}`,
      "---",
      "幾何係数",
      math`\gamma = \dfrac{r_0}{r}`,
      "---",
      "コンクリート圧縮係数",
      math`\kappa_c = \dfrac{\sigma_c}{f_c'}`,
      "---",
      "鋼材応力度係数",
      math`\kappa_s = \dfrac{\sigma_s}{f_y}`,
      "---",
      "せん断係数",
      math`\kappa_v = \dfrac{\tau}{\tau_{c0}}`,
    ],
  },
};

export default resultTooltips;

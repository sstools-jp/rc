import type { TooltipContent } from "@/components/Tooltip";

/** Markdown 数式 (タグ付きテンプレートリテラルとして使用) */
const math = (strings: TemplateStringsArray, ...values: Array<string | number>) =>
  `$${String.raw(strings, ...values)}$`;

export const resultTooltips: Record<string, TooltipContent> = {
  x: {
    title: "中立軸位置",
    line: math`x = \dfrac{f_c}{f_c + f_s}(r_o + r_s)`,
  },
  M_o: {
    title: "合成曲げモーメント",
    line: math`M_o = M + N \times r`,
  },
  sigma_c: {
    title: "コンクリート圧縮応力度",
    line: math`\sigma_c = \dfrac{M_o}{r^3} \times f_c`,
  },
  sigma_s: {
    title: "鉄筋引張応力度",
    line: math`\sigma_s=\min(E_s\,\epsilon_s,\,\sigma_{sy})`,
  },
  tau_c: {
    title: "コンクリートせん断応力度",
    line: math`\tau_c = \min(\tau, \tau_\text{ca})`,
    nestedLines: [math`\tau = \dfrac{S}{r^2} \times f_v + \dfrac{M_x}{Z_p}`],
  },
  tau_s: {
    title: "鉄筋せん断応力度",
    line: math`\tau_s = \max(0, \tau - \tau_\text{ca})`,
    nestedLines: [math`\tau = \dfrac{S}{r^2} \times f_v + \dfrac{M_x}{Z_p}`],
  },
  M_c: {
    title: "コンクリート終局曲げモーメント",
    line: math`M_c = \{ M \mid \sigma_c(M) = \sigma_{cy} \}`,
  },
  M_b: {
    title: "鉄筋降伏曲げモーメント",
    line: math`M_b = \{ M \mid \sigma_s(M) = \sigma_{sy} \}`,
  },
  A_s: {
    title: "鉄筋総断面積",
    line: math`A_s = H \times \dfrac{\pi}{2} r_s^2`,
  },
  A_c: {
    title: "コンクリート総断面積",
    line: math`A_c = \dfrac{\pi}{2} (r^2 - r_0^2)`,
  },
  p: {
    title: "鉄筋比（コンクリート実断面）",
    line: math`p = \dfrac{A_s}{A_c} \times 100\%`,
  },
  theta: {
    title: "中立軸角度",
    line: math`\theta = \arg\min\nolimits_\theta \left|f(\theta)\right|`,
    nestedLines: [
      {
        line: math`f(\theta) =
                    \begin{cases}
                    f_{\text{zero}}   (\theta, \theta_{\text{in}}) & (N = 0) \\
                    f_{\text{nonzero}}(\theta, \theta_{\text{in}}) & (N \ne 0)
                    \end{cases}`,
        nestedLines: [
          math`\begin{aligned}
               f_{\text{zero}}(\theta, \theta_{\text{in}}) = &
               \biggl| \frac{\sin\theta}{3} (2 + \cos^2\theta) - \theta \cos\theta \\
               \ & - \gamma^3 \left[ \frac{\sin\theta_{\text{in}}}{3} (2 + \cos^2\theta_{\text{in}})
               \ - \theta_{\text{in}} \cos\theta_{\text{in}} \right]
               \ - \pi n p \cos\theta \biggr|
               \end{aligned}`,
          math`\begin{aligned}
               f_{\text{nonzero}}(\theta, \theta_{\text{in}}) = & \left| \beta - \frac{\text{Numerator}}{\text{Denominator}} \right| \\
               \text{Numerator} = & \frac{\theta}{4} - \sin\theta \cos\theta \left( \frac{5}{12} - \frac{1}{6} \cos^2\theta \right) \\
               & - \gamma^4 \left[ \frac{\theta_{\text{in}}}{4} - \sin\theta_{\text{in}} \cos\theta_{\text{in}}
               \left( \frac{5}{12} - \frac{1}{6} \cos^2\theta_{\text{in}} \right) \right] + \frac{\pi}{2} n p \alpha^2 \\
               \text{Denominator} = & \frac{\sin\theta}{3} (2 + \cos^2\theta) - \theta \cos\theta \\
               & - \gamma^3 \left[ \frac{\sin\theta_{\text{in}}}{3} (2 + \cos^2\theta_{\text{in}})
               \ - \theta_{\text{in}} \cos\theta_{\text{in}} \right] - \pi n p \cos\theta
               \end{aligned}`,
          math`\theta_{\text{in}} =
               \begin{cases}
               0 & (\theta \le \arccos\gamma) \\
               \arccos\left(\dfrac{\cos\theta}{\gamma}\right) & (\arccos\gamma < \theta \le \arccos(-\gamma)) \\
               \pi & (\theta > \arccos(-\gamma))
               \end{cases}`,
        ],
      },
    ],
  },
  alpha: {
    title: "幾何係数",
    line: math`\alpha = \dfrac{r_s}{r}`,
  },
  beta: {
    title: "幾何係数",
    line: math`\beta  = \dfrac{M}{N r}`,
  },
  gamma: {
    title: "幾何係数",
    line: math`\gamma = \dfrac{r_0}{r}`,
  },
  f_c: {
    title: "コンクリート圧縮応力度係数",
    line: math`\begin{aligned}
                f_c(\theta, \theta_{\text{in}}) =
                & \frac{\text{Numerator}}{\text{Denominator}} \\
                \text{Numerator} = & 1 - \cos\theta \\
                \text{Denominator} =
                & \frac{2}{3} \sin^3\theta - \theta \cos\theta + \sin\theta \cos^2\theta + \frac{\theta}{4}
                \ - \frac{1}{4} \sin\theta \cos\theta - \frac{1}{6} \sin^3\theta \cos\theta \\
                & - \gamma^3 \left[ \frac{2}{3} \sin^3\theta_{\text{in}} - \theta_{\text{in}} \cos\theta_{\text{in}}
                \ + \sin\theta_{\text{in}} \cos^2\theta_{\text{in}} \\
                \ + \gamma \left( \frac{\theta_{\text{in}}}{4} - \frac{1}{4} \sin\theta_{\text{in}} \cos\theta_{\text{in}}
                \ - \frac{1}{6} \sin^3\theta_{\text{in}} \cos\theta_{\text{in}} \right) \right] \\
                & + \pi n p \left( \frac{1}{2} \alpha^2 - \cos\theta \right)
                \end{aligned}`,
  },
  f_s: {
    title: "鋼材応力度係数",
    line: math`f_s(\theta, \theta_{\text{in}}) = f_c(\theta, \theta_{\text{in}}) \times \dfrac{\alpha + \cos\theta}{1 - \cos\theta}`,
  },
  f_v: {
    title: "せん断応力度係数",
    line: math`f_v(\theta, \theta_{\text{in}}) = \dfrac
                {
                  \alpha \sin x_s - (\pi - x_s)(z_3 - 1)
                }{
                  2 z_2 ( \sin\theta - \gamma \sin\theta_{\text{in}} )
                } n p`,
    nestedLines: [
      math`x_s = \arccos\left( \dfrac{1}{\alpha} \cos\theta \right)`,
      math`\begin{array}{rcl}
            z_2 & = & z_3^2 (\theta - \sin\theta \cos\theta)
                    \ + 2 z_3 \left( -\theta + \sin\theta \cos\theta + \dfrac{2}{3} \sin^3\theta \right) \\
                &   & + \dfrac{5}{4} ( \theta - \sin\theta \cos\theta )
                      + \sin^3\theta \left( \dfrac{\cos\theta}{2} - \dfrac{4}{3} \right) \\
                &   & - \gamma^2 z_3^2 ( \theta_{\text{in}} - \sin\theta_{\text{in}} \cos\theta_{\text{in}} )
                    \ - 2 \gamma^2 z_3 \left( -\theta_{\text{in}} + \sin\theta_{\text{in}} \cos\theta_{\text{in}} +
                      \dfrac{2}{3} \gamma \sin^3\theta_{\text{in}} \right) \\
                &   & - \gamma^2 \left( 1 + \dfrac{\gamma^2}{4} \right) ( \theta_{\text{in}} - \sin\theta_{\text{in}} \cos\theta_{\text{in}} )
                    \ - \gamma^3 \sin^3\theta_{\text{in}} \left( \dfrac{\gamma \cos\theta_{\text{in}}}{2} - \dfrac{4}{3} \right) \\
                &   & + \pi n p \left(\dfrac{\alpha^2}{2} + (1 - z_3)^2 \right)
               \end{array}`,
      math`z_3 = \dfrac
            {
              \theta - \sin\theta \cos\theta - \dfrac{2}{3} \sin^3\theta -
              \gamma^2 \left( \theta_{\text{in}} - \sin\theta_{\text{in}} \cos\theta_{\text{in}} -
              \dfrac{2}{3} \gamma \sin^3\theta_{\text{in}} \right) + \pi n p
            }{
              \theta - \sin\theta \cos\theta - \gamma^2 ( \theta_{\text{in}} -
              \sin\theta_{\text{in}} \cos\theta_{\text{in}} ) + \pi n p
            }`,
    ],
  },
};

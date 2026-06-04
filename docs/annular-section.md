# 円環断面 算出項目一覧

## 中立軸および合成断面力

### 中立軸位置

$$
\large
x = \frac{f_c}{f_c + f_s}(r_o + r_s)
$$

### 合成曲げモーメント

$$
\large
M_o = M + N \times r
$$

## 発生応力度

### コンクリート圧縮応力度

$$
\large
\sigma_c = \dfrac{M_o}{r^3} \times f_c
$$

### 鉄筋引張応力度

$$
\large
\sigma_s = \dfrac{M_o}{r^3} \times f_s \times n
$$

### コンクリートせん断応力度

$$
\large
\begin{aligned}
\tau_c & = \min(\tau, \tau_\text{ca}) \\
\tau   & = \dfrac{S}{r^2} \times f_v + \dfrac{M_x}{Z_p}
\end{aligned}
$$

### 鉄筋せん断応力度

$$
\large
\begin{aligned}
\tau_s & = \max(0, \tau - \tau_\text{ca}) \\
\tau   & = \dfrac{S}{r^2} \times f_v + \dfrac{M_x}{Z_p}
\end{aligned}
$$

## 断面積

### 鉄筋総断面積

$$
\large
A_s = H \times \dfrac{\pi}{2} r_s^2
$$

### コンクリート総断面積

$$
\large
A_c = \dfrac{\pi}{2} (r^2 - r_0^2)
$$

### 鉄筋比（コンクリート実断面）

$$
\large
p = \dfrac{A_s}{A_c} \times 100\%
$$

## 係数

### 中立軸角度

$$
\large
\theta = \arg\min\nolimits_\theta \left|f(\theta)\right|
$$

$$
\large
f(\theta) = \begin{cases}
  f_{\text{zero}}   (\theta, \theta_{\text{in}}) & (\text{if } |N| <   0)
  \\
  f_{\text{nonzero}}(\theta, \theta_{\text{in}}) & (\text{if } |N| \ge 0)
  \end{cases}
$$

$$
\large
\begin{aligned}
f_{\text{zero}}(\theta, \theta_{\text{in}}) =
& \biggl| \frac{\sin\theta}{3} (2 + \cos^2\theta) - \theta \cos\theta
\\
& - \gamma^3 \left[ \frac{\sin\theta_{\text{in}}}{3} (2 + \cos^2\theta_{\text{in}}) - \theta_{\text{in}} \cos\theta_{\text{in}} \right]
\\
& - \pi n p \cos\theta \biggr|
\end{aligned}
$$

$$
\large
\begin{aligned}
f_{\text{nonzero}}(\theta, \theta_{\text{in}}) = & \left| \beta - \frac{N}{D} \right|
\\
N = & \frac{\theta}{4} - \sin\theta \cos\theta \left( \frac{5}{12} - \frac{1}{6} \cos^2\theta \right) \\
  & - \gamma^4 \left[ \frac{\theta_{\text{in}}}{4} - \sin\theta_{\text{in}} \cos\theta_{\text{in}}
  \left( \frac{5}{12} - \frac{1}{6} \cos^2\theta_{\text{in}} \right) \right] + \frac{\pi}{2} n p \alpha^2
\\
D = & \frac{\sin\theta}{3} (2 + \cos^2\theta) - \theta \cos\theta \\
& - \gamma^3 \left[ \frac{\sin\theta_{\text{in}}}{3} (2 + \cos^2\theta_{\text{in}}) - \theta_{\text{in}} \cos\theta_{\text{in}} \right] - \pi n p \cos\theta
\end{aligned}
$$

$$
\large
\theta\_{\text{in}} =
\begin{cases}
0 & (\theta \le \arccos\gamma) \\
\arccos\left(\dfrac{\cos\theta}{\gamma}\right) & (\arccos\gamma < \theta \le \arccos(-\gamma)) \\
\pi & (\theta > \arccos(-\gamma))
\end{cases}
$$

### 幾何係数

$$
\large
\alpha = \dfrac{r_s}{r}, \quad
\beta  = \dfrac{M}{N r}, \quad
\gamma = \dfrac{r_0}{r}
$$

### コンクリート圧縮応力度係数

$$
\large
\begin{aligned}
f_c(\theta, \theta_{\text{in}}) =
  & \frac{\text{Numerator}}{\text{Denominator}} \\
\text{Numerator} = & 1 - \cos\theta \\
\text{Denominator} =
  & \frac{2}{3} \sin^3\theta - \theta \cos\theta + \sin\theta \cos^2\theta + \frac{\theta}{4} - \frac{1}{4} \sin\theta \cos\theta - \frac{1}{6} \sin^3\theta \cos\theta
  \\
  & - \gamma^3 \left[ \frac{2}{3} \sin^3\theta_{\text{in}} - \theta_{\text{in}} \cos\theta_{\text{in}} + \sin\theta_{\text{in}} \cos^2\theta_{\text{in}} +
  \\
  \gamma \left( \frac{\theta_{\text{in}}}{4} - \frac{1}{4} \sin\theta_{\text{in}} \cos\theta_{\text{in}} -
  \frac{1}{6} \sin^3\theta_{\text{in}} \cos\theta_{\text{in}} \right) \right] \\
  & + \pi n p \left( \frac{1}{2} \alpha^2 - \cos\theta \right)
\end{aligned}
$$

### 鋼材応力度係数

$$
\large
f_s(\theta, \theta_{\text{in}}) = f_c(\theta, \theta_{\text{in}}) \times \frac{\alpha + \cos\theta}{1 - \cos\theta}
$$

---

### せん断応力度係数

$$
\large
f_v(\theta, \theta_{\text{in}}) = \frac
{
  n p \left\{ \alpha \sin x_s - (\pi - x_s)(z_3 - 1) \right\}
}{
 2 ( \sin\theta - \gamma \sin\theta_{\text{in}} ) z_2
}
$$

$$
\large
x_s = \arccos\left( \frac{1}{\alpha} \cos\theta \right)
$$

$$
\large
\begin{array}{rcl}
z_2 & = & z_3^2 (\theta - \sin\theta \cos\theta)
          + 2 z_3 \left( -\theta + \sin\theta \cos\theta + \dfrac{2}{3} \sin^3\theta \right) \\
    &   & + \dfrac{5}{4} ( \theta - \sin\theta \cos\theta )
          + \sin^3\theta \left( \dfrac{\cos\theta}{2} - \dfrac{4}{3} \right) \\
    &   & - \gamma^2 z_3^2 ( \theta_{\text{in}} - \sin\theta_{\text{in}} \cos\theta_{\text{in}} )
          - 2 \gamma^2 z_3 \left( -\theta_{\text{in}} + \sin\theta_{\text{in}} \cos\theta_{\text{in}} +
            \dfrac{2}{3} \gamma \sin^3\theta_{\text{in}} \right) \\
    &   & - \gamma^2 \left( 1 + \dfrac{\gamma^2}{4} \right) ( \theta_{\text{in}} - \sin\theta_{\text{in}} \cos\theta_{\text{in}} )
          - \gamma^3 \sin^3\theta_{\text{in}} \left( \dfrac{\gamma \cos\theta_{\text{in}}}{2} - \dfrac{4}{3} \right) \\
    &   & + \pi n p \left(\dfrac{\alpha^2}{2} + (1 - z_3)^2 \right)
\end{array}
$$

$$
\large
z_3 = \dfrac
{
  \theta - \sin\theta \cos\theta - \dfrac{2}{3} \sin^3\theta -
  \gamma^2 \left( \theta_{\text{in}} - \sin\theta_{\text{in}} \cos\theta_{\text{in}} -
  \dfrac{2}{3} \gamma \sin^3\theta_{\text{in}} \right) + \pi n p
}{
  \theta - \sin\theta \cos\theta - \gamma^2 ( \theta_{\text{in}} -
  \sin\theta_{\text{in}} \cos\theta_{\text{in}} ) + \pi n p
}
$$

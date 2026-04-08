export const REBAR_DIAMETERS_MM = [6, 8, 10, 13, 16, 19, 22, 25, 29, 32, 35, 38, 41, 51] as const;

// 鉄筋径を表す型
export type RebarDiameterMm = (typeof REBAR_DIAMETERS_MM)[number];

// 鉄筋径に対応する断面積[mm2]を定義
export const REBAR_AREAS_MM2: Readonly<Record<RebarDiameterMm, number>> = {
  6: 31.67,
  8: 49.51,
  10: 71.33,
  13: 126.7,
  16: 198.6,
  19: 286.5,
  22: 387.1,
  25: 506.7,
  29: 642.4,
  32: 794.2,
  35: 956.6,
  38: 1140,
  41: 1340,
  51: 2027,
};

// 軸力の符号を表す型
export type AxialForceSign = "compression" | "tension" | "zero";

// 入力データの型定義
// prettier-ignore
export interface AnnularSectionInput {
  momentKNm:      number; // 曲げモーメント [kN.m]
  shearKN:        number; // せん断力 [kN]
  axialKN:        number; // 軸力 [kN]
  outerRadiusMm:  number; // 外径 [mm]
  innerRadiusMm:  number; // 内径 [mm]
  rebarRadiusMm:  number; // 鉄筋の位置（有効半径） [mm]
  rebarDiameterMm: RebarDiameterMm; // 鉄筋径 [mm]
  barCount:       number; // 鉄筋の本数
  youngRatio:     number; // ヤング係数比（鋼材のヤング係数 / コンクリートのヤング係数）
  rebarYieldStrengthNPerMm2: number; // 鉄筋降伏強度 [N/mm2]
  concreteDesignStrengthNPerMm2: number; // コンクリート設計基準強度 [N/mm2]
}

// 検算結果の型定義
export interface AnnularSectionValidationIssue {
  field: keyof AnnularSectionInput;
  message: string;
}

// 計算結果の型定義
// prettier-ignore
export interface AnnularSectionResult {
  sectionAreaMm2:                   number;   // 断面積 [mm2]
  fullSectionAreaMm2:               number;   // 全断面積 [mm2]
  innerSectionAreaMm2:              number;   // 内部断面積 [mm2]
  rebarAreaPerBarMm2:               number;   // 1本あたりの鉄筋断面積 [mm2]
  totalRebarAreaMm2:                number;   // 鉄筋総断面積 [mm2]
  rebarRatioPercent:                number;   // 鉄筋比 [%]
  alpha:                            number;   // 中立軸位置の係数
  gamma:                            number;   // 軸力係数
  combinedMomentKNm:                number;   // 換算曲げモーメント [kN.m]
  axialForceSign: AxialForceSign;             // 軸力の符号
  youngRatio:                       number;   // ヤング係数比
  neutralAxisAngleDeg:              number;   // 中立軸角度 [deg]
  neutralAxisPositionMm:            number;   // 中立軸位置 [mm]
  concreteCompressionCoefficient:   number;   // コンクリート圧縮応力度係数
  steelStressCoefficient:           number;   // 鋼材応力度係数
  shearCoefficient:                 number;   // せん断応力度係数
  // 応力度
  concreteCompressionStressNPerMm2: number;   // コンクリート圧縮応力度 [N/mm2]
  rebarStressNPerMm2:               number;   // 鉄筋応力度 [N/mm2]
  concreteShearStressNPerMm2:       number;   // コンクリートせん断応力度 [N/mm2]
}

// 数値計算用の極小値（ゼロ判定用）
const EPSILON = 1e-9;

// 円環断面の計算クラス
export class AnnularSectionCalculator {
  private readonly input: AnnularSectionInput;

  constructor(input: AnnularSectionInput) {
    this.input = input;
  }

  // 入力値の検査
  validate(): AnnularSectionValidationIssue[] {
    const issues: AnnularSectionValidationIssue[] = [];
    const {
      momentKNm,
      shearKN,
      axialKN,
      outerRadiusMm,
      innerRadiusMm,
      rebarRadiusMm,
      rebarDiameterMm,
      barCount,
      youngRatio,
      rebarYieldStrengthNPerMm2,
      concreteDesignStrengthNPerMm2,
    } = this.input;

    if (!Number.isFinite(momentKNm)) {
      const message = "モーメントは数値で指定してください。";
      issues.push({ field: "momentKNm", message });
    }
    if (!Number.isFinite(shearKN)) {
      const message = "せん断力は数値で指定してください。";
      issues.push({ field: "shearKN", message });
    }
    if (!Number.isFinite(axialKN)) {
      const message = "軸力は数値で指定してください。";
      issues.push({ field: "axialKN", message });
    }
    if (!Number.isFinite(outerRadiusMm) || outerRadiusMm <= 0) {
      const message = "半径（外）は正の数で指定してください。";
      issues.push({ field: "outerRadiusMm", message });
    }
    if (!Number.isFinite(innerRadiusMm) || innerRadiusMm < 0) {
      const message = "半径（内）は 0 以上で指定してください。";
      issues.push({ field: "innerRadiusMm", message });
    }
    if (!Number.isFinite(rebarRadiusMm) || rebarRadiusMm < 0) {
      const message = "鉄筋の位置（有効半径）は 0 以上で指定してください。";
      issues.push({ field: "rebarRadiusMm", message });
    }
    if (!Number.isInteger(barCount) || barCount <= 0) {
      const message = "本数は 1 以上の整数で指定してください。";
      issues.push({ field: "barCount", message });
    }
    if (!Number.isFinite(youngRatio) || youngRatio <= 0) {
      const message = "ヤング係数比は正の数で指定してください。";
      issues.push({ field: "youngRatio", message });
    }
    if (!Number.isFinite(rebarYieldStrengthNPerMm2) || rebarYieldStrengthNPerMm2 <= 0) {
      const message = "鉄筋降伏強度は正の数で指定してください。";
      issues.push({ field: "rebarYieldStrengthNPerMm2", message });
    }
    if (!Number.isFinite(concreteDesignStrengthNPerMm2) || concreteDesignStrengthNPerMm2 <= 0) {
      const message = "コンクリート設計基準強度は正の数で指定してください。";
      issues.push({ field: "concreteDesignStrengthNPerMm2", message });
    }

    const validDiameters = new Set<number>(REBAR_DIAMETERS_MM);
    if (!validDiameters.has(rebarDiameterMm)) {
      const message = "鉄筋径は D6 から D51 の範囲で指定してください。";
      issues.push({ field: "rebarDiameterMm", message });
    }

    if (Number.isFinite(outerRadiusMm) && Number.isFinite(innerRadiusMm) && innerRadiusMm > outerRadiusMm) {
      const message = "半径（内）は半径（外）以下で指定してください。";
      issues.push({ field: "innerRadiusMm", message });
    }

    if (Number.isFinite(outerRadiusMm) && Number.isFinite(rebarRadiusMm) && rebarRadiusMm > outerRadiusMm) {
      const message = "鉄筋の位置（有効半径）は半径（外）以下で指定してください。";
      issues.push({ field: "rebarRadiusMm", message });
    }

    if (Number.isFinite(innerRadiusMm) && Number.isFinite(rebarRadiusMm) && rebarRadiusMm < innerRadiusMm) {
      const message = "鉄筋の位置（有効半径）は半径（内）以上で指定してください。";
      issues.push({ field: "rebarRadiusMm", message });
    }

    return issues;
  }

  // 計算処理
  calculate(): AnnularSectionResult {
    const issues = this.validate();
    if (issues.length > 0) {
      const message = issues.map((issue) => issue.message).join(" ");
      throw new Error(message);
    }

    const {
      momentKNm,
      shearKN,
      axialKN,
      outerRadiusMm,
      innerRadiusMm,
      rebarRadiusMm,
      rebarDiameterMm,
      barCount,
      youngRatio,
    } = this.input;

    // コンクリート断面積
    const fullSectionAreaMm2 = Math.PI * outerRadiusMm * outerRadiusMm;
    const innerSectionAreaMm2 = Math.PI * innerRadiusMm * innerRadiusMm;
    const sectionAreaMm2 = fullSectionAreaMm2 - innerSectionAreaMm2;

    // 鉄筋断面積および鉄筋比
    const rebarAreaPerBarMm2 = REBAR_AREAS_MM2[rebarDiameterMm];
    const totalRebarAreaMm2 = rebarAreaPerBarMm2 * barCount;
    const rebarRatioPercent = (totalRebarAreaMm2 / fullSectionAreaMm2) * 100;

    // 中立軸位置の係数および軸力係数
    const alpha = rebarRadiusMm / outerRadiusMm;
    const gamma = innerRadiusMm / outerRadiusMm;

    // 換算曲げモーメント
    const momentKNmm = momentKNm * 1000;
    const combinedMomentKNmm = momentKNmm + axialKN * outerRadiusMm;

    // 中立軸角度
    const solver = solveNeutralAxisAngleDeg({
      alpha,
      gamma,
      rebarRatioPercent,
      axialKN,
      momentKNm,
      outerRadiusMm,
      rebarRadiusMm,
      youngRatio,
    });

    // 中立軸位置
    const neutralAxisPositionMm =
      (solver.concreteCompressionCoefficient /
        (solver.concreteCompressionCoefficient + solver.steelStressCoefficient)) *
      (outerRadiusMm + rebarRadiusMm);

    // 応力度
    const combinedMomentKNm = combinedMomentKNmm / 1000;
    const combinedMomentNmm = combinedMomentKNmm * 1000;
    const concreteCompressionStressNPerMm2 =
      (combinedMomentNmm / Math.pow(outerRadiusMm, 3)) * solver.concreteCompressionCoefficient;
    const rebarStressNPerMm2 =
      (combinedMomentNmm / Math.pow(outerRadiusMm, 3)) * solver.steelStressCoefficient * youngRatio;
    const concreteShearStressNPerMm2 =
      ((shearKN * 1000) / Math.pow(outerRadiusMm, 2)) * solver.shearCoefficient;

    return {
      sectionAreaMm2,
      fullSectionAreaMm2,
      innerSectionAreaMm2,
      rebarAreaPerBarMm2,
      totalRebarAreaMm2,
      rebarRatioPercent,
      alpha,
      gamma,
      combinedMomentKNm,
      axialForceSign: classifyAxialForce(axialKN),
      youngRatio,
      neutralAxisAngleDeg: solver.neutralAxisAngleDeg,
      neutralAxisPositionMm,
      concreteCompressionCoefficient: solver.concreteCompressionCoefficient,
      steelStressCoefficient: solver.steelStressCoefficient,
      shearCoefficient: solver.shearCoefficient,
      concreteCompressionStressNPerMm2,
      rebarStressNPerMm2,
      concreteShearStressNPerMm2,
    };
  }
}

// 軸力の符号を判定する関数
function classifyAxialForce(axialKN: number): AxialForceSign {
  if (axialKN > EPSILON) {
    return "compression";
  }
  if (axialKN < -EPSILON) {
    return "tension";
  }
  return "zero";
}

interface NeutralAxisSolverInput {
  alpha: number;
  gamma: number;
  rebarRatioPercent: number;
  axialKN: number;
  momentKNm: number;
  outerRadiusMm: number;
  rebarRadiusMm: number;
  youngRatio: number;
}

interface NeutralAxisSolverResult {
  neutralAxisAngleDeg: number;
  concreteCompressionCoefficient: number;
  steelStressCoefficient: number;
  shearCoefficient: number;
}

// 中立軸角度を求めるソルバー関数
function solveNeutralAxisAngleDeg(input: NeutralAxisSolverInput): NeutralAxisSolverResult {
  const { alpha, gamma, rebarRatioPercent, axialKN, momentKNm, outerRadiusMm, youngRatio } = input;
  const radiusRatio = gamma;
  const alphaValue = alpha;
  const rebarRatio = rebarRatioPercent / 100;
  const momentKNmm = momentKNm * 1000;
  const beta = axialKN === 0 ? Number.POSITIVE_INFINITY : momentKNmm / (axialKN * outerRadiusMm);

  const xMin = Math.acos(alphaValue) * (180 / Math.PI);
  const xMax = Math.acos(-alphaValue) * (180 / Math.PI);
  let start = xMin;
  let end = xMax;
  let bestAngle = (xMin + xMax) / 2;
  let bestObjective = Number.POSITIVE_INFINITY;

  // 反復計算により中立軸角度を求める
    const step = Math.pow(10, -iteration);
    for (let angle = start; angle < end; angle += step) {
      const objective = evaluateObjective({
        angleDeg: angle,
        alpha: alphaValue,
        gamma: radiusRatio,
        rebarRatio,
        beta,
        axialKN,
        youngRatio,
      });

      // 目的関数の値が最小となる角度を更新
      if (Number.isFinite(objective) && objective < bestObjective) {
        bestObjective = objective;
        bestAngle = angle;
      }
    }

    // 最適な角度の周辺を次の探索範囲とする
    start = Math.max(xMin, bestAngle - step * 2);
    end = Math.min(xMax, bestAngle + step * 2);
  }

  // 最終的な中立軸角度が有効範囲内にあるかを確認
  if (bestAngle < xMin || bestAngle > xMax) {
    throw new Error("計算範囲外です。中立軸の位置が有効範囲にありません。");
  }

  // 中立軸角度をラジアンに変換して内部角度を求める
  const angleRad = bestAngle * (Math.PI / 180);
  const innerAngle = computeInnerAngle(angleRad, radiusRatio, alphaValue);

  // 応力度係数
  const concreteCompressionCoefficient = computeConcreteCompressionCoefficient({
    angleRad,
    innerAngleRad: innerAngle,
    gamma: radiusRatio,
    alpha: alphaValue,
    rebarRatio,
    youngRatio,
  });
  const steelStressCoefficient = computeSteelStressCoefficient({
    angleRad,
    innerAngleRad: innerAngle,
    alpha: alphaValue,
    concreteCompressionCoefficient,
  });
  const shearCoefficient = computeShearCoefficient({
    angleRad,
    innerAngleRad: innerAngle,
    gamma: radiusRatio,
    alpha: alphaValue,
    rebarRatio,
    youngRatio,
    concreteCompressionCoefficient,
  });

  return {
    neutralAxisAngleDeg: bestAngle,
    concreteCompressionCoefficient,
    steelStressCoefficient,
    shearCoefficient,
  };
}

// 中立軸角度の計算に必要な内部角度を求める関数
function computeInnerAngle(angleRad: number, gamma: number, alpha: number): number {
  if (gamma === 0) {
    return 0;
  }
  if (angleRad <= Math.acos(gamma)) {
    return 0;
  }
  if (angleRad <= Math.acos(-gamma)) {
    return Math.acos((1 / gamma) * Math.cos(angleRad));
  }
  if (angleRad <= Math.acos(-alpha)) {
    return Math.PI;
  }
  return Math.PI;
}

// 中立軸角度を求めるソルバー関数の目的関数
function evaluateObjective(input: {
  angleDeg: number;
  alpha: number;
  gamma: number;
  rebarRatio: number;
  beta: number;
  axialKN: number;
  youngRatio: number;
}): number {
  const angleRad = input.angleDeg * (Math.PI / 180);
  const innerAngleRad = computeInnerAngle(angleRad, input.gamma, input.alpha);
  const isAxialZero = Math.abs(input.axialKN) < EPSILON;

  if (isAxialZero) {
    const objective =
      (Math.sin(angleRad) / 3) * (2 + Math.pow(Math.cos(angleRad), 2)) -
      angleRad * Math.cos(angleRad) -
      Math.pow(input.gamma, 3) *
        ((Math.sin(innerAngleRad) / 3) * (2 + Math.pow(Math.cos(innerAngleRad), 2)) -
          innerAngleRad * Math.cos(innerAngleRad)) -
      Math.PI * input.youngRatio * input.rebarRatio * Math.cos(angleRad);
    return Math.abs(objective);
  }

  const numerator =
    angleRad / 4 -
    Math.sin(angleRad) * Math.cos(angleRad) * (5 / 12 - (1 / 6) * Math.pow(Math.cos(angleRad), 2)) -
    Math.pow(input.gamma, 4) *
      (innerAngleRad / 4 -
        Math.sin(innerAngleRad) *
          Math.cos(innerAngleRad) *
          (5 / 12 - (1 / 6) * Math.pow(Math.cos(innerAngleRad), 2))) +
    ((Math.PI * input.youngRatio * input.rebarRatio) / 2) * Math.pow(input.alpha, 2);

  const denominator =
    (Math.sin(angleRad) / 3) * (2 + Math.pow(Math.cos(angleRad), 2)) -
    angleRad * Math.cos(angleRad) -
    Math.pow(input.gamma, 3) *
      ((Math.sin(innerAngleRad) / 3) * (2 + Math.pow(Math.cos(innerAngleRad), 2)) -
        innerAngleRad * Math.cos(innerAngleRad)) -
    Math.PI * input.youngRatio * input.rebarRatio * Math.cos(angleRad);

  return Math.abs(input.beta - numerator / denominator);
}

// コンクリート圧縮応力度係数の計算関数
// 中立軸角度を求めるソルバー関数で使用する
function computeConcreteCompressionCoefficient(input: {
  angleRad: number;
  innerAngleRad: number;
  gamma: number;
  alpha: number;
  rebarRatio: number;
  youngRatio: number;
}): number {
  const { angleRad, innerAngleRad, gamma, alpha, rebarRatio, youngRatio } = input;
  const numerator = 1 - Math.cos(angleRad);
  const denominator =
    (2 / 3) * Math.pow(Math.sin(angleRad), 3) -
    angleRad * Math.cos(angleRad) +
    Math.sin(angleRad) * Math.pow(Math.cos(angleRad), 2) +
    angleRad / 4 -
    (1 / 4) * Math.sin(angleRad) * Math.cos(angleRad) -
    (1 / 6) * Math.pow(Math.sin(angleRad), 3) * Math.cos(angleRad) -
    Math.pow(gamma, 3) *
      ((2 / 3) * Math.pow(Math.sin(innerAngleRad), 3) -
        innerAngleRad * Math.cos(innerAngleRad) +
        Math.sin(innerAngleRad) * Math.pow(Math.cos(innerAngleRad), 2) +
        gamma *
          (innerAngleRad / 4 -
            (1 / 4) * Math.sin(innerAngleRad) * Math.cos(innerAngleRad) -
            (1 / 6) * Math.pow(Math.sin(innerAngleRad), 3) * Math.cos(innerAngleRad))) +
    Math.PI * youngRatio * rebarRatio * ((1 / 2) * Math.pow(alpha, 2) - Math.cos(angleRad));

  return numerator / denominator;
}

// 鋼材応力度係数の計算関数
// 中立軸角度を求めるソルバー関数で使用する
function computeSteelStressCoefficient(input: {
  angleRad: number;
  innerAngleRad: number;
  alpha: number;
  concreteCompressionCoefficient: number;
}): number {
  const { angleRad, alpha, concreteCompressionCoefficient } = input;
  const numerator = alpha + Math.cos(angleRad);
  const denominator = 1 - Math.cos(angleRad);
  return concreteCompressionCoefficient * (numerator / denominator);
}

// せん断係数の計算関数
// 中立軸角度を求めるソルバー関数で使用する
function computeShearCoefficient(input: {
  angleRad: number;
  innerAngleRad: number;
  gamma: number;
  alpha: number;
  rebarRatio: number;
  youngRatio: number;
  concreteCompressionCoefficient: number;
}): number {
  const { angleRad, innerAngleRad, gamma, alpha, rebarRatio, youngRatio } = input;
  const xs = Math.acos((1 / alpha) * Math.cos(angleRad));
  const z3Numerator =
    angleRad -
    Math.sin(angleRad) * Math.cos(angleRad) -
    (2 / 3) * Math.pow(Math.sin(angleRad), 3) +
    -Math.pow(gamma, 2) *
      (innerAngleRad -
        Math.sin(innerAngleRad) * Math.cos(innerAngleRad) -
        (2 / 3) * gamma * Math.pow(Math.sin(innerAngleRad), 3)) +
    Math.PI * youngRatio * rebarRatio;
  const z3Denominator =
    angleRad -
    Math.sin(angleRad) * Math.cos(angleRad) -
    Math.pow(gamma, 2) * (innerAngleRad - Math.sin(innerAngleRad) * Math.cos(innerAngleRad)) +
    Math.PI * youngRatio * rebarRatio;
  const z3 = z3Numerator / z3Denominator;

  let z2 = 0;
  z2 += Math.pow(z3, 2) * (angleRad - Math.sin(angleRad) * Math.cos(angleRad));
  z2 +=
    2 *
    z3 *
    (-angleRad + Math.sin(angleRad) * Math.cos(angleRad) + (2 / 3) * Math.pow(Math.sin(angleRad), 3));
  z2 += (5 / 4) * (angleRad - Math.sin(angleRad) * Math.cos(angleRad));
  z2 += Math.pow(Math.sin(angleRad), 3) * (Math.cos(angleRad) / 2 - 4 / 3);
  z2 +=
    -Math.pow(gamma, 2) *
    Math.pow(z3, 2) *
    (innerAngleRad - Math.sin(innerAngleRad) * Math.cos(innerAngleRad));
  z2 +=
    -Math.pow(gamma, 2) *
    2 *
    z3 *
    (-innerAngleRad +
      Math.sin(innerAngleRad) * Math.cos(innerAngleRad) +
      (2 / 3) * gamma * Math.pow(Math.sin(innerAngleRad), 3));
  z2 +=
    -Math.pow(gamma, 2) *
    (1 + Math.pow(gamma, 2) / 4) *
    (innerAngleRad - Math.sin(innerAngleRad) * Math.cos(innerAngleRad));
  z2 +=
    -Math.pow(gamma, 2) *
    gamma *
    Math.pow(Math.sin(innerAngleRad), 3) *
    ((gamma * Math.cos(innerAngleRad)) / 2 - 4 / 3);
  z2 += Math.PI * youngRatio * rebarRatio * (Math.pow(alpha, 2) / 2 + Math.pow(1 - z3, 2));

  const numerator = youngRatio * rebarRatio * (alpha * Math.sin(xs) - (Math.PI - xs) * (z3 - 1));
  const denominator = 2 * (Math.sin(angleRad) - gamma * Math.sin(innerAngleRad)) * z2;
  return numerator / denominator;
}

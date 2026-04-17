import type { AnnularSectionGeometry } from "@/model/annular-section";
import { resolveSectionForceComponents, type SectionForce } from "@/model/section-force";
import type { MaterialParams } from "@/model/section-types";

/** 中立軸ソルバーの入力 */
export interface NeutralAxisSolverInput {
  /** 円環断面形状 */
  geometry: AnnularSectionGeometry;
  /** 諸係数 */
  materialParams: MaterialParams;
  /** 軸力 [kN] */
  axial_KN: number;
  /** 曲げモーメント [kN.m] */
  moment_KNm: number;
}

/** 中立軸ソルバーの結果 */
export interface NeutralAxisSolverResult {
  /** 中立軸角度 [deg] */
  neutralAxisAngleDeg: number;
  /** コンクリート圧縮応力度係数 */
  concreteCompressionCoefficient: number;
  /** 鋼材応力度係数 */
  steelStressCoefficient: number;
  /** せん断係数 */
  shearCoefficient: number;
}

/** 強度計算に必要な入力パラメータ */
export interface StrengthMomentSolverInput {
  /** 断面力 */
  force: SectionForce;
  /** 円環断面形状 */
  geometry: AnnularSectionGeometry;
  /** 諸係数 */
  materialParams: MaterialParams;
}

/** 中立軸ソルバーや強度計算で使用する応力度評価の状態を表す型定義 */
export interface MomentStressState {
  /* コンクリート圧縮応力度 [N/mm2] */
  concreteCompressionStress_NPerMm2: number;
  /* 鉄筋応力度 [N/mm2] */
  rebarStress_NPerMm2: number;
}

/** 中立軸ソルバーや強度計算で使用する応力度評価の結果 */
export interface MomentStressEvaluation {
  /* 曲げモーメント [kN.m] */
  moment_KNm: number;
  /* コンクリート圧縮応力度 [N/mm2] */
  concreteCompressionStress_NPerMm2: number;
  /* 鉄筋応力度 [N/mm2] */
  rebarStress_NPerMm2: number;
}

/** 数値計算用の極小値（ゼロ判定用） */
const EPSILON = 1e-9;

/** 中立軸角度を求めるソルバー関数 */
export function solveNeutralAxisAngleDeg(input: NeutralAxisSolverInput): NeutralAxisSolverResult {
  const { geometry, materialParams } = input;
  const { alpha, gamma, rebarRatioPercent } = geometry;

  // 中立軸角度の候補を探索
  const bestAngleDeg = searchBestNeutralAxisAngleDeg(input);

  // 最適な中立軸角度に対応する内部角度を計算
  const angleRad = degToRad(bestAngleDeg);
  const innerAngle = computeInnerAngle(angleRad, gamma, alpha);

  // コンクリート圧縮応力度係数を算出
  const concreteCompressionCoefficient = computeConcreteCompressionCoefficient({
    angleRad,
    innerAngleRad: innerAngle,
    gamma,
    alpha,
    rebarRatio: rebarRatioPercent / 100,
    youngRatio: materialParams.youngRatio,
  });

  // 鋼材応力度係数を算出
  const steelStressCoefficient = computeSteelStressCoefficient({
    angleRad,
    innerAngleRad: innerAngle,
    alpha,
    concreteCompressionCoefficient,
  });

  // せん断係数を算出
  const shearCoefficient = computeShearCoefficient({
    angleRad,
    innerAngleRad: innerAngle,
    gamma,
    alpha,
    rebarRatio: rebarRatioPercent / 100,
    youngRatio: materialParams.youngRatio,
    concreteCompressionCoefficient,
  });

  return {
    neutralAxisAngleDeg: bestAngleDeg,
    concreteCompressionCoefficient,
    steelStressCoefficient,
    shearCoefficient,
  };
}

/** 鉄筋降伏曲げモーメントを計算する関数 */
export function calculateRebarYieldMoment_KNm(input: StrengthMomentSolverInput): number {
  // 鉄筋降伏応力度は、鉄筋の降伏強度とする
  const sigmaSy_NPerMm2 = input.materialParams.rebarYieldStrength_NPerMm2;

  // 目標応力度に到達する曲げモーメントを求める
  return solveMomentForTargetStress_KNm(
    input,
    sigmaSy_NPerMm2,
    (state) => state.rebarStress_NPerMm2,
    "鉄筋降伏曲げモーメント",
  );
}

/** コンクリート終局曲げモーメントを計算する関数 */
export function calculateConcreteUltimateMoment_KNm(input: StrengthMomentSolverInput): number {
  // コンクリート終局圧縮応力度は、コンクリート設計基準強度の 0.85 倍とする
  const sigmaC_NPerMm2 = 0.85 * input.materialParams.concreteDesignStrength_NPerMm2;

  // 目標応力度に到達する曲げモーメントを求める
  return solveMomentForTargetStress_KNm(
    input,
    sigmaC_NPerMm2,
    (state) => state.concreteCompressionStress_NPerMm2,
    "コンクリート終局曲げモーメント",
  );
}

/** 曲げモーメントに対する応力度を算出する */
function evaluateMomentStress(input: StrengthMomentSolverInput, moment_KNm: number): MomentStressEvaluation {
  const { force, geometry, materialParams } = input;
  const resolvedForce = resolveSectionForceComponents(force, geometry.rebarRadius_Mm);
  const solver = solveNeutralAxisAngleDeg({
    geometry,
    materialParams,
    axial_KN: resolvedForce.axial_KN,
    moment_KNm,
  });

  // 曲げモーメントを N.mm に変換
  const combinedMoment_KNmm = moment_KNm * 1000 + resolvedForce.axial_KN * geometry.outerRadius_Mm;
  const combinedMoment_Nmm = combinedMoment_KNmm * 1000;

  // 応力度を計算
  const scale = combinedMoment_Nmm / Math.pow(geometry.outerRadius_Mm, 3);

  return {
    moment_KNm,
    concreteCompressionStress_NPerMm2: scale * solver.concreteCompressionCoefficient,
    rebarStress_NPerMm2: scale * solver.steelStressCoefficient * materialParams.youngRatio,
  };
}

/** 目標応力度に到達する曲げモーメントを求める関数 */
function solveMomentForTargetStress_KNm(
  /** 強度計算の入力パラメータ */
  input: StrengthMomentSolverInput,
  /** 目標応力度 [N/mm2] */
  targetStress_NPerMm2: number,
  /** 応力度の選択関数（コンクリート圧縮応力度か鉄筋応力度か） */
  stressSelector: (state: MomentStressState) => number,
  /** ソルバーの名称（エラーメッセージ用） */
  solverName: string,
): number {
  /** 曲げモーメントに対する応力度を算出する関数 */
  const evaluate = (moment_KNm: number): MomentStressEvaluation => evaluateMomentStress(input, moment_KNm);

  // 初期の下限と上限を設定して、二分探索で目標応力度に到達する曲げモーメントを求める
  const lowerMoment_KNm = 0;
  const lowerEvaluation = evaluate(lowerMoment_KNm);
  const lowerStress = stressSelector({
    concreteCompressionStress_NPerMm2: lowerEvaluation.concreteCompressionStress_NPerMm2,
    rebarStress_NPerMm2: lowerEvaluation.rebarStress_NPerMm2,
  });

  // 下限の応力度が目標応力度以上の場合は、下限の曲げモーメントを返す
  if (lowerStress >= targetStress_NPerMm2) {
    return lowerMoment_KNm;
  }

  // 上限を増加しながら、目標応力度に到達する曲げモーメントを探索
  let upperMoment_KNm = Math.max(
    1,
    (targetStress_NPerMm2 * Math.pow(input.geometry.outerRadius_Mm, 3)) / 1000,
  );
  let upperEvaluation = evaluate(upperMoment_KNm);
  let upperStress = stressSelector({
    concreteCompressionStress_NPerMm2: upperEvaluation.concreteCompressionStress_NPerMm2,
    rebarStress_NPerMm2: upperEvaluation.rebarStress_NPerMm2,
  });

  // 上限の応力度が目標応力度以上になるまで、上限を増加させて探索
  let guard = 0;
  while (upperStress < targetStress_NPerMm2 && guard < 40) {
    upperMoment_KNm *= 2;
    upperEvaluation = evaluate(upperMoment_KNm);
    upperStress = stressSelector({
      concreteCompressionStress_NPerMm2: upperEvaluation.concreteCompressionStress_NPerMm2,
      rebarStress_NPerMm2: upperEvaluation.rebarStress_NPerMm2,
    });
    guard++;
  }

  // 上限の応力度が目標応力度に到達しない場合は、エラーを投げる
  if (upperStress < targetStress_NPerMm2) {
    throw new Error(
      `${solverName}を求められませんでした。目標応力度に到達する曲げモーメントが見つかりません。`,
    );
  }

  // 二分探索で目標応力度に到達する曲げモーメントを求める
  let bestMoment_KNm = upperEvaluation.moment_KNm;
  let bestError = Math.abs(upperStress - targetStress_NPerMm2);
  let low = lowerMoment_KNm;
  let high = upperMoment_KNm;

  // 反復計算の回数に制限を設ける（無限ループ防止）
  for (let iteration = 0; iteration < 60; iteration++) {
    const mid = (low + high) / 2;
    const midEvaluation = evaluate(mid);
    const midStress = stressSelector({
      concreteCompressionStress_NPerMm2: midEvaluation.concreteCompressionStress_NPerMm2,
      rebarStress_NPerMm2: midEvaluation.rebarStress_NPerMm2,
    });
    const error = midStress - targetStress_NPerMm2;

    // 現在の誤差がこれまでの最良の誤差より小さい場合は、最良の解を更新
    if (Math.abs(error) < bestError) {
      bestError = Math.abs(error);
      bestMoment_KNm = midEvaluation.moment_KNm;
    }

    // 誤差が十分小さい場合は、探索を終了
    if (Math.abs(error) <= 1e-6) {
      break;
    }

    // 誤差の符号に応じて、探索範囲を更新
    if (error < 0) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return bestMoment_KNm;
}

/** 中立軸角度の候補を探索する */
function searchBestNeutralAxisAngleDeg(input: NeutralAxisSolverInput): number {
  const { geometry, axial_KN, moment_KNm } = input;
  const { alpha, gamma, rebarRatioPercent, outerRadius_Mm } = geometry;
  const { youngRatio } = input.materialParams;

  const rebarRatio = rebarRatioPercent / 100;
  const moment_KNmm = moment_KNm * 1000;
  const beta = axial_KN === 0 ? Number.POSITIVE_INFINITY : moment_KNmm / (axial_KN * outerRadius_Mm);

  const xMinDeg = radToDeg(Math.acos(alpha));
  const xMaxDeg = radToDeg(Math.acos(-alpha));
  let start = xMinDeg;
  let end = xMaxDeg;
  let bestAngleDeg = (xMinDeg + xMaxDeg) / 2;
  let bestObjective = Number.POSITIVE_INFINITY;

  for (let iteration = 0; iteration < 14; iteration++) {
    const step = Math.pow(10, -iteration);
    for (let angle = start; angle < end; angle += step) {
      const objective = evaluateObjective({
        angleDeg: angle,
        alpha,
        gamma,
        rebarRatio,
        beta,
        axial_KN,
        youngRatio,
      });

      if (Number.isFinite(objective) && objective < bestObjective) {
        bestObjective = objective;
        bestAngleDeg = angle;
      }
    }

    start = Math.max(xMinDeg, bestAngleDeg - step * 2);
    end = Math.min(xMaxDeg, bestAngleDeg + step * 2);
  }

  if (bestAngleDeg < xMinDeg || bestAngleDeg > xMaxDeg) {
    throw new Error("計算範囲外です。中立軸の位置が有効範囲にありません。");
  }

  return bestAngleDeg;
}

/** 中立軸角度の計算に必要な内部角度を求める関数 */
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

/** 軸力が 0 のときの目的関数を評価する */
function evaluateZeroAxialObjective(input: {
  angleRad: number;
  innerAngleRad: number;
  gamma: number;
  rebarRatio: number;
  youngRatio: number;
}): number {
  const { angleRad, innerAngleRad, gamma, rebarRatio, youngRatio } = input;
  const objective =
    (Math.sin(angleRad) / 3) * (2 + Math.pow(Math.cos(angleRad), 2)) -
    angleRad * Math.cos(angleRad) -
    Math.pow(gamma, 3) *
      ((Math.sin(innerAngleRad) / 3) * (2 + Math.pow(Math.cos(innerAngleRad), 2)) -
        innerAngleRad * Math.cos(innerAngleRad)) -
    Math.PI * youngRatio * rebarRatio * Math.cos(angleRad);
  return Math.abs(objective);
}

/** 軸力が 0 でないときの目的関数を評価する */
function evaluateNonZeroAxialObjective(input: {
  angleRad: number;
  innerAngleRad: number;
  alpha: number;
  gamma: number;
  rebarRatio: number;
  beta: number;
  youngRatio: number;
}): number {
  const { angleRad, innerAngleRad, alpha, gamma, rebarRatio, beta, youngRatio } = input;
  const numerator =
    angleRad / 4 -
    Math.sin(angleRad) * Math.cos(angleRad) * (5 / 12 - (1 / 6) * Math.pow(Math.cos(angleRad), 2)) -
    Math.pow(gamma, 4) *
      (innerAngleRad / 4 -
        Math.sin(innerAngleRad) *
          Math.cos(innerAngleRad) *
          (5 / 12 - (1 / 6) * Math.pow(Math.cos(innerAngleRad), 2))) +
    ((Math.PI * youngRatio * rebarRatio) / 2) * Math.pow(alpha, 2);

  const denominator =
    (Math.sin(angleRad) / 3) * (2 + Math.pow(Math.cos(angleRad), 2)) -
    angleRad * Math.cos(angleRad) -
    Math.pow(gamma, 3) *
      ((Math.sin(innerAngleRad) / 3) * (2 + Math.pow(Math.cos(innerAngleRad), 2)) -
        innerAngleRad * Math.cos(innerAngleRad)) -
    Math.PI * youngRatio * rebarRatio * Math.cos(angleRad);

  return Math.abs(beta - numerator / denominator);
}

/** 中立軸角度を求めるソルバー関数の目的関数 */
function evaluateObjective(input: {
  angleDeg: number;
  alpha: number;
  gamma: number;
  rebarRatio: number;
  beta: number;
  axial_KN: number;
  youngRatio: number;
}): number {
  const angleRad = degToRad(input.angleDeg);
  const innerAngleRad = computeInnerAngle(angleRad, input.gamma, input.alpha);
  const isAxialZero = Math.abs(input.axial_KN) < EPSILON;

  // 軸力が 0 の場合
  if (isAxialZero) {
    return evaluateZeroAxialObjective({
      angleRad,
      innerAngleRad,
      gamma: input.gamma,
      rebarRatio: input.rebarRatio,
      youngRatio: input.youngRatio,
    });
  }

  // 軸力が 0 でない場合
  return evaluateNonZeroAxialObjective({
    angleRad,
    innerAngleRad,
    alpha: input.alpha,
    gamma: input.gamma,
    rebarRatio: input.rebarRatio,
    beta: input.beta,
    youngRatio: input.youngRatio,
  });
}

/** コンクリート圧縮応力度係数の計算関数 */
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

/** 鋼材応力度係数の計算関数 */
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

/** せん断係数の計算関数 */
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

  // xs は中立軸角度に対応する内部角度を表す無次元量
  const xs = Math.acos((1 / alpha) * Math.cos(angleRad));

  // z3 は中立軸位置を表す無次元量
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

  // z2 はせん断剛性に関連する無次元量
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

/** 度をラジアンに変換する関数 */
function degToRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/** ラジアンを度に変換する関数 */
function radToDeg(rad: number): number {
  return rad * (180 / Math.PI);
}

import { REBAR_DIAMETERS_MM, getRebarAreaMm2 } from "@/model/rebar";
import type { RebarDiameterMm } from "@/model/rebar";
import type { AxialForceSign, SectionForce3, SectionForce6 } from "@/model/section-force";

/** 円環断面の形状を表す型定義 */
export interface AnnularSectionGeometry {
  /** 外径 [mm] */
  outerRadiusMm: number;
  /** 内径 [mm] */
  innerRadiusMm: number;
  /** 鉄筋位置 [mm] */
  rebarRadiusMm: number;
  /** 鉄筋径 [mm] */
  rebarDiameterMm: RebarDiameterMm;
  /** 鉄筋本数 [本] */
  barCount: number;
}

/** 諸係数の型定義 */
export interface MaterialParams {
  /** ヤング係数比（鋼材のヤング係数 / コンクリートのヤング係数） */
  youngRatio: number;
  /** 鉄筋降伏強度 [N/mm2] */
  rebarYieldStrengthNPerMm2: number;
  /** コンクリート設計基準強度 [N/mm2] */
  concreteDesignStrengthNPerMm2: number;
}

/** 円環断面の入力全体を表す型定義 */
export interface AnnularSectionInput {
  /** 3断面力 */
  force3?: SectionForce3;
  /** 6断面力 */
  force6?: SectionForce6;
  /** 断面形状 */
  geometry: AnnularSectionGeometry;
  /** 諸係数 */
  materialParams: MaterialParams;
}

/** 検算結果の型定義 */
export interface AnnularSectionValidationIssue {
  field: keyof AnnularSectionInput;
  message: string;
}

/** 計算結果の型定義 */
export interface AnnularSectionResult {
  /** 断面積 [mm2] */
  sectionAreaMm2: number;
  /** 全断面積 [mm2] */
  fullSectionAreaMm2: number;
  /** 内部断面積 [mm2] */
  innerSectionAreaMm2: number;
  /** 1本あたりの鉄筋断面積 [mm2] */
  rebarAreaPerBarMm2: number;
  /** 鉄筋総断面積 [mm2] */
  totalRebarAreaMm2: number;
  /** 鉄筋比 [%] */
  rebarRatioPercent: number;
  /** 中立軸位置の係数 */
  alpha: number;
  /** 軸力係数 */
  gamma: number;
  /** 換算曲げモーメント [kN.m] */
  combinedMomentKNm: number;
  /** 軸力の符号 */
  axialForceSign: AxialForceSign;
  /** ヤング係数比 */
  youngRatio: number;
  /** 中立軸角度 [deg] */
  neutralAxisAngleDeg: number;
  /** 中立軸位置 [mm] */
  neutralAxisPositionMm: number;
  /** コンクリート圧縮応力度係数 */
  concreteCompressionCoefficient: number;
  /** 鋼材応力度係数 */
  steelStressCoefficient: number;
  /** せん断応力度係数 */
  shearCoefficient: number;
  /** コンクリート圧縮応力度 [N/mm2] */
  concreteCompressionStressNPerMm2: number;
  /** 鉄筋応力度 [N/mm2] */
  rebarStressNPerMm2: number;
  /** コンクリートせん断応力度 [N/mm2] */
  concreteShearStressNPerMm2: number;
  /** コンクリート終局曲げモーメント [kN.m] */
  concreteUltimateMomentKNm: number;
  /** 鉄筋降伏曲げモーメント [kN.m] */
  rebarYieldMomentKNm: number;
}

/** 3断面力の入力値を検査する */
function validateSectionForce3(
  force3: AnnularSectionInput["force3"],
  issues: AnnularSectionValidationIssue[],
): void {
  if (!Number.isFinite(force3?.momentKNm)) {
    issues.push({ field: "force3", message: "モーメントは数値で指定してください。" });
  }
  if (!Number.isFinite(force3?.shearKN)) {
    issues.push({ field: "force3", message: "せん断力は数値で指定してください。" });
  }
  if (!Number.isFinite(force3?.axialKN)) {
    issues.push({ field: "force3", message: "軸力は数値で指定してください。" });
  }
}

/** 入力から計算用の3断面力を返す */
function resolveSectionForce3(input: AnnularSectionInput): SectionForce3 {
  // 3断面力が入力されている場合はそのまま返す
  if (input.force3) {
    return input.force3;
  }

  // 6断面力が入力されている場合
  const { force6 } = input;

  if (!force6) {
    throw new Error("断面力が指定されていません。");
  }

  // ねじりモーメントにアーム長（鉄筋半径）を乗じて換算せん断力を算出
  const { rebarRadiusMm } = input.geometry;
  const mxShearKN = (force6.mxKNm * 1000) / rebarRadiusMm;

  return {
    momentKNm: Math.sqrt(force6.myKNm ** 2 + force6.mzKNm ** 2),
    shearKN: Math.sqrt(force6.fyKN ** 2 + force6.fzKN ** 2) + mxShearKN,
    axialKN: force6.fxKN,
  };
}

/** 数値計算用の極小値（ゼロ判定用） */
const EPSILON = 1e-9;

/** ラジアン変換のヘルパー */
function degToRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/** 角度変換のヘルパー */
function radToDeg(rad: number): number {
  return rad * (180 / Math.PI);
}

/**
 * 円環断面の計算クラス
 */
export class AnnularSectionCalculator {
  private readonly input: AnnularSectionInput;

  constructor(input: AnnularSectionInput) {
    this.input = input;
  }

  /** 入力値の検査 */
  validate(): AnnularSectionValidationIssue[] {
    const issues: AnnularSectionValidationIssue[] = [];
    const {
      force3,
      geometry: { outerRadiusMm, innerRadiusMm, rebarRadiusMm, rebarDiameterMm, barCount },
      materialParams: { youngRatio, rebarYieldStrengthNPerMm2, concreteDesignStrengthNPerMm2 },
    } = this.input;

    // 断面力のバリデーション
    validateSectionForce3(force3, issues);

    // 断面形状のバリデーション
    if (!Number.isFinite(outerRadiusMm) || outerRadiusMm <= 0) {
      const message = "半径（外）は正の数で指定してください。";
      issues.push({ field: "geometry", message });
    }
    if (!Number.isFinite(innerRadiusMm) || innerRadiusMm < 0) {
      const message = "半径（内）は 0 以上で指定してください。";
      issues.push({ field: "geometry", message });
    }
    if (!Number.isFinite(rebarRadiusMm) || rebarRadiusMm < 0) {
      const message = "鉄筋の位置（有効半径）は 0 以上で指定してください。";
      issues.push({ field: "geometry", message });
    }
    if (!Number.isFinite(barCount) || barCount <= 0) {
      const message = "本数は正の数で指定してください。";
      issues.push({ field: "geometry", message });
    }

    // 諸係数のバリデーション
    if (!Number.isFinite(youngRatio) || youngRatio <= 0) {
      const message = "ヤング係数比は正の数で指定してください。";
      issues.push({ field: "materialParams", message });
    }
    if (!Number.isFinite(rebarYieldStrengthNPerMm2) || rebarYieldStrengthNPerMm2 <= 0) {
      const message = "鉄筋降伏強度は正の数で指定してください。";
      issues.push({ field: "materialParams", message });
    }
    if (!Number.isFinite(concreteDesignStrengthNPerMm2) || concreteDesignStrengthNPerMm2 <= 0) {
      const message = "コンクリート設計基準強度は正の数で指定してください。";
      issues.push({ field: "materialParams", message });
    }

    // 鉄筋径のバリデーション
    const validDiameters = new Set<number>(REBAR_DIAMETERS_MM);
    if (!validDiameters.has(rebarDiameterMm)) {
      const message = "鉄筋径は D6 から D51 の範囲で指定してください。";
      issues.push({ field: "materialParams", message });
    }

    // 半径のバリデーション
    if (Number.isFinite(outerRadiusMm) && Number.isFinite(innerRadiusMm) && innerRadiusMm > outerRadiusMm) {
      const message = "半径（内）は半径（外）以下で指定してください。";
      issues.push({ field: "geometry", message });
    }
    if (Number.isFinite(outerRadiusMm) && Number.isFinite(rebarRadiusMm) && rebarRadiusMm > outerRadiusMm) {
      const message = "鉄筋の位置（有効半径）は半径（外）以下で指定してください。";
      issues.push({ field: "geometry", message });
    }
    if (Number.isFinite(innerRadiusMm) && Number.isFinite(rebarRadiusMm) && rebarRadiusMm < innerRadiusMm) {
      const message = "鉄筋の位置（有効半径）は半径（内）以上で指定してください。";
      issues.push({ field: "geometry", message });
    }

    return issues;
  }

  /** 計算処理 */
  calculate(): AnnularSectionResult {
    const issues = this.validate();
    if (issues.length > 0) {
      const message = issues.map((issue) => issue.message).join(" ");
      throw new Error(message);
    }

    const { geometry, materialParams } = this.input;
    const force3 = resolveSectionForce3(this.input);

    // コンクリート断面積
    const fullSectionAreaMm2 = Math.PI * geometry.outerRadiusMm * geometry.outerRadiusMm;
    const innerSectionAreaMm2 = Math.PI * geometry.innerRadiusMm * geometry.innerRadiusMm;
    const sectionAreaMm2 = fullSectionAreaMm2 - innerSectionAreaMm2;

    // 鉄筋断面積および鉄筋比
    const rebarAreaPerBarMm2 = getRebarAreaMm2(geometry.rebarDiameterMm);
    const totalRebarAreaMm2 = rebarAreaPerBarMm2 * geometry.barCount;
    const rebarRatioPercent = (totalRebarAreaMm2 / fullSectionAreaMm2) * 100;

    // 中立軸位置の係数および軸力係数
    const alpha = geometry.rebarRadiusMm / geometry.outerRadiusMm;
    const gamma = geometry.innerRadiusMm / geometry.outerRadiusMm;

    /** 曲げモーメント [kN.m] */
    const momentKNm = force3.momentKNm;
    /** 曲げモーメント [N.mm] */
    const momentKNmm = momentKNm * 1000;
    /** せん断力 [kN] */
    const shearKN = force3.shearKN;
    /** 軸力 [kN] */
    const axialKN = force3.axialKN;

    /** 換算曲げモーメント [N.mm] （軸力の影響を考慮） */
    const combinedMomentKNmm = momentKNmm + axialKN * geometry.outerRadiusMm;

    // 中立軸角度
    const solver = solveNeutralAxisAngleDeg({
      alpha,
      gamma,
      rebarRatioPercent,
      axialKN,
      momentKNm,
      outerRadiusMm: geometry.outerRadiusMm,
      rebarRadiusMm: geometry.rebarRadiusMm,
      youngRatio: materialParams.youngRatio,
    });

    // 中立軸位置
    const neutralAxisPositionMm =
      (solver.concreteCompressionCoefficient /
        (solver.concreteCompressionCoefficient + solver.steelStressCoefficient)) *
      (geometry.outerRadiusMm + geometry.rebarRadiusMm);

    // 応力度
    const combinedMomentKNm = combinedMomentKNmm / 1000;
    const combinedMomentNmm = combinedMomentKNmm * 1000;
    const concreteCompressionStressNPerMm2 =
      (combinedMomentNmm / Math.pow(geometry.outerRadiusMm, 3)) * solver.concreteCompressionCoefficient;
    const rebarStressNPerMm2 =
      (combinedMomentNmm / Math.pow(geometry.outerRadiusMm, 3)) *
      solver.steelStressCoefficient *
      materialParams.youngRatio;
    const concreteShearStressNPerMm2 =
      ((shearKN * 1000) / Math.pow(geometry.outerRadiusMm, 2)) * solver.shearCoefficient;

    // 終局耐力
    const solverInput: StrengthMomentSolverInput = {
      force3: {
        momentKNm,
        shearKN,
        axialKN,
      },
      geometry,
      materialParams,
    };
    const concreteUltimateMomentKNm = calculateConcreteUltimateMomentKNm(solverInput);
    const rebarYieldMomentKNm = calculateRebarYieldMomentKNm(solverInput);

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
      youngRatio: materialParams.youngRatio,
      neutralAxisAngleDeg: solver.neutralAxisAngleDeg,
      neutralAxisPositionMm,
      concreteCompressionCoefficient: solver.concreteCompressionCoefficient,
      steelStressCoefficient: solver.steelStressCoefficient,
      shearCoefficient: solver.shearCoefficient,
      concreteCompressionStressNPerMm2,
      rebarStressNPerMm2,
      concreteShearStressNPerMm2,
      concreteUltimateMomentKNm,
      rebarYieldMomentKNm,
    };
  }
}

/**
 * 軸力の符号を判定する関数
 */
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

/** 強度計算に必要な入力パラメータ */
interface StrengthMomentSolverInput {
  force3: SectionForce3;
  geometry: AnnularSectionGeometry;
  materialParams: MaterialParams;
}

interface MomentStressState {
  concreteCompressionStressNPerMm2: number;
  rebarStressNPerMm2: number;
}

interface MomentStressEvaluation {
  momentKNm: number;
  concreteCompressionStressNPerMm2: number;
  rebarStressNPerMm2: number;
}

/**
 * 中立軸角度を求めるソルバー関数
 */
function solveNeutralAxisAngleDeg(input: NeutralAxisSolverInput): NeutralAxisSolverResult {
  const { alpha, gamma, rebarRatioPercent, axialKN, momentKNm, outerRadiusMm, youngRatio } = input;
  const radiusRatio = gamma;
  const alphaValue = alpha;
  const rebarRatio = rebarRatioPercent / 100;
  const momentKNmm = momentKNm * 1000;
  const beta = axialKN === 0 ? Number.POSITIVE_INFINITY : momentKNmm / (axialKN * outerRadiusMm);

  const xMinDeg = radToDeg(Math.acos(alphaValue));
  const xMaxDeg = radToDeg(Math.acos(-alphaValue));
  let start = xMinDeg;
  let end = xMaxDeg;
  let bestAngleDeg = (xMinDeg + xMaxDeg) / 2;
  let bestObjective = Number.POSITIVE_INFINITY;

  // 反復計算により中立軸角度を求める
  for (let iteration = 0; iteration < 14; iteration++) {
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
        bestAngleDeg = angle;
      }
    }

    // 最適な角度の周辺を次の探索範囲とする
    start = Math.max(xMinDeg, bestAngleDeg - step * 2);
    end = Math.min(xMaxDeg, bestAngleDeg + step * 2);
  }

  // 最終的な中立軸角度が有効範囲内にあるかを確認
  if (bestAngleDeg < xMinDeg || bestAngleDeg > xMaxDeg) {
    throw new Error("計算範囲外です。中立軸の位置が有効範囲にありません。");
  }

  // 中立軸角度をラジアンに変換して内部角度を求める
  const angleRad = degToRad(bestAngleDeg);
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
    neutralAxisAngleDeg: bestAngleDeg,
    concreteCompressionCoefficient,
    steelStressCoefficient,
    shearCoefficient,
  };
}

/**
 * 中立軸角度の計算に必要な内部角度を求める関数
 */
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

/**
 * 中立軸角度を求めるソルバー関数の目的関数
 */
function evaluateObjective(input: {
  angleDeg: number;
  alpha: number;
  gamma: number;
  rebarRatio: number;
  beta: number;
  axialKN: number;
  youngRatio: number;
}): number {
  const angleRad = degToRad(input.angleDeg);
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

/**
 * コンクリート圧縮応力度係数の計算関数
 *
 * 中立軸角度を求めるソルバー関数で使用する
 */
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

/**
 * 鋼材応力度係数の計算関数
 *
 * 中立軸角度を求めるソルバー関数で使用する
 */
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

/**
 * せん断係数の計算関数
 *
 * 中立軸角度を求めるソルバー関数で使用する
 */
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

/**
 * 鉄筋降伏曲げモーメントを計算する関数
 *
 * 反復計算により、鉄筋降伏強度 == 鉄筋応力度となる曲げモーメントを求める
 */
function calculateRebarYieldMomentKNm(input: StrengthMomentSolverInput): number {
  const { materialParams } = input;

  // 降伏強度 [N/mm2]
  const sigmaSyNPerMm2 = materialParams.rebarYieldStrengthNPerMm2;

  return solveMomentForTargetStressKNm(
    input,
    sigmaSyNPerMm2,
    (state) => state.rebarStressNPerMm2,
    "鉄筋降伏曲げモーメント",
  );
}

/**
 * コンクリート終局曲げモーメントを計算する関数
 *
 * 反復計算により、コンクリート設計基準強度 == コンクリート圧縮応力度となる曲げモーメントを求める
 */
function calculateConcreteUltimateMomentKNm(input: StrengthMomentSolverInput): number {
  const { materialParams } = input;

  /** 終局応力度 [N/mm2] 【道示Ⅲ 図-5.5.1】より */
  const sigmaCNPerMm2 = 0.85 * materialParams.concreteDesignStrengthNPerMm2;

  return solveMomentForTargetStressKNm(
    input,
    sigmaCNPerMm2,
    (state) => state.concreteCompressionStressNPerMm2,
    "コンクリート終局曲げモーメント",
  );
}

/**
 * 目標応力度に到達する曲げモーメントを求める関数
 */
function solveMomentForTargetStressKNm(
  input: StrengthMomentSolverInput,
  targetStressNPerMm2: number,
  stressSelector: (state: MomentStressState) => number,
  solverName: string,
): number {
  const { force3, geometry, materialParams } = input;

  // 曲げモーメントに対して、コンクリート圧縮応力度と鉄筋応力度を計算
  const evaluate = (momentKNm: number): MomentStressEvaluation => {
    const singleRebarAreaMm2 = getRebarAreaMm2(geometry.rebarDiameterMm);
    const solver = solveNeutralAxisAngleDeg({
      alpha: geometry.rebarRadiusMm / geometry.outerRadiusMm,
      gamma: geometry.innerRadiusMm / geometry.outerRadiusMm,
      rebarRatioPercent:
        ((singleRebarAreaMm2 * geometry.barCount) / (Math.PI * Math.pow(geometry.outerRadiusMm, 2))) * 100,
      axialKN: force3.axialKN,
      momentKNm,
      outerRadiusMm: geometry.outerRadiusMm,
      rebarRadiusMm: geometry.rebarRadiusMm,
      youngRatio: materialParams.youngRatio,
    });

    // 換算曲げモーメントを計算
    const combinedMomentKNmm = momentKNm * 1000 + force3.axialKN * geometry.outerRadiusMm;
    const combinedMomentNmm = combinedMomentKNmm * 1000;
    const state: MomentStressState = {
      concreteCompressionStressNPerMm2:
        (combinedMomentNmm / Math.pow(geometry.outerRadiusMm, 3)) * solver.concreteCompressionCoefficient,
      rebarStressNPerMm2:
        (combinedMomentNmm / Math.pow(geometry.outerRadiusMm, 3)) *
        solver.steelStressCoefficient *
        materialParams.youngRatio,
    };

    return {
      momentKNm,
      concreteCompressionStressNPerMm2: state.concreteCompressionStressNPerMm2,
      rebarStressNPerMm2: state.rebarStressNPerMm2,
    };
  };

  // 初期の下限と上限を設定して、二分探索で目標応力度に到達する曲げモーメントを求める
  const lowerMomentKNm = 0;
  const lowerEvaluation = evaluate(lowerMomentKNm);
  const lowerStress = stressSelector({
    concreteCompressionStressNPerMm2: lowerEvaluation.concreteCompressionStressNPerMm2,
    rebarStressNPerMm2: lowerEvaluation.rebarStressNPerMm2,
  });

  // 下限の曲げモーメントで既に目標応力度を超えている場合は、その値を返す
  if (lowerStress >= targetStressNPerMm2) {
    return lowerMomentKNm;
  }

  // 上限の曲げモーメントを設定して評価する
  // 目標応力度に到達するまで、上限を倍増させて探索する
  let upperMomentKNm = Math.max(1, (targetStressNPerMm2 * Math.pow(geometry.outerRadiusMm, 3)) / 1000);
  let upperEvaluation = evaluate(upperMomentKNm);
  let upperStress = stressSelector({
    concreteCompressionStressNPerMm2: upperEvaluation.concreteCompressionStressNPerMm2,
    rebarStressNPerMm2: upperEvaluation.rebarStressNPerMm2,
  });

  // 安全策として、上限を倍増させる回数に制限を設ける（無限ループ防止）
  let guard = 0;
  while (upperStress < targetStressNPerMm2 && guard < 40) {
    upperMomentKNm *= 2;
    upperEvaluation = evaluate(upperMomentKNm);
    upperStress = stressSelector({
      concreteCompressionStressNPerMm2: upperEvaluation.concreteCompressionStressNPerMm2,
      rebarStressNPerMm2: upperEvaluation.rebarStressNPerMm2,
    });
    guard++;
  }

  // 上限を十分に大きくしても目標応力度に到達しない場合は、エラーを投げる
  if (upperStress < targetStressNPerMm2) {
    throw new Error(
      `${solverName}を求められませんでした。目標応力度に到達する曲げモーメントが見つかりません。`,
    );
  }

  // 二分探索で目標応力度に到達する曲げモーメントを求める
  let bestMomentKNm = upperEvaluation.momentKNm;
  let bestError = Math.abs(upperStress - targetStressNPerMm2);
  let low = lowerMomentKNm;
  let high = upperMomentKNm;

  // 反復計算の回数に制限を設ける（無限ループ防止）
  for (let iteration = 0; iteration < 60; iteration++) {
    const mid = (low + high) / 2;
    const midEvaluation = evaluate(mid);
    const midStress = stressSelector({
      concreteCompressionStressNPerMm2: midEvaluation.concreteCompressionStressNPerMm2,
      rebarStressNPerMm2: midEvaluation.rebarStressNPerMm2,
    });
    const error = midStress - targetStressNPerMm2;

    if (Math.abs(error) < bestError) {
      bestError = Math.abs(error);
      bestMomentKNm = midEvaluation.momentKNm;
    }

    if (Math.abs(error) <= 1e-6) {
      break;
    }

    if (error < 0) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return bestMomentKNm;
}

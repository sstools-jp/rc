import { REBAR_DIAMETERS_MM, isRebarKind } from "@/model/rebar";
import { getTauC_NPerMm2 } from "@/model/concrete";
import { AnnularSectionGeometry } from "@/model/annular-section-geometry";
import {
  resolveSectionForceComponents,
  type AxialForceSign,
  type SectionForce,
  type SectionForceComponents,
} from "@/model/section-force";
import type { AnnularSectionGeometryInput, AnnularSectionInput, MaterialParams } from "@/model/section-types";
import {
  calculateConcreteUltimateMoment_KNm,
  calculateRebarYieldMoment_KNm,
  solveNeutralAxisAngleDeg,
} from "@/model/section-solver";
import type { NeutralAxisSolverResult, StrengthMomentSolverInput } from "@/model/section-solver";

export { AnnularSectionGeometry } from "@/model/annular-section-geometry";

/** 検算結果の型定義 */
export interface AnnularSectionValidationIssue {
  field: keyof AnnularSectionInput;
  message: string;
}

/** 計算結果の型定義 */
export interface AnnularSectionSectionResult {
  /** 断面積 [mm2] */
  sectionArea_Mm2: number;
  /** 全断面積 [mm2] */
  fullSectionArea_Mm2: number;
  /** 内部断面積 [mm2] */
  innerSectionArea_Mm2: number;
  /** 1本あたりの鉄筋断面積 [mm2] */
  rebarAreaPerBar_Mm2: number;
  /** 鉄筋総断面積 [mm2] */
  totalRebarArea_Mm2: number;
  /** 鉄筋比 [%] */
  rebarRatioPercent: number;
  /** 中立軸位置の係数 */
  alpha: number;
  /** 軸力係数 */
  gamma: number;
}

/** 荷重状態の結果定義 */
export interface AnnularSectionLoadingResult {
  /** 換算曲げモーメント [kN.m] */
  combinedMoment_KNm: number;
  /** 軸力の符号 */
  axialForceSign: AxialForceSign;
}

/** 中立軸の結果定義 */
export interface AnnularSectionNeutralAxisResult {
  /** 中立軸角度 [deg] */
  neutralAxisAngleDeg: number;
  /** 中立軸位置 [mm] */
  neutralAxisPosition_Mm: number;
  /** コンクリート圧縮応力度係数 */
  concreteCompressionCoefficient: number;
  /** 鋼材応力度係数 */
  steelStressCoefficient: number;
  /** せん断応力度係数 */
  shearCoefficient: number;
}

export interface AnnularSectionResult {
  /** 断面形状の結果 */
  section: AnnularSectionSectionResult;
  /** 荷重状態の結果 */
  loading: AnnularSectionLoadingResult;
  /** 中立軸の結果 */
  neutralAxis: AnnularSectionNeutralAxisResult;
  /** 応力度の結果 */
  stress: SectionStressState;
  /** 耐力の結果 */
  strength: SectionStrengthState;
}

/** 断面力の入力値を検査する */
function validateSectionForce(
  force: SectionForce | undefined,
  issues: AnnularSectionValidationIssue[],
): void {
  if (!Number.isFinite(force?.fx_KN)) {
    issues.push({ field: "force", message: "軸力は数値で指定してください。" });
  }
  if (!Number.isFinite(force?.fy_KN)) {
    issues.push({ field: "force", message: "せん断力（面外）は数値で指定してください。" });
  }
  if (!Number.isFinite(force?.fz_KN)) {
    issues.push({ field: "force", message: "せん断力（面内）は数値で指定してください。" });
  }
  if (!Number.isFinite(force?.mx_KNm)) {
    issues.push({ field: "force", message: "ねじりモーメントは数値で指定してください。" });
  }
  if (!Number.isFinite(force?.my_KNm)) {
    issues.push({ field: "force", message: "曲げモーメント（面内）は数値で指定してください。" });
  }
  if (!Number.isFinite(force?.mz_KNm)) {
    issues.push({ field: "force", message: "曲げモーメント（面外）は数値で指定してください。" });
  }
}

/** 断面形状の入力値を検査する */
function validateGeometry(
  geometry: AnnularSectionGeometryInput,
  issues: AnnularSectionValidationIssue[],
): void {
  const { outerRadius_Mm, innerRadius_Mm, rebarRadius_Mm, rebarKind, rebarDiameter_Mm, barCount } = geometry;

  if (!Number.isFinite(outerRadius_Mm) || outerRadius_Mm <= 0) {
    issues.push({ field: "geometry", message: "半径（外）は正の数で指定してください。" });
  }
  if (!Number.isFinite(innerRadius_Mm) || innerRadius_Mm < 0) {
    issues.push({ field: "geometry", message: "半径（内）は 0 以上で指定してください。" });
  }
  if (!Number.isFinite(rebarRadius_Mm) || rebarRadius_Mm < 0) {
    issues.push({ field: "geometry", message: "鉄筋の位置（有効半径）は 0 以上で指定してください。" });
  }
  if (!Number.isFinite(barCount) || barCount <= 0) {
    issues.push({ field: "geometry", message: "本数は正の数で指定してください。" });
  }

  if (!isRebarKind(rebarKind)) {
    issues.push({ field: "geometry", message: "鉄筋種別は異形棒鋼または丸鋼で指定してください。" });
  } else if (rebarKind === "deformed") {
    const validDiameters = new Set<number>(REBAR_DIAMETERS_MM);
    if (!validDiameters.has(rebarDiameter_Mm)) {
      issues.push({
        field: "materialParams",
        message: "異形棒鋼の径は D6 から D51 の範囲で指定してください。",
      });
    }
  } else if (!Number.isFinite(rebarDiameter_Mm) || rebarDiameter_Mm <= 0) {
    issues.push({ field: "materialParams", message: "丸鋼の直径は正の数で指定してください。" });
  }

  if (Number.isFinite(outerRadius_Mm) && Number.isFinite(innerRadius_Mm) && innerRadius_Mm > outerRadius_Mm) {
    issues.push({ field: "geometry", message: "半径（内）は半径（外）以下で指定してください。" });
  }
  if (Number.isFinite(outerRadius_Mm) && Number.isFinite(rebarRadius_Mm) && rebarRadius_Mm > outerRadius_Mm) {
    issues.push({ field: "geometry", message: "鉄筋の位置（有効半径）は半径（外）以下で指定してください。" });
  }
  if (Number.isFinite(innerRadius_Mm) && Number.isFinite(rebarRadius_Mm) && rebarRadius_Mm < innerRadius_Mm) {
    issues.push({ field: "geometry", message: "鉄筋の位置（有効半径）は半径（内）以上で指定してください。" });
  }
}

/** 諸係数の入力値を検査する */
function validateMaterialParams(
  materialParams: MaterialParams,
  issues: AnnularSectionValidationIssue[],
): void {
  const { youngRatio, rebarYieldStrength_NPerMm2, concreteDesignStrength_NPerMm2 } = materialParams;

  if (!Number.isFinite(youngRatio) || youngRatio <= 0) {
    issues.push({ field: "materialParams", message: "ヤング係数比は正の数で指定してください。" });
  }
  if (!Number.isFinite(rebarYieldStrength_NPerMm2) || rebarYieldStrength_NPerMm2 <= 0) {
    issues.push({ field: "materialParams", message: "鉄筋降伏強度は正の数で指定してください。" });
  }
  if (!Number.isFinite(concreteDesignStrength_NPerMm2) || concreteDesignStrength_NPerMm2 <= 0) {
    issues.push({ field: "materialParams", message: "コンクリート設計基準強度は正の数で指定してください。" });
  }
}

/** 数値計算用の極小値（ゼロ判定用） */
const EPSILON = 1e-9;

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
    const { force, geometry, materialParams } = this.input;

    validateSectionForce(force, issues);

    validateGeometry(geometry, issues);
    validateMaterialParams(materialParams, issues);

    return issues;
  }

  /** 計算処理 */
  calculate(): AnnularSectionResult {
    const issues = this.validate();
    if (issues.length > 0) {
      const message = issues.map((issue) => issue.message).join(" ");
      throw new Error(message);
    }

    // 入力と荷重状態をまとめる
    const context = createCalculationContext(this.input);

    // 中立軸角度を求めるソルバーを実行
    const solver = solveNeutralAxisAngleDeg(context);

    /** 中立軸位置 [mm] */
    const neutralAxisPosition_Mm = calculateNeutralAxisPosition_Mm(context.geometry, solver);

    // 応力度を算出
    const stress = calculateStressState(context, solver);

    // 耐力を算出
    const strength = calculateStrengthState(context);

    return {
      section: {
        sectionArea_Mm2: context.geometry.sectionArea_Mm2,
        fullSectionArea_Mm2: context.geometry.fullSectionArea_Mm2,
        innerSectionArea_Mm2: context.geometry.innerSectionArea_Mm2,
        rebarAreaPerBar_Mm2: context.geometry.rebarAreaPerBar_Mm2,
        totalRebarArea_Mm2: context.geometry.totalRebarArea_Mm2,
        rebarRatioPercent: context.geometry.rebarRatioPercent,
        alpha: context.geometry.alpha,
        gamma: context.geometry.gamma,
      },
      loading: {
        combinedMoment_KNm: context.combinedMoment_KNm,
        axialForceSign: classifyAxialForce(context.force.fx_KN),
      },
      neutralAxis: {
        neutralAxisAngleDeg: solver.neutralAxisAngleDeg,
        neutralAxisPosition_Mm,
        concreteCompressionCoefficient: solver.concreteCompressionCoefficient,
        steelStressCoefficient: solver.steelStressCoefficient,
        shearCoefficient: solver.shearCoefficient,
      },
      stress,
      strength,
    };
  }
}

/** フォームの状態を表す型定義 */
interface SectionCalculationContext {
  /** 断面形状 */
  geometry: AnnularSectionGeometry;
  /** 諸係数 */
  materialParams: MaterialParams;
  /** 断面力 */
  force: SectionForce;
  /** 3成分に換算した断面力 */
  forceComponents: SectionForceComponents;
  /** モーメント [kN.m] */
  moment_KNm: number;
  shear_KN: number;
  axial_KN: number;
  combinedMoment_KNmm: number;
  combinedMoment_KNm: number;
}

/** 応力度の状態をまとめる型定義 */
interface SectionStressState {
  /** コンクリート圧縮応力度 [N/mm2] */
  concreteCompressionStress_NPerMm2: number;
  /** 鉄筋応力度 [N/mm2] */
  rebarStress_NPerMm2: number;
  /** コンクリートせん断応力度 [N/mm2] */
  concreteShearStress_NPerMm2: number;
  /** 鉄筋せん断応力度 [N/mm2] */
  rebarShearStress_NPerMm2: number;
}

/** 耐力の状態をまとめる型定義 */
interface SectionStrengthState {
  /** コンクリート終局曲げモーメント [kN.m] */
  concreteUltimateMoment_KNm: number;
  /** 鉄筋降伏曲げモーメント [kN.m] */
  rebarYieldMoment_KNm: number;
}

/** 計算に必要な入力と荷重状態をまとめる */
function createCalculationContext(input: AnnularSectionInput): SectionCalculationContext {
  const geometry = AnnularSectionGeometry.fromInput(input.geometry);
  if (!input.force) {
    throw new Error("断面力が指定されていません。");
  }

  const force = input.force;
  const forceComponents = resolveSectionForceComponents(force);
  const moment_KNm = forceComponents.moment_KNm;
  const shear_KN = forceComponents.shear_KN;
  const axial_KN = forceComponents.axial_KN;
  const combinedMoment_KNmm = moment_KNm * 1000 + axial_KN * geometry.outerRadius_Mm;

  return {
    geometry,
    materialParams: input.materialParams,
    force,
    forceComponents,
    moment_KNm,
    shear_KN,
    axial_KN,
    combinedMoment_KNmm,
    combinedMoment_KNm: combinedMoment_KNmm / 1000,
  };
}

/** 中立軸位置 [mm] を算出する */
function calculateNeutralAxisPosition_Mm(
  geometry: AnnularSectionGeometry,
  solver: NeutralAxisSolverResult,
): number {
  return (
    (solver.concreteCompressionCoefficient /
      (solver.concreteCompressionCoefficient + solver.steelStressCoefficient)) *
    (geometry.outerRadius_Mm + geometry.rebarRadius_Mm)
  );
}

/** 応力度の状態を算出する */
function calculateStressState(
  context: SectionCalculationContext,
  solver: NeutralAxisSolverResult,
): SectionStressState {
  const combinedMomentNmm = context.combinedMoment_KNmm * 1000;
  const outerRadius_Mm = context.geometry.outerRadius_Mm;
  const scale = combinedMomentNmm / outerRadius_Mm ** 3;

  /** コンクリート圧縮応力度 [N/mm2] */
  const concreteCompressionStress_NPerMm2 = scale * solver.concreteCompressionCoefficient;

  /** 鉄筋応力度 [N/mm2] */
  const rebarStress_NPerMm2 = scale * solver.steelStressCoefficient * context.materialParams.youngRatio;

  /** せん断応力度 [N/mm2]  */
  const shearStress_NPerMm2 =
    // せん断力によるせん断応力度 (S / A)
    ((context.shear_KN * 1000) / outerRadius_Mm ** 2) * solver.shearCoefficient +
    // ねじりモーメントによるせん断応力度 (Mx / Zp)
    (Math.abs(context.force.mx_KNm) * 1000 ** 2) / context.geometry.polarSectionModulus_Mm3;

  // コンクリートが負担できる平均せん断応力度の基本値 τc の超過分を鉄筋が負担する
  const tauC_NPerMm2 = getTauC_NPerMm2(context.materialParams.concreteDesignStrength_NPerMm2);

  /** コンクリートせん断応力度 [N/mm2] */
  const concreteShearStress_NPerMm2 = Math.min(shearStress_NPerMm2, tauC_NPerMm2);

  /** 鉄筋せん断応力度 [N/mm2] */
  const rebarShearStress_NPerMm2 =
    shearStress_NPerMm2 > tauC_NPerMm2 ? shearStress_NPerMm2 - tauC_NPerMm2 : 0;

  return {
    concreteCompressionStress_NPerMm2,
    rebarStress_NPerMm2,
    concreteShearStress_NPerMm2,
    rebarShearStress_NPerMm2,
  };
}

/** 耐力の状態を算出する */
function calculateStrengthState(context: SectionCalculationContext): SectionStrengthState {
  const solverInput: StrengthMomentSolverInput = {
    force: context.force,
    geometry: context.geometry,
    materialParams: context.materialParams,
  };

  return {
    concreteUltimateMoment_KNm: calculateConcreteUltimateMoment_KNm(solverInput),
    rebarYieldMoment_KNm: calculateRebarYieldMoment_KNm(solverInput),
  };
}

/**
 * 軸力の符号を判定する関数
 */
function classifyAxialForce(axial_KN: number): AxialForceSign {
  if (axial_KN > EPSILON) {
    return "tension";
  }
  if (axial_KN < -EPSILON) {
    return "compression";
  }
  return "zero";
}

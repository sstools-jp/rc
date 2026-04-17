import { REBAR_DIAMETERS_MM, getRebarAreaMm2 } from "@/model/rebar";
import type { RebarDiameterMm } from "@/model/rebar";
import type { AxialForceSign, SectionForce3 } from "@/model/section-force";
import type { AnnularSectionGeometryInput, AnnularSectionInput, MaterialParams } from "@/model/section-types";
import {
  calculateConcreteUltimateMomentKNm,
  calculateRebarYieldMomentKNm,
  solveNeutralAxisAngleDeg,
} from "@/model/section-solver";
import type { NeutralAxisSolverResult, StrengthMomentSolverInput } from "@/model/section-solver";

/** 円環断面の形状を表す値オブジェクト */
export class AnnularSectionGeometry {
  readonly outerRadiusMm: number;
  readonly innerRadiusMm: number;
  readonly rebarRadiusMm: number;
  readonly rebarDiameterMm: RebarDiameterMm;
  readonly barCount: number;

  private constructor(input: AnnularSectionGeometryInput) {
    this.outerRadiusMm = input.outerRadiusMm;
    this.innerRadiusMm = input.innerRadiusMm;
    this.rebarRadiusMm = input.rebarRadiusMm;
    this.rebarDiameterMm = input.rebarDiameterMm;
    this.barCount = input.barCount;
  }

  /** 入力値から値オブジェクトを生成する */
  static fromInput(input: AnnularSectionGeometryInput): AnnularSectionGeometry {
    return new AnnularSectionGeometry(input);
  }

  /** 全断面積 [mm2] */
  get fullSectionAreaMm2(): number {
    return Math.PI * this.outerRadiusMm * this.outerRadiusMm;
  }

  /** 内部断面積 [mm2] */
  get innerSectionAreaMm2(): number {
    return Math.PI * this.innerRadiusMm * this.innerRadiusMm;
  }

  /** 断面積 [mm2] */
  get sectionAreaMm2(): number {
    return this.fullSectionAreaMm2 - this.innerSectionAreaMm2;
  }

  /** 1本あたりの鉄筋断面積 [mm2] */
  get rebarAreaPerBarMm2(): number {
    return getRebarAreaMm2(this.rebarDiameterMm);
  }

  /** 鉄筋総断面積 [mm2] */
  get totalRebarAreaMm2(): number {
    return this.rebarAreaPerBarMm2 * this.barCount;
  }

  /** 鉄筋比 [%] */
  get rebarRatioPercent(): number {
    return (this.totalRebarAreaMm2 / this.fullSectionAreaMm2) * 100;
  }

  /** 中立軸位置の係数 */
  get alpha(): number {
    return this.rebarRadiusMm / this.outerRadiusMm;
  }

  /** 軸力係数 */
  get gamma(): number {
    return this.innerRadiusMm / this.outerRadiusMm;
  }

  /** 入力型へ戻す */
  toInput(): AnnularSectionGeometryInput {
    return {
      outerRadiusMm: this.outerRadiusMm,
      innerRadiusMm: this.innerRadiusMm,
      rebarRadiusMm: this.rebarRadiusMm,
      rebarDiameterMm: this.rebarDiameterMm,
      barCount: this.barCount,
    };
  }
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
  force3: SectionForce3 | undefined,
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

/** 断面形状の入力値を検査する */
function validateGeometry(
  geometry: AnnularSectionGeometryInput,
  issues: AnnularSectionValidationIssue[],
): void {
  const { outerRadiusMm, innerRadiusMm, rebarRadiusMm, rebarDiameterMm, barCount } = geometry;

  if (!Number.isFinite(outerRadiusMm) || outerRadiusMm <= 0) {
    issues.push({ field: "geometry", message: "半径（外）は正の数で指定してください。" });
  }
  if (!Number.isFinite(innerRadiusMm) || innerRadiusMm < 0) {
    issues.push({ field: "geometry", message: "半径（内）は 0 以上で指定してください。" });
  }
  if (!Number.isFinite(rebarRadiusMm) || rebarRadiusMm < 0) {
    issues.push({ field: "geometry", message: "鉄筋の位置（有効半径）は 0 以上で指定してください。" });
  }
  if (!Number.isFinite(barCount) || barCount <= 0) {
    issues.push({ field: "geometry", message: "本数は正の数で指定してください。" });
  }

  const validDiameters = new Set<number>(REBAR_DIAMETERS_MM);
  if (!validDiameters.has(rebarDiameterMm)) {
    issues.push({ field: "materialParams", message: "鉄筋径は D6 から D51 の範囲で指定してください。" });
  }

  if (Number.isFinite(outerRadiusMm) && Number.isFinite(innerRadiusMm) && innerRadiusMm > outerRadiusMm) {
    issues.push({ field: "geometry", message: "半径（内）は半径（外）以下で指定してください。" });
  }
  if (Number.isFinite(outerRadiusMm) && Number.isFinite(rebarRadiusMm) && rebarRadiusMm > outerRadiusMm) {
    issues.push({ field: "geometry", message: "鉄筋の位置（有効半径）は半径（外）以下で指定してください。" });
  }
  if (Number.isFinite(innerRadiusMm) && Number.isFinite(rebarRadiusMm) && rebarRadiusMm < innerRadiusMm) {
    issues.push({ field: "geometry", message: "鉄筋の位置（有効半径）は半径（内）以上で指定してください。" });
  }
}

/** 諸係数の入力値を検査する */
function validateMaterialParams(
  materialParams: AnnularSectionInput["materialParams"],
  issues: AnnularSectionValidationIssue[],
): void {
  const { youngRatio, rebarYieldStrengthNPerMm2, concreteDesignStrengthNPerMm2 } = materialParams;

  if (!Number.isFinite(youngRatio) || youngRatio <= 0) {
    issues.push({ field: "materialParams", message: "ヤング係数比は正の数で指定してください。" });
  }
  if (!Number.isFinite(rebarYieldStrengthNPerMm2) || rebarYieldStrengthNPerMm2 <= 0) {
    issues.push({ field: "materialParams", message: "鉄筋降伏強度は正の数で指定してください。" });
  }
  if (!Number.isFinite(concreteDesignStrengthNPerMm2) || concreteDesignStrengthNPerMm2 <= 0) {
    issues.push({ field: "materialParams", message: "コンクリート設計基準強度は正の数で指定してください。" });
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
    const { force3, geometry, materialParams } = this.input;

    validateSectionForce3(force3, issues);

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
    const neutralAxisPositionMm = calculateNeutralAxisPositionMm(context.geometry, solver);

    // 応力度の状態を算出
    const stressState = calculateStressState(context, solver);

    // 耐力の状態を算出
    const strengthState = calculateStrengthState(context);

    return {
      // 断面形状
      sectionAreaMm2: context.geometry.sectionAreaMm2,
      fullSectionAreaMm2: context.geometry.fullSectionAreaMm2,
      innerSectionAreaMm2: context.geometry.innerSectionAreaMm2,
      rebarAreaPerBarMm2: context.geometry.rebarAreaPerBarMm2,
      totalRebarAreaMm2: context.geometry.totalRebarAreaMm2,
      rebarRatioPercent: context.geometry.rebarRatioPercent,
      // 係数
      alpha: context.geometry.alpha,
      gamma: context.geometry.gamma,
      combinedMomentKNm: context.combinedMomentKNm,
      axialForceSign: classifyAxialForce(context.axialKN),
      youngRatio: context.materialParams.youngRatio,
      // 中立軸
      neutralAxisAngleDeg: solver.neutralAxisAngleDeg,
      neutralAxisPositionMm,
      // 応力度係数
      concreteCompressionCoefficient: solver.concreteCompressionCoefficient,
      steelStressCoefficient: solver.steelStressCoefficient,
      shearCoefficient: solver.shearCoefficient,
      // 発生応力度
      concreteCompressionStressNPerMm2: stressState.concreteCompressionStressNPerMm2,
      rebarStressNPerMm2: stressState.rebarStressNPerMm2,
      concreteShearStressNPerMm2: stressState.concreteShearStressNPerMm2,
      // 終局耐力
      concreteUltimateMomentKNm: strengthState.concreteUltimateMomentKNm,
      rebarYieldMomentKNm: strengthState.rebarYieldMomentKNm,
    };
  }
}

/** フォームの状態を表す型定義 */
interface SectionCalculationContext {
  /** 断面形状 */
  geometry: AnnularSectionGeometry;
  /** 諸係数 */
  materialParams: MaterialParams;
  /** 3断面力 */
  force3: SectionForce3;
  /** モーメント [kN.m] */
  momentKNm: number;
  shearKN: number;
  axialKN: number;
  combinedMomentKNmm: number;
  combinedMomentKNm: number;
}

/** 応力度の状態をまとめる型定義 */
interface SectionStressState {
  /** コンクリート圧縮応力度 [N/mm2] */
  concreteCompressionStressNPerMm2: number;
  /** 鉄筋応力度 [N/mm2] */
  rebarStressNPerMm2: number;
  /** コンクリートせん断応力度 [N/mm2] */
  concreteShearStressNPerMm2: number;
}

/** 耐力の状態をまとめる型定義 */
interface SectionStrengthState {
  /** コンクリート終局曲げモーメント [kN.m] */
  concreteUltimateMomentKNm: number;
  /** 鉄筋降伏曲げモーメント [kN.m] */
  rebarYieldMomentKNm: number;
}

/** 計算に必要な入力と荷重状態をまとめる */
function createCalculationContext(input: AnnularSectionInput): SectionCalculationContext {
  const geometry = AnnularSectionGeometry.fromInput(input.geometry);
  const force3 = resolveSectionForce3(input);
  const momentKNm = force3.momentKNm;
  const shearKN = force3.shearKN;
  const axialKN = force3.axialKN;
  const combinedMomentKNmm = momentKNm * 1000 + axialKN * geometry.outerRadiusMm;

  return {
    geometry,
    materialParams: input.materialParams,
    force3,
    momentKNm,
    shearKN,
    axialKN,
    combinedMomentKNmm,
    combinedMomentKNm: combinedMomentKNmm / 1000,
  };
}

/** 中立軸位置 [mm] を算出する */
function calculateNeutralAxisPositionMm(
  geometry: AnnularSectionGeometry,
  solver: NeutralAxisSolverResult,
): number {
  return (
    (solver.concreteCompressionCoefficient /
      (solver.concreteCompressionCoefficient + solver.steelStressCoefficient)) *
    (geometry.outerRadiusMm + geometry.rebarRadiusMm)
  );
}

/** 応力度の状態を算出する */
function calculateStressState(
  context: SectionCalculationContext,
  solver: NeutralAxisSolverResult,
): SectionStressState {
  const scale = (context.combinedMomentKNmm * 1000) / Math.pow(context.geometry.outerRadiusMm, 3);

  return {
    concreteCompressionStressNPerMm2: scale * solver.concreteCompressionCoefficient,
    rebarStressNPerMm2: scale * solver.steelStressCoefficient * context.materialParams.youngRatio,
    concreteShearStressNPerMm2:
      ((context.shearKN * 1000) / Math.pow(context.geometry.outerRadiusMm, 2)) * solver.shearCoefficient,
  };
}

/** 耐力の状態を算出する */
function calculateStrengthState(context: SectionCalculationContext): SectionStrengthState {
  const solverInput: StrengthMomentSolverInput = {
    force3: {
      momentKNm: context.momentKNm,
      shearKN: context.shearKN,
      axialKN: context.axialKN,
    },
    geometry: context.geometry,
    materialParams: context.materialParams,
  };

  return {
    concreteUltimateMomentKNm: calculateConcreteUltimateMomentKNm(solverInput),
    rebarYieldMomentKNm: calculateRebarYieldMomentKNm(solverInput),
  };
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

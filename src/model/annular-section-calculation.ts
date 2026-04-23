import { getTauC_NPerMm2 } from "@/model/concrete";
import { AnnularSectionGeometry } from "@/model/annular-section-geometry";
import {
  resolveSectionForceComponents,
  type AxialForceSign,
  type SectionForce,
  type SectionForceComponents,
} from "@/model/section-force";
import type { AnnularSectionInput, MaterialParams } from "@/model/section-types";
import {
  calculateConcreteUltimateMoment_KNm,
  calculateRebarYieldMoment_KNm,
} from "@/model/section-solver";
import type { NeutralAxisSolverResult, StrengthMomentSolverInput } from "@/model/section-solver";

/** フォームの状態を表す型定義 */
export interface SectionCalculationContext {
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
export interface SectionStressState {
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
export interface SectionStrengthState {
  /** コンクリート終局曲げモーメント [kN.m] */
  concreteUltimateMoment_KNm: number;
  /** 鉄筋降伏曲げモーメント [kN.m] */
  rebarYieldMoment_KNm: number;
}

/** 数値計算用の極小値（ゼロ判定用） */
const EPSILON = 1e-9;

/** 計算に必要な入力と荷重状態をまとめる */
export function createCalculationContext(input: AnnularSectionInput): SectionCalculationContext {
  const geometry = AnnularSectionGeometry.fromInput(input.geometry);
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
export function calculateNeutralAxisPosition_Mm(
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
export function calculateStressState(
  context: SectionCalculationContext,
  solver: NeutralAxisSolverResult,
): SectionStressState {
  const combinedMomentNmm = context.combinedMoment_KNmm * 1000;
  const outerRadius_Mm = context.geometry.outerRadius_Mm;
  const scale = combinedMomentNmm / outerRadius_Mm ** 3;

  const concreteCompressionStress_NPerMm2 = scale * solver.concreteCompressionCoefficient;
  const rebarStress_NPerMm2 = scale * solver.steelStressCoefficient * context.materialParams.youngRatio;

  const shearStress_NPerMm2 =
    ((context.shear_KN * 1000) / outerRadius_Mm ** 2) * solver.shearCoefficient +
    (Math.abs(context.force.mx_KNm) * 1000 ** 2) / context.geometry.polarSectionModulus_Mm3;

  const tauC_NPerMm2 = getTauC_NPerMm2(context.materialParams.concreteDesignStrength_NPerMm2);

  const concreteShearStress_NPerMm2 = Math.min(shearStress_NPerMm2, tauC_NPerMm2);
  const rebarShearStress_NPerMm2 = shearStress_NPerMm2 > tauC_NPerMm2 ? shearStress_NPerMm2 - tauC_NPerMm2 : 0;

  return {
    concreteCompressionStress_NPerMm2,
    rebarStress_NPerMm2,
    concreteShearStress_NPerMm2,
    rebarShearStress_NPerMm2,
  };
}

/** 耐力の状態を算出する */
export function calculateStrengthState(context: SectionCalculationContext): SectionStrengthState {
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

/** 軸力の符号を判定する関数 */
export function classifyAxialForce(axial_KN: number): AxialForceSign {
  if (axial_KN > EPSILON) {
    return "tension";
  }
  if (axial_KN < -EPSILON) {
    return "compression";
  }
  return "zero";
}
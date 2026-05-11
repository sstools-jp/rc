import { getTauC_NPerMm2 } from "@/models/concrete";
import { AnnularSectionGeometry } from "@/models/annular-section-geometry";
import { type SectionForce } from "@/models/section-force";
import type { AnnularSectionInput, MaterialParams } from "@/models/section-types";
import { calculateConcreteUltimateMoment_KNm, calculateRebarYieldMoment_KNm } from "@/models/section-solver";
import type { NeutralAxisSolverResult, StrengthMomentSolverInput } from "@/models/section-solver";

/** フォームの状態を表す型定義 */
export interface SectionCalculationContext {
  /** 断面形状 */
  geometry: AnnularSectionGeometry;
  /** 諸係数 */
  materialParams: MaterialParams;
  /** 断面力 */
  force: SectionForce;
  /** 換算モーメント [kN.mm] */
  combinedMoment_KNmm: number;
  /** 換算モーメント [kN.m] */
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

/** 計算に必要な入力と荷重状態をまとめる */
export function createCalculationContext(input: AnnularSectionInput): SectionCalculationContext {
  const geometry = AnnularSectionGeometry.fromInput(input.geometry);
  const force = input.force;
  const forceComponents = force.threeForce;
  const moment_KNm = forceComponents.moment_KNm;
  const axial_KN = forceComponents.axial_KN;
  const combinedMoment_KNmm = moment_KNm * 1000 + axial_KN * geometry.outerRadius_Mm;

  return {
    geometry,
    materialParams: input.materialParams,
    force,
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
  const { shear_KN } = context.force.threeForce;
  const combinedMomentNmm = context.combinedMoment_KNmm * 1000;
  const outerRadius_Mm = context.geometry.outerRadius_Mm;
  const scale = combinedMomentNmm / outerRadius_Mm ** 3;

  const concreteCompressionStress_NPerMm2 = scale * solver.concreteCompressionCoefficient;
  const rebarStress_NPerMm2 = scale * solver.steelStressCoefficient * context.materialParams.youngRatio;

  const shearStress_NPerMm2 =
    ((shear_KN * 1000) / outerRadius_Mm ** 2) * solver.shearCoefficient +
    (Math.abs(context.force.mx_KNm) * 1000 ** 2) / context.geometry.polarSectionModulus_Mm3;

  const tauC_NPerMm2 = getTauC_NPerMm2(context.materialParams.concreteDesignStrength_NPerMm2);

  const concreteShearStress_NPerMm2 = Math.min(shearStress_NPerMm2, tauC_NPerMm2);
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

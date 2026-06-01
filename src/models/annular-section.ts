import { type AxialForceSign } from "@/models/section-force";
import type { SectionForce } from "@/models/section-force";
import type { AnnularSectionInput } from "@/models/section-types";
import { solveNeutralAxisAngleDeg } from "@/models/section-solver";
import { validateAnnularSectionInput } from "@/models/annular-section-validation";
import {
  calculateNeutralAxisPosition_Mm,
  calculateStressState,
  calculateStrengthState,
  classifyAxialForce,
  createCalculationContext,
  type SectionStrengthState,
  type SectionStressState,
} from "@/models/annular-section-calculation";

export { AnnularSectionGeometry } from "@/models/annular-section-geometry";

/** 検算結果の型定義 */
export interface AnnularSectionValidationIssue {
  field: "force" | keyof AnnularSectionInput | keyof SectionForce;
  message: string;
}

/** 計算結果の型定義 */
export interface AnnularSectionSectionResult {
  /** コンクリート外径による断面積 [mm2] */
  concreteOuterSectionArea_Mm2: number;
  /** コンクリート内径による断面積 [mm2] */
  concreteInnerSectionArea_Mm2: number;
  /** コンクリート総断面積 [mm2] */
  concreteSectionArea_Mm2: number;
  /** 1本あたりの鉄筋断面積 [mm2] */
  rebarSingleArea_Mm2: number;
  /** 鉄筋総断面積 [mm2] */
  rebarTotalArea_Mm2: number;
  /** 鉄筋比 [%] */
  rebarRatioPercent: number;
  /** 中立軸位置の係数 */
  alpha: number;
  /** 軸力係数 */
  gamma: number;
}

/** 荷重状態の結果定義 */
export interface AnnularSectionLoadingResult {
  /** 合成曲げモーメント [kN.m] */
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

/** 円環断面の計算結果をまとめた型定義 */
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
    return validateAnnularSectionInput(this.input);
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
        concreteOuterSectionArea_Mm2: context.geometry.concreteOuterSectionArea_Mm2,
        concreteInnerSectionArea_Mm2: context.geometry.concreteInnerSectionArea_Mm2,
        concreteSectionArea_Mm2: context.geometry.concreteSectionArea_Mm2,
        rebarSingleArea_Mm2: context.geometry.rebarSingleArea_Mm2,
        rebarTotalArea_Mm2: context.geometry.rebarTotalArea_Mm2,
        rebarRatioPercent: context.geometry.rebarRatioPercent,
        alpha: context.geometry.alpha,
        gamma: context.geometry.gamma,
      },
      loading: {
        combinedMoment_KNm: context.combinedMoment_KNm,
        axialForceSign: classifyAxialForce(context.force.fx_KN ?? 0),
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

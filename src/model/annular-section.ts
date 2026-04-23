import { type AxialForceSign } from "@/model/section-force";
import type { AnnularSectionInput } from "@/model/section-types";
import { solveNeutralAxisAngleDeg } from "@/model/section-solver";
import { validateAnnularSectionInput } from "@/model/annular-section-validation";
import {
  calculateNeutralAxisPosition_Mm,
  calculateStressState,
  calculateStrengthState,
  classifyAxialForce,
  createCalculationContext,
  type SectionStrengthState,
  type SectionStressState,
} from "@/model/annular-section-calculation";

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

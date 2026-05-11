import { calculateRectanglarPerimeterSectionResult } from "./rectangular-perimeter-section-calculation";
import { RectanglarPerimeterSectionGeometry } from "@/models/rectangular-perimeter-section-geometry";
import {
  type RectanglarPerimeterSectionInput,
  type RectanglarPerimeterSectionValidationIssue,
  validateRectanglarPerimeterSectionInput,
} from "@/models/rectangular-perimeter-section-validation";
import type { AxialForceSign } from "@/models/section-force";

export { RectanglarPerimeterSectionGeometry } from "@/models/rectangular-perimeter-section-geometry";
export type { RectanglarPerimeterSectionGeometryInput } from "@/models/rectangular-perimeter-section-geometry";
export type { RectanglarPerimeterSectionInput } from "@/models/rectangular-perimeter-section-validation";
export type { RectanglarPerimeterSectionValidationIssue } from "@/models/rectangular-perimeter-section-validation";

/** 断面結果の型定義 */
export interface RectanglarPerimeterSectionSectionResult {
  /** 断面積 [mm2] */
  sectionArea_Mm2: number;
  /** 全断面積 [mm2] */
  fullSectionArea_Mm2: number;
  /** 複鉄筋の1本あたりの断面積 [mm2] */
  subRebarAreaPerBar_Mm2: number;
  /** 複鉄筋の断面積 [mm2] */
  mainRebarArea_Mm2: number;
  /** 側鉄筋の1本あたりの断面積 [mm2] */
  sideRebarAreaPerBar_Mm2: number;
  /** 側鉄筋の断面積 [mm2] */
  sideRebarArea_Mm2: number;
  /** 複鉄筋比 [%] */
  rebarRatioPercent: number;
}

/** 荷重状態の結果定義 */
export interface RectanglarPerimeterSectionLoadingResult {
  /** 換算曲げモーメント [kN.m] */
  combinedMoment_KNm: number;
  /** 軸力の符号 */
  axialForceSign: AxialForceSign;
}

/** 中立軸の結果定義 */
export interface RectanglarPerimeterSectionNeutralAxisResult {
  /** 中立軸比 */
  k: number;
  /** 中立軸位置 [mm] */
  neutralAxisPosition_Mm: number;
  /** コンクリート圧縮応力度係数 */
  concreteCompressionCoefficient: number;
  /** 鋼材応力度係数 */
  steelStressCoefficient: number;
  /** せん断応力度係数 */
  shearCoefficient: number;
}

/** 応力度の結果定義 */
export interface RectanglarPerimeterSectionStressResult {
  /** コンクリート曲げ圧縮応力度 [N/mm2] */
  concreteCompressionStress_NPerMm2: number;
  /** 鉄筋曲げ引張応力度 [N/mm2] */
  rebarStress_NPerMm2: number;
  /** コンクリートせん断応力度 [N/mm2] */
  concreteShearStress_NPerMm2: number;
  /** 平均せん断応力度 [N/mm2] */
  rebarShearStress_NPerMm2: number;
}

/** 計算結果をまとめた型定義 */
export interface RectanglarPerimeterSectionResult {
  /** 断面形状の結果 */
  section: RectanglarPerimeterSectionSectionResult;
  /** 荷重状態の結果 */
  loading: RectanglarPerimeterSectionLoadingResult;
  /** 中立軸の結果 */
  neutralAxis: RectanglarPerimeterSectionNeutralAxisResult;
  /** 応力度の結果 */
  stress: RectanglarPerimeterSectionStressResult;
}

/** 矩形周囲鉄筋の計算クラス */
export class RectanglarPerimeterSectionCalculator {
  private readonly input: RectanglarPerimeterSectionInput;

  constructor(input: RectanglarPerimeterSectionInput) {
    this.input = input;
  }

  /** 入力値の検査 */
  validate(): RectanglarPerimeterSectionValidationIssue[] {
    return validateRectanglarPerimeterSectionInput(this.input);
  }

  /** 計算処理 */
  calculate(): RectanglarPerimeterSectionResult {
    const issues = this.validate();
    if (issues.length > 0) {
      throw new Error(issues.map((issue) => issue.message).join(" "));
    }

    const geometry = RectanglarPerimeterSectionGeometry.fromInput(this.input.geometry);

    return calculateRectanglarPerimeterSectionResult({
      geometry,
      force: this.input.force,
      materialParams: this.input.materialParams,
    });
  }
}

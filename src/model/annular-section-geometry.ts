import { getRebarAreaMm2ByKind, type RebarKind } from "@/model/rebar";
import type { AnnularSectionGeometryInput } from "@/model/section-types";

/** 円環断面の形状を表す値オブジェクト */
export class AnnularSectionGeometry {
  readonly outerRadius_Mm: number;
  readonly innerRadius_Mm: number;
  readonly rebarRadius_Mm: number;
  readonly rebarKind: RebarKind;
  readonly rebarDiameter_Mm: number;
  readonly barCount: number;

  private constructor(input: AnnularSectionGeometryInput) {
    this.outerRadius_Mm = input.outerRadius_Mm;
    this.innerRadius_Mm = input.innerRadius_Mm;
    this.rebarRadius_Mm = input.rebarRadius_Mm;
    this.rebarKind = input.rebarKind;
    this.rebarDiameter_Mm = input.rebarDiameter_Mm;
    this.barCount = input.barCount;
  }

  /** 入力値から値オブジェクトを生成する */
  static fromInput(input: AnnularSectionGeometryInput): AnnularSectionGeometry {
    return new AnnularSectionGeometry(input);
  }

  /** 全断面積 [mm2] */
  get fullSectionArea_Mm2(): number {
    return Math.PI * this.outerRadius_Mm * this.outerRadius_Mm;
  }

  /** 内部断面積 [mm2] */
  get innerSectionArea_Mm2(): number {
    return Math.PI * this.innerRadius_Mm * this.innerRadius_Mm;
  }

  /** 断面積 [mm2] */
  get sectionArea_Mm2(): number {
    return this.fullSectionArea_Mm2 - this.innerSectionArea_Mm2;
  }

  /** 1本あたりの鉄筋断面積 [mm2] */
  get rebarAreaPerBar_Mm2(): number {
    return getRebarAreaMm2ByKind(this.rebarKind, this.rebarDiameter_Mm);
  }

  /** 鉄筋総断面積 [mm2] */
  get totalRebarArea_Mm2(): number {
    return this.rebarAreaPerBar_Mm2 * this.barCount;
  }

  /** 極断面係数 [mm3] */
  get polarSectionModulus_Mm3(): number {
    return (Math.PI / (16 * this.outerRadius_Mm)) * (this.outerRadius_Mm ** 4 - this.innerRadius_Mm ** 4);
  }

  /** 鉄筋比 [%] */
  get rebarRatioPercent(): number {
    return (this.totalRebarArea_Mm2 / this.fullSectionArea_Mm2) * 100;
  }

  /** 中立軸位置の係数 */
  get alpha(): number {
    return this.rebarRadius_Mm / this.outerRadius_Mm;
  }

  /** 軸力係数 */
  get gamma(): number {
    return this.innerRadius_Mm / this.outerRadius_Mm;
  }

  /** 入力型へ戻す */
  toInput(): AnnularSectionGeometryInput {
    return {
      outerRadius_Mm: this.outerRadius_Mm,
      innerRadius_Mm: this.innerRadius_Mm,
      rebarRadius_Mm: this.rebarRadius_Mm,
      rebarKind: this.rebarKind,
      rebarDiameter_Mm: this.rebarDiameter_Mm,
      barCount: this.barCount,
    };
  }
}
import type { RebarDiameterMm } from "@/model/rebar";
import type { ConcreteDesignStrength_NPerMm2 } from "@/model/concrete";
import type { SectionForce } from "@/model/section-force";

/** 円環断面の入力全体を表す型定義 */
export interface AnnularSectionInput {
  /** 断面力 */
  force: SectionForce;
  /** 断面形状 */
  geometry: AnnularSectionGeometryInput;
  /** 諸係数 */
  materialParams: MaterialParams;
}

/** 円環断面の形状を表す入力型定義 */
export interface AnnularSectionGeometryInput {
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
  concreteDesignStrength_NPerMm2: ConcreteDesignStrength_NPerMm2;
}

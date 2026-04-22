/** 断面力のフォーム状態の型定義 */
export type SectionForceFormState = {
  /** 軸力 [kN] */
  fx_KN: string;
  /** せん断力（面外） [kN] */
  fy_KN: string;
  /** せん断力（面内） [kN] */
  fz_KN: string;
  /** ねじりモーメント [kN.m] */
  mx_KNm: string;
  /** 曲げモーメント（面内） [kN.m] */
  my_KNm: string;
  /** 曲げモーメント（面外） [kN.m] */
  mz_KNm: string;
};

/** 断面形状のフォーム状態の型定義 */
export type GeometryFormState = {
  /** 外径 [mm] */
  outerRadius_Mm: string;
  /** 内径 [mm] */
  innerRadius_Mm: string;
  /** 鉄筋位置 [mm] */
  rebarRadius_Mm: string;
  /** 鉄筋種別 */
  rebarKind: string;
  /** 鉄筋径 [mm] */
  rebarDiameter_Mm: string;
  /** 丸鋼径 [mm] */
  roundRebarDiameter_Mm: string;
  /** 鉄筋本数 [本] */
  barCount: string;
};

/** 諸係数のフォーム状態の型定義 */
export type MaterialParamsFormState = {
  /** 鉄筋降伏強度 [N/mm2] */
  rebarYieldStrength_NPerMm2: string;
  /** コンクリート設計基準強度 [N/mm2] */
  concreteDesignStrength_NPerMm2: string;
  /** ヤング係数比 */
  youngRatio: string;
};

/** フォームの状態を表す型定義 */
export type FormState = SectionForceFormState & GeometryFormState & MaterialParamsFormState;

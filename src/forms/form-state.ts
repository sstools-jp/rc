/** 断面力のフォーム状態の型定義 */
export type SectionForceFormState = {
  /** 軸力 [kN] */
  fxKN: string;
  /** せん断力（面外） [kN] */
  fyKN: string;
  /** せん断力（面内） [kN] */
  fzKN: string;
  /** ねじりモーメント [kN.m] */
  mxKNm: string;
  /** 曲げモーメント（面内） [kN.m] */
  myKNm: string;
  /** 曲げモーメント（面外） [kN.m] */
  mzKNm: string;
};

/** 断面形状のフォーム状態の型定義 */
export type GeometryFormState = {
  /** 外径 [mm] */
  outerRadiusMm: string;
  /** 内径 [mm] */
  innerRadiusMm: string;
  /** 鉄筋位置 [mm] */
  rebarRadiusMm: string;
  /** 鉄筋径 [mm] */
  rebarDiameterMm: string;
  /** 鉄筋本数 [本] */
  barCount: string;
};

/** 諸係数のフォーム状態の型定義 */
export type MaterialParamsFormState = {
  /** 鉄筋降伏強度 [N/mm2] */
  rebarYieldStrengthNPerMm2: string;
  /** コンクリート設計基準強度 [N/mm2] */
  concreteDesignStrengthNPerMm2: string;
  /** ヤング係数比 */
  youngRatio: string;
};

/** フォームの状態を表す型定義 */
export type FormState = SectionForceFormState & GeometryFormState & MaterialParamsFormState;

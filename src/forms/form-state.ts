export type LoadFormState = {
  /** 曲げモーメント [kN.m] */
  momentKNm: string;
  /** せん断力 [kN] */
  shearKN: string;
  /** 軸力（圧縮力） [kN] */
  axialKN: string;
};

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

export type MaterialPropertiesFormState = {
  /** 鉄筋降伏強度 [N/mm2] */
  rebarYieldStrengthNPerMm2: string;
  /** コンクリート設計基準強度 [N/mm2] */
  concreteDesignStrengthNPerMm2: string;
  /** ヤング係数比 */
  youngRatio: string;
};

export type FormState = LoadFormState & GeometryFormState & MaterialPropertiesFormState;
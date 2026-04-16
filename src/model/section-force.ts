/** 軸力の符号を表す型 */
export type AxialForceSign = "compression" | "tension" | "zero";

/** 3断面力の型定義 */
export interface SectionForce3 {
  /** 曲げモーメント [kN.m] */
  momentKNm: number;
  /** せん断力 [kN] */
  shearKN: number;
  /** 軸力（圧縮力） [kN] */
  axialKN: number;
}

/** 6断面力の型定義 */
export interface SectionForce6 {
  /** 軸力 [kN] */
  fxKN: number;
  /** せん断力（面外） [kN] */
  fyKN: number;
  /**  せん断力（面内） [kN] */
  fzKN: number;
  /** ねじりモーメント [kN.m] */
  mxKNm: number;
  /** 曲げモーメント（面内） [kN.m] */
  myKNm: number;
  /** 曲げモーメント（面外） [kN.m] */
  mzKNm: number;
}

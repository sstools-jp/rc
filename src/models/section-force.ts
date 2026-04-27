/** 軸力の符号を表す型 */
export type AxialForceSign = "compression" | "tension" | "zero";

/** 断面力の型定義 */
export interface SectionForce {
  /** 軸力 [kN] */
  fx_KN: number;
  /** せん断力（面外） [kN] */
  fy_KN: number;
  /** せん断力（面内） [kN] */
  fz_KN: number;
  /** ねじりモーメント [kN.m] */
  mx_KNm: number;
  /** 曲げモーメント（面内） [kN.m] */
  my_KNm: number;
  /** 曲げモーメント（面外） [kN.m] */
  mz_KNm: number;
}

/** 断面力の換算値 */
export interface SectionForceComponents {
  /** 曲げモーメント [kN.m] */
  moment_KNm: number;
  /** せん断力 [kN] */
  shear_KN: number;
  /** 軸力（圧縮を正） [kN] */
  axial_KN: number;
}

/** 断面力を 3 成分に換算する */
export function resolveSectionForceComponents(force: SectionForce): SectionForceComponents {
  return {
    moment_KNm: Math.sqrt(force.my_KNm ** 2 + force.mz_KNm ** 2),
    shear_KN: Math.sqrt(force.fy_KN ** 2 + force.fz_KN ** 2),
    axial_KN: -force.fx_KN,
  };
}

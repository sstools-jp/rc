/** 軸力の符号を表す型 */
export type AxialForceSign = "compression" | "tension" | "zero";

/** 断面力の型定義 */
export interface SectionForce {
  /** 軸力 [kN] */
  fxKN: number;
  /** せん断力（面外） [kN] */
  fyKN: number;
  /** せん断力（面内） [kN] */
  fzKN: number;
  /** ねじりモーメント [kN.m] */
  mxKNm: number;
  /** 曲げモーメント（面内） [kN.m] */
  myKNm: number;
  /** 曲げモーメント（面外） [kN.m] */
  mzKNm: number;
}

/** 断面力の換算値 */
export interface SectionForceComponents {
  /** 曲げモーメント [kN.m] */
  momentKNm: number;
  /** せん断力 [kN] */
  shearKN: number;
  /** 軸力（圧縮を正） [kN] */
  axialKN: number;
}

/** 断面力を 3 成分に換算する */
export function resolveSectionForceComponents(
  force: SectionForce,
  rebarRadiusMm: number,
): SectionForceComponents {
  return {
    momentKNm: Math.sqrt(force.myKNm ** 2 + force.mzKNm ** 2),
    shearKN: Math.sqrt(force.fyKN ** 2 + force.fzKN ** 2) + (force.mxKNm * 1000) / rebarRadiusMm,
    axialKN: -force.fxKN,
  };
}

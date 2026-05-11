import { EPSILON } from "@/models/constants";

/** 軸力の符号 */
export type AxialForceSign = "compression" | "tension" | "zero";

/** 断面力の種別 */
export type SectionForceField = "fx_KN" | "fy_KN" | "fz_KN" | "mx_KNm" | "my_KNm" | "mz_KNm";

/** 6断面力 */
export interface SectionForce6 {
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

/** 3断面力 */
export interface SectionForce3 {
  /** 曲げモーメント [kN.m] */
  moment_KNm: number;
  /** せん断力 [kN] */
  shear_KN: number;
  /** 軸力 [kN] */
  axial_KN: number;
}

/** 断面力の値クラス */
export class SectionForce {
  public readonly fx_KN: number;
  public readonly fy_KN: number;
  public readonly fz_KN: number;
  public readonly mx_KNm: number;
  public readonly my_KNm: number;
  public readonly mz_KNm: number;

  constructor(force?: Partial<Pick<SectionForce, SectionForceField>> | undefined) {
    this.fx_KN = force?.fx_KN ?? 0;
    this.fy_KN = force?.fy_KN ?? 0;
    this.fz_KN = force?.fz_KN ?? 0;
    this.mx_KNm = force?.mx_KNm ?? 0;
    this.my_KNm = force?.my_KNm ?? 0;
    this.mz_KNm = force?.mz_KNm ?? 0;
    Object.freeze(this);
  }

  /** 6断面力 */
  get sixForce(): SectionForce6 {
    return {
      fx_KN: this.fx_KN,
      fy_KN: this.fy_KN,
      fz_KN: this.fz_KN,
      mx_KNm: this.mx_KNm,
      my_KNm: this.my_KNm,
      mz_KNm: this.mz_KNm,
    };
  }

  /** 3断面力 */
  get threeForce(): SectionForce3 {
    return {
      moment_KNm: Math.sqrt(this.my_KNm ** 2 + this.mz_KNm ** 2),
      shear_KN: Math.sqrt(this.fy_KN ** 2 + this.fz_KN ** 2),
      axial_KN: -this.fx_KN,
    };
  }

  /** 軸力の符号 */
  get axialForceSign(): AxialForceSign {
    if (this.fx_KN > EPSILON) {
      return "tension";
    }
    if (this.fx_KN < -EPSILON) {
      return "compression";
    }
    return "zero";
  }
}

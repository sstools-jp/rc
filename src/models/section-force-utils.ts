import type { AxialForceSign, SectionForce } from "@/models/section-force";
import { EPSILON } from "@/models/constants";

/** 断面力を正規化する */
export function normalizeSectionForce(force: Partial<SectionForce> | undefined): SectionForce {
  return {
    fx_KN: force?.fx_KN ?? 0,
    fy_KN: force?.fy_KN ?? 0,
    fz_KN: force?.fz_KN ?? 0,
    mx_KNm: force?.mx_KNm ?? 0,
    my_KNm: force?.my_KNm ?? 0,
    mz_KNm: force?.mz_KNm ?? 0,
  };
}

/** 軸力の符号を判定する */
export function classifyAxialForce(axial_KN: number): AxialForceSign {
  if (axial_KN > EPSILON) {
    return "tension";
  }
  if (axial_KN < -EPSILON) {
    return "compression";
  }
  return "zero";
}

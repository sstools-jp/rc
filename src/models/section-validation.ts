import type { MaterialParams } from "@/models/section-types";
import type { SectionForce, SectionForceField } from "@/models/section-force";

/** 断面力の入力値を検査する */
export function validateSectionForce(
  force: Partial<Pick<SectionForce, SectionForceField>> | undefined,
  addIssue: (field: SectionForceField, message: string) => void,
): void {
  const forceLabels: Record<SectionForceField, string> = {
    fx_KN: "軸力",
    fy_KN: "せん断力（面外）",
    fz_KN: "せん断力（面内）",
    mx_KNm: "ねじりモーメント",
    my_KNm: "曲げモーメント（面内）",
    mz_KNm: "曲げモーメント（面外）",
  };

  for (const [key, label] of Object.entries(forceLabels)) {
    const value = force?.[key as SectionForceField];
    if (value !== undefined && !Number.isFinite(value)) {
      addIssue(key as SectionForceField, `${label}は数値で指定してください。`);
    }
  }
}

/** 諸係数を検査する */
export function validateMaterialParams(
  materialParams: MaterialParams,
  addIssue: (field: "materialParams", message: string) => void,
): void {
  const { youngRatio, rebarYieldStrength_NPerMm2, concreteDesignStrength_NPerMm2 } = materialParams;

  if (!Number.isFinite(youngRatio) || youngRatio <= 0) {
    addIssue("materialParams", "ヤング係数比は正の数で指定してください。");
  }
  if (!Number.isFinite(rebarYieldStrength_NPerMm2) || rebarYieldStrength_NPerMm2 <= 0) {
    addIssue("materialParams", "鉄筋降伏強度は正の数で指定してください。");
  }
  if (!Number.isFinite(concreteDesignStrength_NPerMm2) || concreteDesignStrength_NPerMm2 <= 0) {
    addIssue("materialParams", "コンクリート設計基準強度は正の数で指定してください。");
  }
}

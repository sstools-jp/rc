import { REBAR_DIAMETERS_MM, isRebarKind } from "@/model/rebar";
import type { AnnularSectionGeometryInput, AnnularSectionInput, MaterialParams } from "@/model/section-types";
import type { AnnularSectionValidationIssue } from "@/model/annular-section";
import type { SectionForce } from "@/model/section-force";

/** 断面力の入力値を検査する */
function validateSectionForce(
  force: SectionForce | undefined,
  issues: AnnularSectionValidationIssue[],
): void {
  const forceLabels: Record<keyof SectionForce, string> = {
    fx_KN: "軸力",
    fy_KN: "せん断力（面外）",
    fz_KN: "せん断力（面内）",
    mx_KNm: "ねじりモーメント",
    my_KNm: "曲げモーメント（面内）",
    mz_KNm: "曲げモーメント（面外）",
  };

  for (const [key, label] of Object.entries(forceLabels)) {
    const value = force?.[key as keyof SectionForce];
    if (!Number.isFinite(value)) {
      issues.push({ field: "force", message: `${label}は数値で指定してください。` });
    }
  }
}

/** 断面形状の入力値を検査する */
function validateGeometry(
  geometry: AnnularSectionGeometryInput,
  issues: AnnularSectionValidationIssue[],
): void {
  const { outerRadius_Mm, innerRadius_Mm, rebarRadius_Mm, rebarKind, rebarDiameter_Mm, barCount } = geometry;

  if (!Number.isFinite(outerRadius_Mm) || outerRadius_Mm <= 0) {
    issues.push({ field: "geometry", message: "半径（外）は正の数で指定してください。" });
  }
  if (!Number.isFinite(innerRadius_Mm) || innerRadius_Mm < 0) {
    issues.push({ field: "geometry", message: "半径（内）は 0 以上で指定してください。" });
  }
  if (!Number.isFinite(rebarRadius_Mm) || rebarRadius_Mm < 0) {
    issues.push({ field: "geometry", message: "鉄筋の位置（有効半径）は 0 以上で指定してください。" });
  }
  if (!Number.isFinite(barCount) || barCount <= 0) {
    issues.push({ field: "geometry", message: "本数は正の数で指定してください。" });
  }

  if (!isRebarKind(rebarKind)) {
    issues.push({ field: "geometry", message: "鉄筋種別は異形棒鋼または丸鋼で指定してください。" });
  } else if (rebarKind === "deformed") {
    const validDiameters = new Set<number>(REBAR_DIAMETERS_MM);
    if (!validDiameters.has(rebarDiameter_Mm)) {
      issues.push({
        field: "materialParams",
        message: "異形棒鋼の径は D6 から D51 の範囲で指定してください。",
      });
    }
  } else if (!Number.isFinite(rebarDiameter_Mm) || rebarDiameter_Mm <= 0) {
    issues.push({ field: "materialParams", message: "丸鋼の直径は正の数で指定してください。" });
  }

  if (Number.isFinite(outerRadius_Mm) && Number.isFinite(innerRadius_Mm) && innerRadius_Mm > outerRadius_Mm) {
    issues.push({ field: "geometry", message: "半径（内）は半径（外）以下で指定してください。" });
  }
  if (Number.isFinite(outerRadius_Mm) && Number.isFinite(rebarRadius_Mm) && rebarRadius_Mm > outerRadius_Mm) {
    issues.push({ field: "geometry", message: "鉄筋の位置（有効半径）は半径（外）以下で指定してください。" });
  }
  if (Number.isFinite(innerRadius_Mm) && Number.isFinite(rebarRadius_Mm) && rebarRadius_Mm < innerRadius_Mm) {
    issues.push({ field: "geometry", message: "鉄筋の位置（有効半径）は半径（内）以上で指定してください。" });
  }
}

/** 諸係数を検査する */
function validateMaterialParams(
  materialParams: MaterialParams,
  issues: AnnularSectionValidationIssue[],
): void {
  const { youngRatio, rebarYieldStrength_NPerMm2, concreteDesignStrength_NPerMm2 } = materialParams;

  if (!Number.isFinite(youngRatio) || youngRatio <= 0) {
    issues.push({ field: "materialParams", message: "ヤング係数比は正の数で指定してください。" });
  }
  if (!Number.isFinite(rebarYieldStrength_NPerMm2) || rebarYieldStrength_NPerMm2 <= 0) {
    issues.push({ field: "materialParams", message: "鉄筋降伏強度は正の数で指定してください。" });
  }
  if (!Number.isFinite(concreteDesignStrength_NPerMm2) || concreteDesignStrength_NPerMm2 <= 0) {
    issues.push({ field: "materialParams", message: "コンクリート設計基準強度は正の数で指定してください。" });
  }
}

/** 円環断面の入力値を検査する */
export function validateAnnularSectionInput(input: AnnularSectionInput): AnnularSectionValidationIssue[] {
  const issues: AnnularSectionValidationIssue[] = [];

  validateSectionForce(input.force, issues);
  validateGeometry(input.geometry, issues);
  validateMaterialParams(input.materialParams, issues);

  return issues;
}

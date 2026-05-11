import { isRebarKind } from "@/models/rebar";
import type { SectionForce } from "@/models/section-force";
import type { MaterialParams } from "@/models/section-types";
import { validateMaterialParams, validateSectionForce } from "@/models/section-validation";
import type { RectanglarPerimeterSectionGeometryInput } from "@/models/rectangular-perimeter-section-geometry";

/** 矩形周囲鉄筋の入力全体を表す型定義 */
export interface RectanglarPerimeterSectionInput {
  /** 断面力 */
  force: Partial<SectionForce>;
  /** 断面形状 */
  geometry: RectanglarPerimeterSectionGeometryInput;
  /** 諸係数 */
  materialParams: MaterialParams;
}

/** 検証結果の型定義 */
export interface RectanglarPerimeterSectionValidationIssue {
  field: "force" | "geometry" | "materialParams" | keyof SectionForce;
  message: string;
}

/** 矩形周囲鉄筋の入力値を検査する */
export function validateRectanglarPerimeterSectionInput(
  input: RectanglarPerimeterSectionInput,
): RectanglarPerimeterSectionValidationIssue[] {
  const issues: RectanglarPerimeterSectionValidationIssue[] = [];

  validateSectionForce(input.force, (field, message) => {
    issues.push({ field, message });
  });
  validateGeometry(input.geometry, issues);
  validateMaterialParams(input.materialParams, (field, message) => {
    issues.push({ field, message });
  });

  return issues;
}

/** 断面形状の入力値を検査する */
function validateGeometry(
  geometry: RectanglarPerimeterSectionGeometryInput,
  issues: RectanglarPerimeterSectionValidationIssue[],
): void {
  const {
    width_Mm,
    height_Mm,
    subRebarEffectiveHeight_Mm,
    subRebarCover_Mm,
    subRebarKind,
    subRebarDiameter_Mm,
    subRebarCount,
    sideRebarKind,
    sideRebarDiameter_Mm,
    sideRebarCount,
  } = geometry;

  if (!Number.isFinite(width_Mm) || width_Mm <= 0) {
    issues.push({ field: "geometry", message: "幅は正の数で指定してください。" });
  }
  if (!Number.isFinite(height_Mm) || height_Mm <= 0) {
    issues.push({ field: "geometry", message: "高さは正の数で指定してください。" });
  }
  if (!Number.isFinite(subRebarEffectiveHeight_Mm) || subRebarEffectiveHeight_Mm <= 0) {
    issues.push({ field: "geometry", message: "複鉄筋の引張鉄筋の有効高さは正の数で指定してください。" });
  }
  if (!Number.isFinite(subRebarCover_Mm) || subRebarCover_Mm <= 0) {
    issues.push({ field: "geometry", message: "複鉄筋の圧縮鉄筋の被りは正の数で指定してください。" });
  }

  if (
    Number.isFinite(width_Mm) &&
    Number.isFinite(height_Mm) &&
    Number.isFinite(subRebarEffectiveHeight_Mm)
  ) {
    if (height_Mm <= subRebarEffectiveHeight_Mm) {
      issues.push({
        field: "geometry",
        message: "高さは複鉄筋の引張鉄筋の有効高さより大きい値で指定してください。",
      });
    }
  }
  if (
    Number.isFinite(subRebarEffectiveHeight_Mm) &&
    Number.isFinite(subRebarCover_Mm) &&
    subRebarEffectiveHeight_Mm > 0 &&
    subRebarCover_Mm > 0 &&
    subRebarCover_Mm >= subRebarEffectiveHeight_Mm
  ) {
    issues.push({
      field: "geometry",
      message: "複鉄筋の引張鉄筋の有効高さは複鉄筋の圧縮鉄筋の被りより大きい値で指定してください。",
    });
  }

  const hasMainRebarCount = subRebarCount > 0;
  const hasMainRebarDiameter = subRebarDiameter_Mm > 0;
  if (hasMainRebarCount !== hasMainRebarDiameter) {
    issues.push({ field: "geometry", message: "複鉄筋の径と本数は両方入力してください。" });
  }
  if (hasMainRebarCount && hasMainRebarDiameter && !isRebarKind(subRebarKind)) {
    issues.push({ field: "geometry", message: "複鉄筋の種類は異形棒鋼または丸鋼で指定してください。" });
  }

  const hasSideRebarCount = sideRebarCount > 0;
  const hasSideRebarDiameter = sideRebarDiameter_Mm > 0;
  if (!hasSideRebarCount || !hasSideRebarDiameter) {
    issues.push({ field: "geometry", message: "側鉄筋の径と本数を入力してください。" });
  } else if (!isRebarKind(sideRebarKind)) {
    issues.push({ field: "geometry", message: "側鉄筋の種類は異形棒鋼または丸鋼で指定してください。" });
  }
}
import type { FormState } from "@/forms/form-state";
import type { SectionForceMode } from "@/components/SectionForceModeSelector";

const SHARE_PARAM_KEYS = [
  "s",
  "fx",
  "fy",
  "fz",
  "mx",
  "my",
  "mz",
  "or",
  "ir",
  "rr",
  "rk",
  "rd",
  "rdd",
  "bc",
  "rsm",
  "rm",
  "ry",
  "cd",
  "yr",
] as const;

/** 正しい断面力モードの場合 true を返す */
function isSectionForceMode(value: string | null): value is SectionForceMode {
  return value === "3" || value === "6";
}

/** URL クエリへ値を設定する */
function setParam(params: URLSearchParams, key: string, value: string) {
  params.set(key, value);
}

/** パラメータが存在する場合 true を返す */
function hasShareParams(searchParams: URLSearchParams): boolean {
  return SHARE_PARAM_KEYS.some((key) => searchParams.has(key));
}

/** URL クエリをフォームへ反映する */
function applyShareParams(searchParams: URLSearchParams, rawForm: Record<string, unknown>): void {
  for (const [key, value] of searchParams.entries()) {
    switch (key) {
      // 断面力
      case "fx":
        rawForm.fx_KN = value;
        break;
      case "fy":
        rawForm.fy_KN = value;
        break;
      case "fz":
        rawForm.fz_KN = value;
        break;
      case "mx":
        rawForm.mx_KNm = value;
        break;
      case "my":
        rawForm.my_KNm = value;
        break;
      case "mz":
        rawForm.mz_KNm = value;
        break;
      // 断面形状
      case "or":
        rawForm.outerRadius_Mm = value;
        break;
      case "ir":
        rawForm.innerRadius_Mm = value;
        break;
      case "rr":
        rawForm.rebarRadius_Mm = value;
        break;
      case "rk":
        rawForm.rebarKind = value;
        break;
      case "rd":
        rawForm.rebarDiameter_Mm = value;
        break;
      case "rdd":
        rawForm.roundRebarDiameter_Mm = value;
        break;
      case "bc":
        rawForm.barCount = value;
        break;
      case "rsm":
        rawForm.rebarStrengthMode = value;
        break;
      case "rm":
        rawForm.rebarMaterialName = value;
        break;
      case "ry":
        rawForm.rebarYieldStrength_NPerMm2 = value;
        break;
      case "cd":
        rawForm.concreteDesignStrength_NPerMm2 = value;
        break;
      case "yr":
        rawForm.youngRatio = value;
        break;
      default:
        break;
    }
  }
}

/** URL からページ状態を復元する
 *  normalizeForm は rawForm を FormState に変換する関数を受け取る
 */
export function resolveAnnularSectionPageStateFromUrl(
  defaults: { form: FormState; sectionForceMode: SectionForceMode },
  normalizeForm: (rawForm: Record<string, unknown>) => FormState,
): { form: FormState; sectionForceMode: SectionForceMode } | null {
  if (typeof window === "undefined") {
    return null;
  }

  const searchParams = new URL(window.location.href).searchParams;

  if (!hasShareParams(searchParams)) {
    return null;
  }

  const rawForm: Record<string, unknown> = {
    ...defaults.form,
  };

  applyShareParams(searchParams, rawForm);

  const sectionForceModeValue = searchParams.get("s");

  return {
    form: normalizeForm(rawForm),
    sectionForceMode: isSectionForceMode(sectionForceModeValue)
      ? sectionForceModeValue
      : defaults.sectionForceMode,
  };
}

/** エクスポートする URL を生成する */
export function buildAnnularSectionShareUrl(form: FormState, sectionForceMode: SectionForceMode): string {
  if (typeof window === "undefined") {
    return "";
  }

  const url = new URL(window.location.href);
  const params = new URLSearchParams();

  setParam(params, "s", sectionForceMode);
  setParam(params, "fx", form.fx_KN);
  setParam(params, "fy", form.fy_KN);
  setParam(params, "fz", form.fz_KN);
  setParam(params, "mx", form.mx_KNm);
  setParam(params, "my", form.my_KNm);
  setParam(params, "mz", form.mz_KNm);
  setParam(params, "or", form.outerRadius_Mm);
  setParam(params, "ir", form.innerRadius_Mm);
  setParam(params, "rr", form.rebarRadius_Mm);
  setParam(params, "rk", form.rebarKind);
  setParam(params, "rd", form.rebarDiameter_Mm);
  setParam(params, "rdd", form.roundRebarDiameter_Mm);
  setParam(params, "bc", form.barCount);

  setParam(params, "rsm", form.rebarStrengthMode);
  setParam(params, "rm", form.rebarMaterialName);
  setParam(params, "ry", form.rebarYieldStrength_NPerMm2);
  setParam(params, "cd", form.concreteDesignStrength_NPerMm2);
  setParam(params, "yr", form.youngRatio);

  url.search = params.toString();
  url.hash = "";

  return url.toString();
}

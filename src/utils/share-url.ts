import type { FormState } from "@/forms/form-state";
import type { SectionForceMode } from "@/types/section-force-mode";
import { deflateRaw, inflateRaw } from "pako";

const SHARE_PARAM_VALUE = "v";

const FORM_FIELD_ORDER = [
  "fx_KN",
  "fy_KN",
  "fz_KN",
  "mx_KNm",
  "my_KNm",
  "mz_KNm",
  "outerRadius_Mm",
  "innerRadius_Mm",
  "rebarRadius_Mm",
  "rebarKind",
  "rebarDiameter_Mm",
  "roundRebarDiameter_Mm",
  "barCount",
  "rebarStrengthMode",
  "rebarMaterialName",
  "rebarYieldStrength_NPerMm2",
  "concreteDesignStrength_NPerMm2",
  "youngRatio",
] as const satisfies ReadonlyArray<keyof FormState>;

const PAYLOAD_LENGTH = FORM_FIELD_ORDER.length + 1;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
/** 正しい断面力モードの場合 true を返す */
function isSectionForceMode(value: string | null): value is SectionForceMode {
  return value === "3" || value === "6";
}

/** Uint8Array を Base64 へ変換する */
function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

/** Base64 文字列を Uint8Array へ変換する */
function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

/** Base64URL 文字列にする */
function toBase64Url(bytes: Uint8Array): string {
  return bytesToBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

/** Base64URL を Uint8Array に戻す */
function fromBase64Url(encoded: string): Uint8Array {
  const normalized = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const padding = (4 - (normalized.length % 4)) % 4;
  return base64ToBytes(normalized + "=".repeat(padding));
}

/** 共有URL用の圧縮文字列を生成する */
function encodeSharePayload(form: FormState, sectionForceMode: SectionForceMode): string {
  const payload = [sectionForceMode, ...FORM_FIELD_ORDER.map((fieldName) => form[fieldName])] as const;
  const compressed = deflateRaw(textEncoder.encode(JSON.stringify(payload)));
  return toBase64Url(compressed);
}

/** 圧縮文字列をフォーム状態へ戻す */
function decodeSharePayload(
  encodedValue: string,
): { rawForm: Record<string, unknown>; sectionForceMode: SectionForceMode } | null {
  try {
    const inflatedBytes = inflateRaw(fromBase64Url(encodedValue));
    const parsedValue = JSON.parse(textDecoder.decode(inflatedBytes)) as unknown;

    if (!Array.isArray(parsedValue) || parsedValue.length !== PAYLOAD_LENGTH) {
      return null;
    }

    const [sectionForceModeValue, ...formValues] = parsedValue;

    if (!isSectionForceMode(sectionForceModeValue)) {
      return null;
    }

    if (!formValues.every((value) => typeof value === "string")) {
      return null;
    }

    const rawForm: Record<string, unknown> = {};

    FORM_FIELD_ORDER.forEach((fieldName, index) => {
      rawForm[fieldName] = formValues[index];
    });

    return {
      rawForm,
      sectionForceMode: sectionForceModeValue,
    };
  } catch {
    return null;
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
  const encodedValue = searchParams.get(SHARE_PARAM_VALUE);

  if (!encodedValue) {
    return null;
  }

  const decodedPayload = decodeSharePayload(encodedValue);

  if (!decodedPayload) {
    return null;
  }

  return {
    form: normalizeForm({ ...defaults.form, ...decodedPayload.rawForm }),
    sectionForceMode: decodedPayload.sectionForceMode,
  };
}

/** エクスポートする URL を生成する */
export function buildAnnularSectionShareUrl(form: FormState, sectionForceMode: SectionForceMode): string {
  if (typeof window === "undefined") {
    return "";
  }

  const url = new URL(window.location.href);
  const params = new URLSearchParams({
    [SHARE_PARAM_VALUE]: encodeSharePayload(form, sectionForceMode),
  });

  url.search = params.toString();
  url.hash = "";

  return url.toString();
}

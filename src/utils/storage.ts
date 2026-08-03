import type { FormState } from "@/forms/form-state";
import type { SectionForceMode } from "@/types/section-force-mode";

/** ローカルストレージからページ状態を読み込む */
export function loadAnnularSectionPageStateFromStorage(
  storageKey: string,
  defaults: { form: FormState; sectionForceMode: SectionForceMode },
  normalizeStoredValue: (value: unknown) => { form: FormState; sectionForceMode: SectionForceMode } | null,
): { form: FormState; sectionForceMode: SectionForceMode } {
  if (typeof window === "undefined") {
    return defaults;
  }

  try {
    const storedValue = window.localStorage.getItem(storageKey);

    if (!storedValue) {
      return defaults;
    }

    const parsedValue = JSON.parse(storedValue) as unknown;
    return normalizeStoredValue(parsedValue) ?? defaults;
  } catch {
    return defaults;
  }
}

/** ページ状態をローカルストレージへ保存する */
export function saveAnnularSectionPageStateToStorage(
  storageKey: string,
  form: FormState,
  sectionForceMode: SectionForceMode,
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(storageKey, JSON.stringify({ form, sectionForceMode }));
  } catch {
    // 保存に失敗しても計算処理は継続する
  }
}

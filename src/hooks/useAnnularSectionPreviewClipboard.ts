import { useState } from "react";
import type { FormState } from "@/forms/form-state";
import type { AnnularSectionResult } from "@/model/annular-section";
import type { SectionForceMode } from "@/components/SectionForceModeSelector";
import {
  buildClipboardText,
  buildInputPreviewSections,
  buildResultPreviewSections,
} from "@/utils/print-preview-data";
import { copyTextToClipboard } from "@/utils/clipboard";

type UseAnnularSectionPreviewClipboardParams = {
  form: FormState;
  sectionForceMode: SectionForceMode;
  result: AnnularSectionResult | null;
};

/** 断面プレビューのクリップボードコピー機能を提供するカスタムフック */
export function useAnnularSectionPreviewClipboard({
  form,
  sectionForceMode,
  result,
}: UseAnnularSectionPreviewClipboardParams) {
  const [copyError, setCopyError] = useState<string | null>(null);
  const canCopy = result !== null;

  const handleCopy = async () => {
    if (!canCopy) {
      return;
    }

    try {
      setCopyError(null);
      const text = buildClipboardText([
        {
          title: "入力値",
          header: "区分\t項目\t記号\t単位\t入力値",
          sections: buildInputPreviewSections(form, sectionForceMode),
        },
        {
          title: "計算結果",
          header: "区分\t項目\t記号\t単位\t計算値",
          sections: buildResultPreviewSections(result),
        },
      ]);

      await copyTextToClipboard(text);
    } catch {
      setCopyError("クリップボードへのコピーに失敗しました。");
    }
  };

  return {
    canCopy,
    copyError,
    handleCopy,
  };
}

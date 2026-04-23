import { Dialog, DialogPanel } from "@headlessui/react";
import { useRef } from "react";
import type { AnnularSectionResult } from "@/model/annular-section";
import type { FormState } from "@/forms/form-state";
import { AppButton } from "@/components/AppButton";
import { SymbolText } from "@/components/SymbolText";
import { Toast } from "@/components/Toast";
import { type SectionForceMode } from "@/components/SectionForceModeSelector";
import {
  buildInputPreviewSections,
  buildResultPreviewSections,
  type PrintPreviewSection,
} from "@/utils/print-preview-data";
import { printElementContent } from "@/utils/print-preview-frame";
import { FiPrinter, FiX } from "react-icons/fi";
import { cn } from "@/utils/cn";
import { useAnnularSectionPreviewClipboard } from "@/hooks/useAnnularSectionPreviewClipboard";
import { useTransientToast } from "@/hooks/useTransientToast";
import { LuClipboardCopy } from "react-icons/lu";

type PrintPreviewModalProps = {
  /** モーダルの開閉状態 */
  open: boolean;
  /** フォームの状態 */
  form: FormState;
  /** 断面力モード */
  sectionForceMode: SectionForceMode;
  /** 計算結果 */
  result: AnnularSectionResult | null;
  /** モーダルを閉じるためのハンドラ */
  onClose: () => void;
};

type PreviewTableProps = {
  title: string;
  sections: PrintPreviewSection[];
  valueHeader: string;
  includeSectionLabel: boolean;
};

/** 項目と値のテーブルを表示するコンポーネント */
function PreviewTable({ title, sections, valueHeader, includeSectionLabel }: PreviewTableProps) {
  return (
    <section>
      <h5 className="mb-2">{title}</h5>

      <div className="max-w-full overflow-x-auto">
        <table className="w-lg border-collapse border-2 border-slate-600 text-sm print:text-[12px]">
          <thead>
            <tr className="bg-slate-200">
              <th
                colSpan={includeSectionLabel ? 2 : 1}
                className="border border-slate-600 px-1 py-0.5 text-center font-semibold"
                scope="col"
              >
                項目
              </th>
              <th className="w-12 border border-slate-600 px-1 py-0.5 text-center font-semibold" scope="col">
                記号
              </th>
              <th className="w-18 border border-slate-600 px-1 py-0.5 text-center font-semibold" scope="col">
                単位
              </th>
              <th className="w-24 border border-slate-600 px-1 py-0.5 text-center font-semibold" scope="col">
                {valueHeader}
              </th>
            </tr>
          </thead>
          <tbody>
            {sections.map((section) =>
              section.rows.map((row, rowIndex) => (
                <tr key={`${section.title}-${row.symbol}`} className="border border-slate-600">
                  {includeSectionLabel && rowIndex === 0 ? (
                    <td
                      rowSpan={section.rows.length}
                      className="border border-slate-600 bg-slate-50 text-center align-middle"
                      style={{ writingMode: "vertical-rl", textOrientation: "upright" }}
                    >
                      {section.title}
                    </td>
                  ) : null}
                  <td className="border border-slate-600 px-1 py-0.5 font-mono">{row.label}</td>
                  <td className="border border-slate-600 px-1 py-0.5 text-center font-mono">
                    <SymbolText value={row.symbol} />
                  </td>
                  <td className="border border-slate-600 px-1 py-0.5 text-center font-mono">{row.unit}</td>
                  <td className="border border-slate-600 px-1 py-0.5 text-right font-mono">{row.value}</td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/** 印刷プレビュー用モーダルを表示するコンポーネント */
export function PrintPreviewModal({ open, form, sectionForceMode, result, onClose }: PrintPreviewModalProps) {
  const { message: toastMessage, isVisible: toastIsVisible, showToast } = useTransientToast();
  const { canCopy, copyError, handleCopy } = useAnnularSectionPreviewClipboard({
    form,
    sectionForceMode,
    result,
    onCopySuccess: () => showToast("クリップボードにコピーしました。"),
  });
  const printContentRef = useRef<HTMLDivElement | null>(null);
  const inputSections = buildInputPreviewSections(form, sectionForceMode);
  const resultSections = buildResultPreviewSections(result);

  // 印刷ボタンのクリックハンドラー
  const handlePrint = async () => {
    const printRoot = printContentRef.current;

    if (!printRoot) {
      window.print();
      return;
    }

    try {
      await printElementContent(printRoot);
    } catch {
      window.print();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50 print:static print:z-auto">
      <div className="fixed inset-0 bg-slate-950/60 print:hidden" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center sm:p-4 print:static print:block print:p-0">
        <DialogPanel
          className={cn(
            "flex max-h-svh flex-col overflow-hidden bg-slate-100 shadow-2xl sm:max-h-[calc(100vh-2rem)] sm:max-w-5xl sm:rounded-sm",
            "print:max-h-none print:max-w-none print:overflow-visible print:rounded-none print:bg-white print:shadow-none",
          )}
        >
          <div className="flex flex-col gap-3 p-4 print:hidden">
            <div className="flex flex-row items-center gap-2">
              <div className="flex flex-row gap-2">
                <AppButton icon={FiPrinter} onClick={handlePrint} className="text-blue-700">
                  印刷
                </AppButton>
                <AppButton icon={LuClipboardCopy} onClick={handleCopy} disabled={!canCopy}>
                  <span className="sm:hidden">コピー</span>
                  <span className="hidden sm:inline">クリップボードにコピー</span>
                </AppButton>
              </div>

              <div className="ml-auto flex flex-row items-center">
                <AppButton aria-label="閉じる" onClick={onClose} className="w-9 px-0">
                  <FiX className="h-6 w-6" aria-hidden="true" />
                </AppButton>
              </div>
            </div>
            {copyError ? <p className="text-sm text-rose-600">{copyError}</p> : null}
          </div>

          {toastMessage ? <Toast message={toastMessage} isVisible={toastIsVisible} /> : null}

          <div className="overflow-auto p-4 pt-0 print:overflow-visible print:p-0">
            <div
              ref={printContentRef}
              className={cn(
                "rounded-sm bg-white p-8 shadow-sm",
                "print:rounded-none print:p-0 print:shadow-none",
              )}
            >
              <h4 className="mb-4 text-center text-xl font-semibold">RC断面計算【円環断面】</h4>
              <PreviewTable
                title="入力値"
                sections={inputSections}
                valueHeader="入力値"
                includeSectionLabel
              />

              <div className="h-8" />

              <PreviewTable
                title="計算結果"
                sections={resultSections}
                valueHeader="計算値"
                includeSectionLabel={false}
              />
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

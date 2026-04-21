import { Dialog, DialogPanel } from "@headlessui/react";
import { useRef } from "react";
import type { AnnularSectionResult } from "@/model/annular-section";
import type { FormState } from "@/forms/form-state";
import { AppButton } from "@/components/AppButton";
import { SymbolText } from "@/components/SymbolText";
import { type SectionForceMode } from "@/components/SectionForceModeSelector";
import {
  buildInputPreviewSections,
  buildResultPreviewSections,
  type PrintPreviewSection,
} from "@/utils/print-preview-data";
import { FiClipboard, FiPrinter, FiX } from "react-icons/fi";
import { cn } from "@/utils/cn";
import { useAnnularSectionPreviewClipboard } from "@/hooks/useAnnularSectionPreviewClipboard";

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
      <h5 className="mb-2 text-lg font-semibold">{title}</h5>

      <div className="max-w-full overflow-x-auto">
        <table className="w-lg border-collapse border-2 border-slate-600">
          <thead>
            <tr className="bg-slate-200">
              <th
                colSpan={includeSectionLabel ? 2 : 1}
                className="border border-slate-600 px-1 py-1 text-center font-semibold"
                scope="col"
              >
                項目
              </th>
              <th className="w-12 border border-slate-600 px-1 py-1 text-center font-semibold" scope="col">
                記号
              </th>
              <th className="w-18 border border-slate-600 px-1 py-1 text-center font-semibold" scope="col">
                単位
              </th>
              <th className="w-24 border border-slate-600 px-1 py-1 text-center font-semibold" scope="col">
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
                  <td className="border border-slate-600 px-1 py-1 font-mono">{row.label}</td>
                  <td className="border border-slate-600 px-1 py-1 text-center font-mono">
                    <SymbolText value={row.symbol} />
                  </td>
                  <td className="border border-slate-600 px-1 py-1 text-center font-mono">{row.unit}</td>
                  <td className="border border-slate-600 px-1 py-1 text-right font-mono">{row.value}</td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/**
 * 元の文書からスタイル要素を印刷用ドキュメントへ複製する
 *
 * 外部CSSの読み込み完了も待ってから印刷に進む
 */
async function copyStylesToDocument(targetDocument: Document): Promise<void> {
  const styleNodes = document.querySelectorAll('style, link[rel="stylesheet"]');
  const pendingLoads: Promise<void>[] = [];

  styleNodes.forEach((node) => {
    const clonedNode = node.cloneNode(true);

    if (clonedNode instanceof HTMLLinkElement) {
      pendingLoads.push(
        new Promise((resolve) => {
          clonedNode.addEventListener("load", () => resolve(), { once: true });
          clonedNode.addEventListener("error", () => resolve(), { once: true });
        }),
      );
    }

    targetDocument.head.appendChild(clonedNode);
  });

  await Promise.all(pendingLoads);
}

/**
 * 指定した要素の内容を印刷用の `iframe` に描画して印刷する
 *
 * 選択範囲が対象要素内にある場合は、その範囲のみを優先して印刷する
 */
async function printElementContent(sourceElement: HTMLElement): Promise<void> {
  const selection = window.getSelection();
  const hasSelection = Boolean(selection && !selection.isCollapsed && selection.rangeCount > 0);
  const iframe = document.createElement("iframe");

  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.opacity = "0";
  iframe.srcdoc =
    "<!doctype html><html><head><title>印刷用テーブル</title><style>html,body{margin:0;padding:0}body{display:flex;flex-direction:column;align-items:center;}</style></head><body></body></html>";
  document.body.appendChild(iframe);

  await new Promise<void>((resolve) => {
    iframe.addEventListener("load", () => resolve(), { once: true });
  });

  const frameDocument = iframe.contentDocument;

  if (!frameDocument) {
    iframe.remove();
    throw new Error("印刷用ドキュメントを作成できませんでした。");
  }

  await copyStylesToDocument(frameDocument);

  const content = frameDocument.createElement("div");
  content.className = "p-8";

  if (hasSelection && selection) {
    const range = selection.getRangeAt(0);

    if (sourceElement.contains(range.commonAncestorContainer)) {
      content.appendChild(range.cloneContents());
    } else {
      content.appendChild(sourceElement.cloneNode(true));
    }
  } else {
    content.appendChild(sourceElement.cloneNode(true));
  }

  frameDocument.body.appendChild(content);

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

  const frameWindow = iframe.contentWindow;

  if (!frameWindow) {
    iframe.remove();
    throw new Error("印刷用ウィンドウを取得できませんでした。");
  }

  frameWindow.focus();
  frameWindow.print();
  iframe.remove();
}

/** 印刷プレビュー用モーダルを表示するコンポーネント */
export function PrintPreviewModal({ open, form, sectionForceMode, result, onClose }: PrintPreviewModalProps) {
  const { canCopy, copyError, handleCopy } = useAnnularSectionPreviewClipboard({
    form,
    sectionForceMode,
    result,
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
                <AppButton icon={FiPrinter} onClick={handlePrint}>
                  印刷
                </AppButton>
                <AppButton icon={FiClipboard} onClick={handleCopy} disabled={!canCopy}>
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

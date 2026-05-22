import { AnnularSectionInputFormPanel } from "@/components/InputForm";
import { Header } from "@/components/Header";
import { MenuBar } from "@/components/MenuBar";
import { PrintPreviewContent } from "@/components/PrintPreviewContent";
import { AnnularSectionPreviewPanel } from "@/components/SectionPreviewPanel";
import { AnnularSectionResultPanel } from "@/components/ResultPanel";
import { PrintPreviewModal } from "@/components/PrintPreviewModal";
import { useAnnularSectionPageState } from "@/hooks/usePageState";
import { useAnnularSectionPreviewClipboard } from "@/hooks/useAnnularSectionPreviewClipboard";
import { Toast } from "@/components/Toast";
import { buildAnnularSectionShareUrl } from "@/utils/annular-section-page-state";
import { printElementContent } from "@/utils/print-preview-frame";
import { copyTextToClipboard } from "@/utils/clipboard";
import { useRef, useState } from "react";
import { useTransientToast } from "@/hooks/useTransientToast";

function App() {
  const printPreviewContentRef = useRef<HTMLDivElement | null>(null);
  const { message: toastMessage, isVisible: toastIsVisible, showToast } = useTransientToast();
  const [shareUrlError, setShareUrlError] = useState<string | null>(null);
  const {
    form,
    committedForm,
    result,
    issues,
    isPrintPreviewOpen,
    sectionForceMode,
    handleSubmit,
    handleReset,
    updateField,
    commitField,
    updateSectionForceMode,
    openPrintPreview,
    closePrintPreview,
  } = useAnnularSectionPageState();
  const { canCopy, copyError, handleCopy } = useAnnularSectionPreviewClipboard({
    form: committedForm,
    sectionForceMode,
    result,
    onCopySuccess: () => showToast("クリップボードにコピーしました。"),
  });

  /** URL をコピーするハンドラー */
  const handleCopyShareUrl = async () => {
    try {
      setShareUrlError(null);
      const shareUrl = buildAnnularSectionShareUrl(form, sectionForceMode);
      await copyTextToClipboard(shareUrl);
      showToast("URLをコピーしました。");
    } catch {
      setShareUrlError("URLのコピーに失敗しました。");
    }
  };

  const handlePrint = async () => {
    const printRoot = printPreviewContentRef.current;

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
    <div className="min-h-screen bg-slate-100">
      <Header />
      <MenuBar
        onPrint={handlePrint}
        onOpenPrintPreview={openPrintPreview}
        onCopyClipboard={handleCopy}
        onCopyShareUrl={handleCopyShareUrl}
        canCopy={canCopy}
        copyError={copyError}
        shareUrlError={shareUrlError}
        isPrintPreviewEnabled={result !== null}
      />

      {/* 印刷プレビュー */}
      <div aria-hidden="true" className="fixed top-0 -left-2500 h-0 w-0 overflow-hidden">
        <PrintPreviewContent
          ref={printPreviewContentRef}
          form={committedForm}
          sectionForceMode={sectionForceMode}
          result={result}
        />
      </div>

      {toastMessage ? <Toast message={toastMessage} isVisible={toastIsVisible} /> : null}

      <main className="flex w-full">
        <div className="m-4 columns-1 gap-2 min-[810px]:columns-2 min-[1210px]:columns-3">
          {/* 入力フォームパネル */}
          <AnnularSectionInputFormPanel
            form={form}
            issues={issues}
            onSubmit={handleSubmit}
            onReset={handleReset}
            onChangeField={updateField}
            onCommitField={commitField}
            sectionForceMode={sectionForceMode}
            onChangeSectionForceMode={updateSectionForceMode}
          />
          {/* 結果表示パネル */}
          <AnnularSectionResultPanel result={result} />
          {/* 断面図プレビュー */}
          <AnnularSectionPreviewPanel form={committedForm} result={result} />
        </div>
      </main>

      <PrintPreviewModal
        open={isPrintPreviewOpen}
        form={committedForm}
        sectionForceMode={sectionForceMode}
        result={result}
        onClose={closePrintPreview}
      />
    </div>
  );
}

export default App;

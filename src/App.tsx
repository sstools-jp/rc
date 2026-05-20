import { AnnularSectionInputFormPanel } from "@/components/InputForm";
import { Header } from "@/components/Header";
import { MenuBar } from "@/components/MenuBar";
import { PrintPreviewContent } from "@/components/PrintPreviewContent";
import { AnnularSectionResultPanel } from "@/components/ResultPanel";
import { PrintPreviewModal } from "@/components/PrintPreviewModal";
import { useAnnularSectionPageState } from "@/hooks/usePageState";
import { useAnnularSectionPreviewClipboard } from "@/hooks/useAnnularSectionPreviewClipboard";
import { Toast } from "@/components/Toast";
import { printElementContent } from "@/utils/print-preview-frame";
import { useRef } from "react";
import { useTransientToast } from "@/hooks/useTransientToast";

function App() {
  const printPreviewContentRef = useRef<HTMLDivElement | null>(null);
  const { message: toastMessage, isVisible: toastIsVisible, showToast } = useTransientToast();
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
        canCopy={canCopy}
        copyError={copyError}
        isPrintPreviewEnabled={result !== null}
      />

      <div aria-hidden="true" className="fixed top-0 left-[-10000px] h-0 w-0 overflow-hidden">
        <PrintPreviewContent
          ref={printPreviewContentRef}
          form={committedForm}
          sectionForceMode={sectionForceMode}
          result={result}
        />
      </div>

      {toastMessage ? <Toast message={toastMessage} isVisible={toastIsVisible} /> : null}

      <main className="mx-auto flex w-full flex-wrap items-start justify-center gap-6 px-4 pt-6 pb-8">
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
        <AnnularSectionResultPanel form={committedForm} result={result} />
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

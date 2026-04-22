import { AnnularSectionInputFormPanel } from "@/components/InputForm";
import { AnnularSectionResultPanel } from "@/components/ResultPanel";
import { PrintPreviewModal } from "@/components/PrintPreviewModal";
import { useAnnularSectionPageState } from "@/hooks/usePageState";
import { FaGithub } from "react-icons/fa";

function App() {
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

  return (
    <div className="min-h-screen bg-slate-100">
      {/* ヘッダー */}
      <header className="overflow-hidden border-b border-slate-300 bg-white px-4 pt-3 pb-1">
        <div className="flex items-end justify-between gap-4 sm:items-center">
          <h1 className="flex flex-col gap-1 text-xl sm:flex-row sm:items-end">
            RC断面計算【円環断面】
            <small className="pb-1 font-mono text-xs text-slate-500">ver {__APP_VERSION__}</small>
          </h1>
          <div className="flex flex-col items-end gap-1 max-sm:pb-1">
            <a
              href="https://github.com/sstools-jp/rc"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-slate-900"
            >
              <FaGithub className="h-5 w-5" aria-hidden="true" />
              sstools-jp/rc
            </a>
          </div>
        </div>
      </header>

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
        <AnnularSectionResultPanel
          form={committedForm}
          sectionForceMode={sectionForceMode}
          result={result}
          onOpenPrintPreview={openPrintPreview}
        />
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

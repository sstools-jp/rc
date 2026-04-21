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
    statusMessage,
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

      <main className="mx-auto flex w-full flex-wrap items-start justify-center gap-6 px-4 pt-6 pb-16">
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

      <StatusBar message={statusMessage} />
    </div>
  );
}

type StatusBarProps = {
  message: string;
};

/**
 * ステータスバーコンポーネント
 */
function StatusBar({ message }: StatusBarProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white px-4 py-3 shadow-md sm:px-6 lg:px-8"
    >
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3">
        <span aria-hidden="true" className="inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
        <p className="text-sm text-slate-700">{message}</p>
      </div>
    </div>
  );
}

export default App;

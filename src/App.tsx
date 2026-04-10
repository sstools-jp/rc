import { AnnularSectionInputFormPanel } from "@/components/InputForm";
import { AnnularSectionResultPanel } from "@/components/ResultPanel";
import { PrintPreviewModal } from "@/components/PrintPreviewModal";
import { useAnnularSectionPageState } from "@/hooks/usePageState";
import { FaGithub } from "react-icons/fa";

function App() {
  const {
    form,
    result,
    issues,
    statusMessage,
    isPrintPreviewOpen,
    handleSubmit,
    handleReset,
    updateField,
    openPrintPreview,
    closePrintPreview,
  } = useAnnularSectionPageState();

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 pt-6 pb-24 sm:px-6 lg:px-8 lg:pt-8 lg:pb-28">
        <header className="overflow-hidden border border-slate-200 bg-white px-6 py-6">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl">RC断面計算【円環断面】</h1>
            <div className="flex flex-col items-end gap-1">
              <a
                href="https://github.com/sstools-jp/rc"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-slate-900"
              >
                <FaGithub className="h-4 w-4" aria-hidden="true" />
                sstools-jp/rc
              </a>
              <p className="text-sm text-slate-500">ver {__APP_VERSION__}</p>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
          {/* 入力フォームパネル */}
          <AnnularSectionInputFormPanel
            form={form}
            issues={issues}
            onSubmit={handleSubmit}
            onReset={handleReset}
            onChangeField={updateField}
          />

          {/* 結果表示パネル */}
          <AnnularSectionResultPanel result={result} onOpenPrintPreview={openPrintPreview} />
        </section>
      </main>

      <PrintPreviewModal open={isPrintPreviewOpen} form={form} result={result} onClose={closePrintPreview} />

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

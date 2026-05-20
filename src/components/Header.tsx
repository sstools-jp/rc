import { FaGithub } from "react-icons/fa";

/** 上部ヘッダー */
export function Header() {
  return (
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
  );
}

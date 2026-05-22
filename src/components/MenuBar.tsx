import { AppButton } from "@/components/AppButton";
import { LuClipboardCopy, LuFileSearch, LuLink, LuPrinter } from "react-icons/lu";

type MenuBarProps = {
  onPrint: () => void;
  onOpenPrintPreview: () => void;
  onCopyClipboard: () => void;
  onCopyShareUrl: () => void;
  canCopy: boolean;
  copyError: string | null;
  shareUrlError: string | null;
  isPrintPreviewEnabled: boolean;
};

/** 上部メニューバー */
export function MenuBar({
  onPrint,
  onOpenPrintPreview,
  onCopyClipboard,
  onCopyShareUrl,
  canCopy,
  copyError,
  shareUrlError,
  isPrintPreviewEnabled,
}: MenuBarProps) {
  return (
    <nav className="flex flex-wrap items-center gap-1 border-b border-slate-300 bg-white px-4 py-1">
      <AppButton
        icon={LuPrinter}
        onClick={onPrint}
        disabled={!isPrintPreviewEnabled}
        className="text-blue-700"
      >
        印刷
      </AppButton>
      <AppButton
        icon={LuFileSearch}
        onClick={onOpenPrintPreview}
        disabled={!isPrintPreviewEnabled}
        className="text-blue-700"
      >
        印刷プレビュー
      </AppButton>
      <AppButton icon={LuClipboardCopy} onClick={onCopyClipboard} disabled={!canCopy}>
        計算結果をコピー
      </AppButton>
      <AppButton icon={LuLink} onClick={onCopyShareUrl}>
        URLをコピー
      </AppButton>
      {copyError ? <p className="text-sm text-rose-600">{copyError}</p> : null}
      {shareUrlError ? <p className="text-sm text-rose-600">{shareUrlError}</p> : null}
    </nav>
  );
}

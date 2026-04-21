/**
 * クリップボードにテキストをコピーするユーティリティ関数
 *
 * ブラウザのClipboard APIが利用可能な場合はそれを使用し、そうでない場合はフォールバックとしてテキストエリアを使用する
 */
export async function copyTextToClipboard(text: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  if (typeof document === "undefined") {
    throw new Error("クリップボードにアクセスできません。");
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "0";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();

  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);

  if (!copied) {
    throw new Error("クリップボードへのコピーに失敗しました。");
  }
}

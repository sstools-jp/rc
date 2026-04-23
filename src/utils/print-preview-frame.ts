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
export async function printElementContent(sourceElement: HTMLElement): Promise<void> {
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

  try {
    await new Promise<void>((resolve) => {
      iframe.addEventListener("load", () => resolve(), { once: true });
    });

    const frameDocument = iframe.contentDocument;

    if (!frameDocument) {
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
      throw new Error("印刷用ウィンドウを取得できませんでした。");
    }

    frameWindow.focus();
    frameWindow.print();
  } finally {
    iframe.remove();
  }
}

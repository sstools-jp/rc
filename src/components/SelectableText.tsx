import React, { useRef } from "react";
import { cn } from "@/utils/cn";

interface Props {
  children: React.ReactNode;
  className?: string;
}

/** クリックでテキスト全選択可能なコンポーネント */
export const SelectableText: React.FC<Props> = ({ children, className }) => {
  const spanRef = useRef<HTMLSpanElement>(null);

  const handleSelect = () => {
    const selection = window.getSelection();
    const range = document.createRange();

    if (!spanRef.current || !selection) return;

    range.selectNodeContents(spanRef.current);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  return (
    <span
      ref={spanRef}
      onClick={handleSelect}
      // select-all を指定しておくと、トリプルクリックなど標準の挙動も補強される
      className={cn("inline-block select-all", className)}
    >
      {children}
    </span>
  );
};

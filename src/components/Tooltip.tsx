import { Popover } from "@base-ui/react";
import React, { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import styles from "@/components/Tooltip.module.css";

export interface TooltipContent {
  title?: string;
  line: string;
  nestedLine?: string | TooltipContent;
}

interface TooltipProps {
  content?: string | TooltipContent;
  delay?: number;
  children: React.ReactNode;
}

export function Tooltip({ content, delay = 200, children }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const openTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // マウスが入った時の処理（表示遅延）
  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);

    openTimeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, delay);
  };

  // マウスが離れた時の処理（非表示遅延 / 猶予時間）
  const handleMouseLeave = () => {
    if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);

    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 300);
  };

  // クリック時の処理（トグル）
  const handleClick = () => {
    // 誤動作防止のためタイマーをクリア
    if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);

    setIsOpen((prev) => !prev);
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger
        className="cursor-help rounded bg-transparent px-0.5 mix-blend-multiply hover:bg-slate-200"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {children}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="top" align="start" sideOffset={8}>
          <Popover.Popup
            className="relative box-border flex flex-col rounded-sm border border-gray-500 bg-white p-2 leading-5 shadow-lg"
            onMouseEnter={handleMouseEnter} // ポップアップ上にマウスがある間は消さない
            onMouseLeave={handleMouseLeave}
          >
            <Popover.Arrow className={styles.Arrow} />
            {/* nestedLine が存在する場合、再帰的に Tooltip を表示 */}
            {content && typeof content !== "string" && content.nestedLine && (
              <Tooltip content={content.nestedLine}>
                <MarkdownContent content={content.line} />
              </Tooltip>
            )}
            {(!content || typeof content === "string" || !content.nestedLine) && (
              <MarkdownContent content={content} />
            )}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

const MarkdownContent: React.FC<{ content?: string | TooltipContent }> = ({ content }) => {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
      {typeof content === "string" ? content : content?.line}
    </ReactMarkdown>
  );
};

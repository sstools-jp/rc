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
  nestedLines?: Array<string | TooltipContent>;
}

interface TooltipProps {
  content?: string | TooltipContent | Array<string | TooltipContent>;
  delay?: number;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  alignOffset?: number;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function Tooltip({
  content,
  delay = 200,
  children,
  side = "top",
  align = "start",
  sideOffset = 8,
  alignOffset = -9,
  onMouseEnter,
  onMouseLeave,
}: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const openTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // マウスが入った時の処理（表示遅延）
  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    onMouseEnter?.();

    openTimeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, delay);
  };

  // マウスが離れた時の処理（非表示遅延）
  const handleMouseLeave = () => {
    if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
    onMouseLeave?.();

    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  // クリック時の処理（トグル）
  const handleClick = () => {
    // タイマーをクリア
    if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);

    setIsOpen((prev) => !prev);
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger
        className="cursor-help rounded border-0 bg-transparent px-0.5 mix-blend-multiply hover:bg-slate-100"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {children}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner
          side={side}
          align={align}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          className="z-50"
        >
          <Popover.Popup
            className="relative box-border flex max-w-full flex-col rounded-sm border border-gray-500 bg-white p-2 leading-5 shadow-lg"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <Popover.Arrow className={styles.Arrow} />
            {content && (
              <TooltipContentRenderer
                content={content}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              />
            )}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

const TooltipContentRenderer: React.FC<{
  content: string | TooltipContent | Array<string | TooltipContent>;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}> = ({ content, onMouseEnter, onMouseLeave }) => {
  if (Array.isArray(content)) {
    return (
      <div className="flex flex-col gap-2">
        {content.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <hr className="my-1 border-slate-200" />}
            <TooltipContentRenderer
              content={item}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
            />
          </React.Fragment>
        ))}
      </div>
    );
  }

  if (typeof content === "string") {
    return <MarkdownContent content={content} />;
  }

  if (content.nestedLines && content.nestedLines.length > 0) {
    return (
      <Tooltip
        content={content.nestedLines}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <MarkdownContent content={content.line} />
      </Tooltip>
    );
  }

  return <MarkdownContent content={content.line} />;
};

const MarkdownContent: React.FC<{ content?: string | TooltipContent }> = ({ content }) => {
  return (
    <div className="text-left text-sm">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
        {typeof content === "string" ? content : content?.line}
      </ReactMarkdown>
    </div>
  );
};

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export type TooltipPosition = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
  /** ツールチップの内容 (Markdownでレンダリング) */
  content: string;
  children: React.ReactNode;
  /** 表示位置 */
  position?: TooltipPosition;
  /** 遅延時間 [ms] */
  delay?: number;
  className?: string;
}

/** ツールチップコンポーネント */
export function Tooltip({ content, children, position = "top", delay = 200, className }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const wrapperRef = useRef<HTMLSpanElement | null>(null);
  const tipRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const show = () => {
    clearTimer();
    timerRef.current = window.setTimeout(() => setVisible(true), delay);
  };
  const hide = () => {
    clearTimer();
    setVisible(false);
  };

  useEffect(() => {
    if (!visible) return;

    // ツールチップの位置を計算して画面内に収まるように調整
    const computePositionLocal = () => {
      const wrap = wrapperRef.current;
      const tip = tipRef.current;
      if (!wrap || !tip) return;
      const wrapRect = wrap.getBoundingClientRect();
      const tipRect = tip.getBoundingClientRect();
      const padding = 8;
      const scrollX = window.scrollX || window.pageXOffset;
      const scrollY = window.scrollY || window.pageYOffset;
      let top = 0;
      let left = 0;
      switch (position) {
        case "top":
          top = wrapRect.top + scrollY - tipRect.height - padding;
          left = wrapRect.left + scrollX + (wrapRect.width - tipRect.width) / 2;
          break;
        case "bottom":
          top = wrapRect.bottom + scrollY + padding;
          left = wrapRect.left + scrollX + (wrapRect.width - tipRect.width) / 2;
          break;
        case "left":
          top = wrapRect.top + scrollY + (wrapRect.height - tipRect.height) / 2;
          left = wrapRect.left + scrollX - tipRect.width - padding;
          break;
        case "right":
          top = wrapRect.top + scrollY + (wrapRect.height - tipRect.height) / 2;
          left = wrapRect.right + scrollX + padding;
          break;
      }

      // 横方向は画面外に出ないように調整
      const minLeft = scrollX + padding;
      const maxLeft =
        scrollX + (window.innerWidth || document.documentElement.clientWidth) - tipRect.width - padding;
      left = Math.min(Math.max(left, minLeft), maxLeft);

      // 縦方向は画面外に出ないように調整
      const minTop = scrollY + padding;
      const maxTop =
        scrollY + (window.innerHeight || document.documentElement.clientHeight) - tipRect.height - padding;
      top = Math.min(Math.max(top, minTop), maxTop);

      // 座標を丸めて保存
      setCoords({ top: Math.round(top), left: Math.round(left) });
    };

    computePositionLocal();
    const onResize = () => computePositionLocal();
    const onScroll = () => computePositionLocal();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [visible, position, content]);

  useEffect(() => {
    return () => clearTimer();
  }, []);

  return (
    <>
      <span
        ref={wrapperRef}
        className={cn("inline-block", className)}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        tabIndex={0}
      >
        {children}
      </span>

      {visible && (
        <div
          ref={tipRef}
          role="tooltip"
          aria-hidden={!visible}
          style={{ top: coords ? coords.top : 0, left: coords ? coords.left : 0 }}
          className="pointer-events-none absolute z-50 transition-opacity duration-150"
        >
          <div className="rounded-sm bg-black/75 p-2 text-sm text-white shadow-lg backdrop-blur-sm sm:max-w-120 md:text-base">
            <div className="tooltip-markdown prose prose-invert">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                {content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

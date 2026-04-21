import { Button } from "@headlessui/react";
import clsx from "clsx";
import type { ComponentPropsWithoutRef, ComponentType, ReactNode } from "react";

type AppButtonVariant = "primary" | "secondary";
type AppButtonSize = "md" | "sm";

type AppButtonProps = Omit<ComponentPropsWithoutRef<typeof Button>, "className" | "children"> & {
  /** ボタンのスタイル */
  variant?: AppButtonVariant;
  /** ボタンのサイズ */
  size?: AppButtonSize;
  /** ボタン左側に表示するアイコン */
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  className?: string;
  children: ReactNode;
};

/** ボタン種類毎のスタイルを定義 */
const variantClassNames: Record<AppButtonVariant, string> = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-500 disabled:text-white/70",
  secondary:
    "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400",
};

/** サイズ毎のスタイルを定義 */
const sizeClassNames: Record<AppButtonSize, string> = {
  md: "min-h-8 px-5 text-sm",
  sm: "min-h-9 px-4 text-sm",
};

/**
 * ボタンコンポーネント
 */
export function AppButton({
  type = "button",
  variant = "secondary",
  size = "sm",
  icon: Icon,
  className,
  children,
  ...props
}: AppButtonProps) {
  return (
    <Button
      type={type}
      {...props}
      className={clsx(
        "group inline-flex items-center justify-center gap-1.5 rounded-xs transition-colors",
        sizeClassNames[size],
        variantClassNames[variant],
        className,
      )}
    >
      {Icon ? <Icon className="h-6 w-6 shrink-0" aria-hidden={true} /> : null}
      <span className="transition-transform duration-75 group-active:translate-y-px">{children}</span>
    </Button>
  );
}

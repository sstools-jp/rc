import { cn } from "@/utils/cn";

type ToastProps = {
  message: string;
  isVisible: boolean;
  className?: string;
};

/** 一時通知トースト */
export function Toast({ message, isVisible, className = "" }: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-none fixed bottom-16 left-1/2 z-50 -translate-x-1/2 rounded-sm",
        "border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 shadow-lg",
        "transition-all duration-200 ease-out",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        className,
      )}
    >
      {message}
    </div>
  );
}

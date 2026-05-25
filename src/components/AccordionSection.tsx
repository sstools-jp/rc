import type { ReactNode } from "react";
import { usePersistedSectionCollapse } from "@/hooks/usePersistedSectionCollapse";
import { cn } from "@/utils/cn";

type AccordionSectionProps = {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

/** アコーディオン (開閉可能) コンポーネント */
export function AccordionSection({ title, defaultOpen = false, children }: AccordionSectionProps) {
  const { isOpen, toggleOpen } = usePersistedSectionCollapse(title, defaultOpen);

  return (
    <section className="space-y-1">
      <h3>
        <button
          type="button"
          onClick={toggleOpen}
          aria-expanded={isOpen}
          className="flex items-center gap-1.5 rounded-sm text-left text-sm text-slate-700 outline-none hover:text-blue-700"
        >
          <span
            aria-hidden="true"
            className={cn(
              "inline-block h-0 w-0 shrink-0 border-y-[5px] border-l-[7px] border-y-transparent border-l-slate-500",
              isOpen ? "rotate-90" : "rotate-0",
            )}
          />
          <span>{title}</span>
        </button>
      </h3>

      {isOpen ? (
        <div className="mb-2 overflow-hidden border border-slate-400 bg-slate-50/80">{children}</div>
      ) : null}
    </section>
  );
}

export default AccordionSection;

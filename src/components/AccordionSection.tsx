import { BsQuestionCircle } from "react-icons/bs";
import type { ReactNode } from "react";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { FiChevronRight } from "react-icons/fi";
import { usePersistedSectionCollapse } from "@/hooks/usePersistedSectionCollapse";
import { Tooltip } from "@/components/Tooltip";
import { cn } from "@/utils/cn";

type AccordionSectionProps = {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
  tooltip?: string | string[];
};

/** アコーディオン (開閉可能) コンポーネント */
export function AccordionSection({ title, defaultOpen = false, children, tooltip }: AccordionSectionProps) {
  const { isOpen, toggleOpen } = usePersistedSectionCollapse(title, defaultOpen);

  // ツールチップの内容を string に変換
  const tooltipLines = Array.isArray(tooltip) ? tooltip.join("\n") : tooltip;

  return (
    <Disclosure defaultOpen={isOpen}>
      {({ open }) => (
        <section className="space-y-1">
          <h3 className="flex items-center justify-between gap-1">
            <DisclosureButton
              as="button"
              onClick={toggleOpen}
              aria-expanded={open}
              className="flex items-center rounded py-0.5 pr-1 text-left text-sm text-slate-800 outline-none hover:bg-slate-100 hover:text-black"
            >
              <FiChevronRight
                aria-hidden="true"
                className={cn("h-4 w-4 shrink-0", open ? "rotate-90" : "rotate-0")}
              />
              <span>{title}</span>
            </DisclosureButton>
            {tooltipLines && tooltipLines.length > 0 && (
              <Tooltip content={tooltipLines}>
                <BsQuestionCircle className="mx-1 h-4 w-4 text-slate-400 hover:text-slate-800" />
              </Tooltip>
            )}
          </h3>

          <DisclosurePanel className="mb-2 overflow-hidden border border-slate-400 bg-slate-50/80">
            {children}
          </DisclosurePanel>
        </section>
      )}
    </Disclosure>
  );
}

export default AccordionSection;

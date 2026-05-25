import { forwardRef } from "react";
import type { FormState } from "@/forms/form-state";
import type { AnnularSectionResult } from "@/models/annular-section";
import { type SectionForceMode } from "@/components/SectionForceModeSelector";
import { PrintPreviewTable } from "@/components/PrintPreviewTable";
import { buildInputPreviewSections, buildResultPreviewSections } from "@/utils/print-preview-data";
import { cn } from "@/utils/cn";

type PrintPreviewContentProps = {
  form: FormState;
  sectionForceMode: SectionForceMode;
  result: AnnularSectionResult | null;
  className?: string;
};

/** 印刷プレビュー用の共通コンテンツ */
export const PrintPreviewContent = forwardRef<HTMLDivElement, PrintPreviewContentProps>(
  function PrintPreviewContent({ form, sectionForceMode, result, className }, ref) {
    const inputSections = buildInputPreviewSections(form, sectionForceMode);
    const resultSections = buildResultPreviewSections(result);

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-sm bg-white p-8 shadow-sm print:rounded-none print:p-0 print:shadow-none",
          className,
        )}
      >
        <h4 className="mb-4 text-center text-xl font-semibold">RC断面計算【円環断面】</h4>
        <PrintPreviewTable title="入力値" sections={inputSections} valueHeader="入力値" includeSectionLabel />

        <div className="h-8" />

        <PrintPreviewTable
          title="計算結果"
          sections={resultSections}
          valueHeader="算出値"
          includeSectionLabel={false}
        />
      </div>
    );
  },
);

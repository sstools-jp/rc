import type { FormState } from "@/forms/form-state";
import type { AnnularSectionResult } from "@/models/annular-section";
import { CrossSectionPreview } from "@/components/CrossSectionPreview";
import { SectionCard } from "@/components/SectionCard";

type AnnularSectionPreviewPanelProps = {
  form: FormState;
  result: AnnularSectionResult | null;
};

/** 断面図表示パネル */
export function AnnularSectionPreviewPanel({ form, result }: AnnularSectionPreviewPanelProps) {
  return (
    <SectionCard title="断面図">
      <CrossSectionPreview form={form} result={result} />
    </SectionCard>
  );
}

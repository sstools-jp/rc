import { SymbolText } from "@/components/SymbolText";
import type { PrintPreviewSection } from "@/utils/print-preview-data";

type PrintPreviewTableProps = {
  title: string;
  sections: PrintPreviewSection[];
  valueHeader: string;
  includeSectionLabel: boolean;
};

/** 印刷用テーブル表示コンポーネント */
export function PrintPreviewTable({ title, sections, valueHeader, includeSectionLabel }: PrintPreviewTableProps) {
  return (
    <section>
      <h5 className="mb-2">{title}</h5>

      <div className="max-w-full overflow-x-auto">
        <table className="w-lg border-collapse border-2 border-slate-600 text-sm print:text-[12px]">
          <thead>
            <tr className="bg-slate-200">
              <th
                colSpan={includeSectionLabel ? 2 : 1}
                className="border border-slate-600 px-1 py-0.5 text-center font-semibold"
                scope="col"
              >
                項目
              </th>
              <th className="w-12 border border-slate-600 px-1 py-0.5 text-center font-semibold" scope="col">
                記号
              </th>
              <th className="w-18 border border-slate-600 px-1 py-0.5 text-center font-semibold" scope="col">
                単位
              </th>
              <th className="w-24 border border-slate-600 px-1 py-0.5 text-center font-semibold" scope="col">
                {valueHeader}
              </th>
            </tr>
          </thead>
          <tbody>
            {sections.map((section) =>
              section.rows.map((row, rowIndex) => (
                <tr key={`${section.title}-${row.symbol}`} className="border border-slate-600">
                  {includeSectionLabel && rowIndex === 0 ? (
                    <td
                      rowSpan={section.rows.length}
                      className="border border-slate-600 bg-slate-50 text-center align-middle"
                      style={{ writingMode: "vertical-rl", textOrientation: "upright" }}
                    >
                      {section.title}
                    </td>
                  ) : null}
                  <td className="border border-slate-600 px-1 py-0.5 font-mono">{row.label}</td>
                  <td className="border border-slate-600 px-1 py-0.5 text-center font-mono">
                    <SymbolText value={row.symbol} />
                  </td>
                  <td className="border border-slate-600 px-1 py-0.5 text-center font-mono">{row.unit}</td>
                  <td className="border border-slate-600 px-1 py-0.5 text-right font-mono">{row.value}</td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

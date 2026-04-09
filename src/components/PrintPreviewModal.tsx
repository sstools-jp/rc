import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useState } from "react";
import type { AnnularSectionResult } from "../model/annular-section";

type PrintPreviewModalProps = {
  open: boolean;
  form: PrintPreviewFormState;
  result: AnnularSectionResult | null;
  onClose: () => void;
};

export type PrintPreviewFormState = {
  momentKNm: string;
  shearKN: string;
  axialKN: string;
  outerRadiusMm: string;
  innerRadiusMm: string;
  rebarRadiusMm: string;
  rebarDiameterMm: string;
  barCount: string;
  youngRatio: string;
  rebarYieldStrengthNPerMm2: string;
  concreteDesignStrengthNPerMm2: string;
};

type PrintPreviewRow = {
  label: string;
  symbol: string;
  unit: string;
  value: string;
};

type PrintPreviewSection = {
  title: string;
  rows: PrintPreviewRow[];
};

type CopyBlock = {
  title: string;
  header: string;
  sections: PrintPreviewSection[];
};

type PreviewTableProps = {
  title: string;
  sections: PrintPreviewSection[];
  valueHeader: string;
  includeSectionLabel: boolean;
};

function parseNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function formatPrintValue(value: number | undefined, digits = 3): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "-";
  }

  return new Intl.NumberFormat("ja-JP", {
    maximumFractionDigits: digits,
    useGrouping: false,
  }).format(value);
}

function SymbolText({ value }: { value: string }) {
  if (value.length <= 1) {
    return <>{value}</>;
  }

  return (
    <>
      {value[0]}
      <sub>{value.slice(1)}</sub>
    </>
  );
}

function PreviewTable({ title, sections, valueHeader, includeSectionLabel }: PreviewTableProps) {
  return (
    <section>
      <h4 className="mb-2 text-center text-lg font-semibold">{title}</h4>

      <table className="w-lg border-collapse border-2 border-slate-600">
        <thead>
          <tr className="bg-slate-200">
            <th
              colSpan={includeSectionLabel ? 2 : 1}
              className="border border-slate-600 px-1 py-1 text-center font-semibold"
              scope="col"
            >
              項目
            </th>
            <th className="w-12 border border-slate-600 px-1 py-1 text-center font-semibold" scope="col">
              記号
            </th>
            <th className="w-18 border border-slate-600 px-1 py-1 text-center font-semibold" scope="col">
              単位
            </th>
            <th className="w-24 border border-slate-600 px-1 py-1 text-center font-semibold" scope="col">
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
                    className="border border-slate-600 bg-slate-50 px-1 text-center align-middle font-semibold"
                    style={{ writingMode: "vertical-rl", textOrientation: "upright" }}
                  >
                    {section.title}
                  </td>
                ) : null}
                <td className="border border-slate-600 px-1 py-1 font-mono">{row.label}</td>
                <td className="border border-slate-600 px-1 py-1 text-center font-mono">
                  <SymbolText value={row.symbol} />
                </td>
                <td className="border border-slate-600 px-1 py-1 text-center font-mono">{row.unit}</td>
                <td className="border border-slate-600 px-1 py-1 text-right font-mono">{row.value}</td>
              </tr>
            )),
          )}
        </tbody>
      </table>
    </section>
  );
}

function buildInputPreviewSections(form: PrintPreviewFormState): PrintPreviewSection[] {
  return [
    {
      title: "断面力",
      rows: [
        {
          label: "曲げモーメント",
          symbol: "M",
          unit: "kN.m",
          value: formatPrintValue(parseNumber(form.momentKNm), 2),
        },
        {
          label: "せん断力",
          symbol: "S",
          unit: "kN",
          value: formatPrintValue(parseNumber(form.shearKN), 2),
        },
        {
          label: "軸力（圧縮力）",
          symbol: "N",
          unit: "kN",
          value: formatPrintValue(parseNumber(form.axialKN), 2),
        },
      ],
    },
    {
      title: "寸法",
      rows: [
        {
          label: "半径（外径）",
          symbol: "r",
          unit: "mm",
          value: formatPrintValue(parseNumber(form.outerRadiusMm), 0),
        },
        {
          label: "半径（内径）",
          symbol: "r0",
          unit: "mm",
          value: formatPrintValue(parseNumber(form.innerRadiusMm), 0),
        },
        {
          label: "鉄筋位置（有効半径）",
          symbol: "rs",
          unit: "mm",
          value: formatPrintValue(parseNumber(form.rebarRadiusMm), 0),
        },
      ],
    },
    {
      title: "鉄筋",
      rows: [
        {
          label: "鉄筋径",
          symbol: "D",
          unit: "-",
          value: `D${form.rebarDiameterMm}`,
        },
        {
          label: "本数",
          symbol: "H",
          unit: "(本)",
          value: formatPrintValue(parseNumber(form.barCount), 3),
        },
      ],
    },
  ];
}

function buildResultPreviewSections(result: AnnularSectionResult | null): PrintPreviewSection[] {
  return [
    {
      title: "応力度",
      rows: [
        {
          label: "コンクリート圧縮応力度",
          symbol: "σc",
          unit: "N/mm²",
          value: formatPrintValue(result?.concreteCompressionStressNPerMm2, 2),
        },
        {
          label: "鉄筋引張応力度",
          symbol: "σs",
          unit: "N/mm²",
          value: formatPrintValue(result?.rebarStressNPerMm2, 2),
        },
        {
          label: "コンクリート最大せん断応力度",
          symbol: "τc",
          unit: "N/mm²",
          value: formatPrintValue(result?.concreteShearStressNPerMm2, 2),
        },
      ],
    },
    {
      title: "終局耐力",
      rows: [
        {
          label: "コンクリート終局曲げモーメント",
          symbol: "Mc",
          unit: "kN.m",
          value: formatPrintValue(result?.concreteUltimateMomentKNm, 1),
        },
        {
          label: "鉄筋降伏曲げモーメント",
          symbol: "Mb",
          unit: "kN.m",
          value: formatPrintValue(result?.rebarYieldMomentKNm, 1),
        },
      ],
    },
    {
      title: "計算結果",
      rows: [
        {
          label: "中立軸の位置(圧縮端からの距離)",
          symbol: "x",
          unit: "mm",
          value: formatPrintValue(result?.neutralAxisPositionMm, 0),
        },
        {
          label: "換算曲げモーメント",
          symbol: "Me",
          unit: "kN.m",
          value: formatPrintValue(result?.combinedMomentKNm, 1),
        },
        {
          label: "鉄筋断面積",
          symbol: "As",
          unit: "mm²",
          value: formatPrintValue(result?.totalRebarAreaMm2, 0),
        },
        {
          label: "鉄筋比 [=As/(π*r*r)]",
          symbol: "P",
          unit: "%",
          value: formatPrintValue(result?.rebarRatioPercent, 2),
        },
      ],
    },
  ];
}

function buildClipboardText(blocks: CopyBlock[]): string {
  const lines: string[] = [];

  for (const block of blocks) {
    lines.push(block.title);
    lines.push(block.header);

    for (const section of block.sections) {
      for (const row of section.rows) {
        lines.push([section.title, row.label, row.symbol, row.unit, row.value].join("\t"));
      }
    }

    lines.push("");
  }

  return lines.join("\n").trimEnd();
}

async function copyTextToClipboard(text: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  if (typeof document === "undefined") {
    throw new Error("クリップボードにアクセスできません。");
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "0";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();

  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);

  if (!copied) {
    throw new Error("クリップボードへのコピーに失敗しました。");
  }
}

export function PrintPreviewModal({ open, form, result, onClose }: PrintPreviewModalProps) {
  const [copyError, setCopyError] = useState<string | null>(null);
  const inputSections = buildInputPreviewSections(form);
  const resultSections = buildResultPreviewSections(result);
  const canCopy = result !== null;

  const handleCopy = async () => {
    if (!canCopy) {
      return;
    }

    try {
      setCopyError(null);
      const text = buildClipboardText([
        {
          title: "入力値",
          header: "区分\t項目\t記号\t単位\t入力値",
          sections: inputSections,
        },
        {
          title: "計算結果",
          header: "区分\t項目\t記号\t単位\t計算値",
          sections: resultSections,
        },
      ]);

      await copyTextToClipboard(text);
    } catch {
      setCopyError("クリップボードへのコピーに失敗しました。");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-slate-950/60" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="flex max-h-[calc(100vh-2rem)] max-w-5xl flex-col overflow-hidden rounded-sm bg-slate-100 shadow-2xl">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4">
            <div>
              <p className="text-sm font-medium text-slate-500">印刷用プレビュー</p>
              <DialogTitle as="h3" className="text-2xl font-semibold">
                ＲＣ計算［円環断面］
              </DialogTitle>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!canCopy}
                  className="inline-flex min-h-9 items-center justify-center border border-slate-300 bg-white px-4 text-sm text-slate-700 hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  クリップボードにコピー
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex min-h-9 items-center justify-center border border-slate-300 bg-white px-4 text-sm text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                >
                  閉じる
                </button>
              </div>
              {copyError ? <p className="text-sm text-rose-600">{copyError}</p> : null}
            </div>
          </div>

          <div className="overflow-auto p-4">
            <div className="rounded-sm bg-white p-8 shadow-sm">
              <PreviewTable
                title="入力値"
                sections={inputSections}
                valueHeader="入力値"
                includeSectionLabel
              />

              <div className="h-6" />

              <PreviewTable
                title="計算結果"
                sections={resultSections}
                valueHeader="計算値"
                includeSectionLabel={false}
              />
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

import clsx from "clsx";
import type { FormState } from "@/forms/form-state";
import type { AnnularSectionResult } from "@/model/annular-section";
import { parseNumber } from "@/utils/number-format";
import { twMerge } from "tailwind-merge";

/** 座標の型 */
type Point = {
  x: number;
  y: number;
};

type CrossSectionPreviewProps = {
  /** 入力フォームの状態 */
  form: FormState;
  /** 計算結果 */
  result: AnnularSectionResult | null;
};

/**
 * 断面プレビューコンポーネント
 *
 * 入力された断面形状を概略的に表示するコンポーネントです。
 * 入力値が不正な場合は、概略的な円環断面を表示します。
 * 中立軸の位置が計算されている場合は、点線で中立軸を表示します。
 */
export function CrossSectionPreview({ form, result }: CrossSectionPreviewProps) {
  // 寸法を取得
  const outerRadiusMm = parseNumber(form.outerRadiusMm);
  const innerRadiusMm = parseNumber(form.innerRadiusMm);
  const rebarRadiusMm = parseNumber(form.rebarRadiusMm);
  const rebarDiameterMm = parseNumber(form.rebarDiameterMm);
  const barCount = Math.max(0, Math.round(parseNumber(form.barCount)));

  // ジオメトリが有効かどうかを判定
  const geometryIsValid =
    Number.isFinite(outerRadiusMm) &&
    outerRadiusMm > 0 &&
    Number.isFinite(innerRadiusMm) &&
    innerRadiusMm >= 0 &&
    innerRadiusMm <= outerRadiusMm &&
    Number.isFinite(rebarRadiusMm) &&
    rebarRadiusMm >= innerRadiusMm &&
    rebarRadiusMm <= outerRadiusMm;

  // 表示用の寸法を計算（入力値が不正な場合はデフォルト値を使用）
  const displayOuterRadius = Number.isFinite(outerRadiusMm) && outerRadiusMm > 0 ? outerRadiusMm : 100;
  const displayInnerRadius = Number.isFinite(innerRadiusMm) && innerRadiusMm >= 0 ? innerRadiusMm : 0;
  const displayRebarRadius = Number.isFinite(rebarRadiusMm) && rebarRadiusMm >= 0 ? rebarRadiusMm : 0;
  const displayRebarDiameterMm =
    Number.isFinite(rebarDiameterMm) && rebarDiameterMm > 0 ? rebarDiameterMm : 12;

  // SVGのviewBoxの半径を計算（断面が見切れないようにmarginを追加）
  const margin = Math.max(displayOuterRadius * 0.18, 14);
  const viewBoxRadius = displayOuterRadius + margin;
  const neutralAxisLine =
    result && Number.isFinite(result.neutralAxisPositionMm) ? -result.neutralAxisPositionMm : null;

  // 描画用パラメータ
  const strokeWidth = 10;
  const dashDotLine = `${strokeWidth * 14} ${strokeWidth * 4} ${strokeWidth * 2} ${strokeWidth * 4}`;
  const strokeColor = "#0f172a";
  const fillColor = "#e2e8f0";
  const rebarColor = "#b91c1c";
  const neutralAxisColor = "#cf172a";

  return (
    <div className="space-y-3 p-3">
      <div className="flex justify-center rounded-xs border border-slate-200 bg-white p-2">
        <svg
          viewBox={`${-viewBoxRadius} ${-viewBoxRadius} ${viewBoxRadius * 2} ${viewBoxRadius * 2}`}
          className="h-72 w-80"
          role="img"
          aria-label="円環断面のプレビュー"
        >
          {/* 外径および内径 */}
          <path
            d={buildAnnulusPath(displayOuterRadius, displayInnerRadius)}
            fill={fillColor}
            fillRule="evenodd"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />

          {/* 鉄筋 */}
          {geometryIsValid && barCount > 0
            ? Array.from({ length: barCount }, (_, index) => {
                const angle = (index / barCount) * Math.PI * 2 - Math.PI / 2;
                const point = polarToCartesian(displayRebarRadius, angle);
                const barRadius = Math.max(displayRebarDiameterMm / 2, displayOuterRadius * 0.02);

                return (
                  <circle
                    key={`${index}-${angle}`}
                    cx={point.x}
                    cy={point.y}
                    r={barRadius}
                    fill={rebarColor}
                  />
                );
              })
            : null}

          {/* 外径の中心線 */}
          <line
            x1={-viewBoxRadius * 0.98}
            y1="0"
            x2={viewBoxRadius * 0.98}
            y2="0"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={dashDotLine}
            strokeLinecap="round"
          />
          <line
            x1="0"
            y1={-viewBoxRadius * 0.98}
            x2="0"
            y2={viewBoxRadius * 0.98}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={dashDotLine}
            strokeLinecap="round"
          />

          {/* 中立軸 */}
          {neutralAxisLine !== null ? (
            <line
              x1={neutralAxisLine}
              y1={-viewBoxRadius * 0.98}
              x2={neutralAxisLine}
              y2={viewBoxRadius * 0.98}
              stroke={neutralAxisColor}
              strokeDasharray={dashDotLine}
              strokeWidth={strokeWidth}
            />
          ) : null}
        </svg>
      </div>

      <div className="flex gap-3 text-xs text-slate-600">
        <PreviewLegend label="コンクリート" className="bg-slate-400" />
        <PreviewLegend label="鉄筋" className="bg-red-700" />
        <PreviewLegend label="中立軸" className="border-red-600" kind="stroke" dashed />
      </div>
    </div>
  );
}

// /** 角度を度からラジアンに変換する */
// function degToRad(deg: number): number {
//   return (deg * Math.PI) / 180;
// }

/** 極座標をデカルト座標に変換する */
function polarToCartesian(radius: number, angleRad: number): Point {
  return {
    x: radius * Math.cos(angleRad),
    y: -radius * Math.sin(angleRad),
  };
}

/** 円環を1つのパスとして描画するための d 属性を生成する */
function buildAnnulusPath(outerRadius: number, innerRadius: number): string {
  return innerRadius > 0
    ? `${buildCirclePath(outerRadius)} ${buildCirclePath(innerRadius)}`
    : buildCirclePath(outerRadius);
}

/** 円のパスを生成する */
function buildCirclePath(radius: number): string {
  return [
    `M ${radius} 0`,
    `A ${radius} ${radius} 0 1 0 ${-radius} 0`,
    `A ${radius} ${radius} 0 1 0 ${radius} 0`,
    "Z",
  ].join(" ");
}

// /** 中心を通る線分の両端の座標を計算する */
// function buildLineThroughCenter(halfLength: number, angleRad: number): { start: Point; end: Point } {
//   const direction = polarToCartesian(1, angleRad);
//   return {
//     start: { x: -direction.x * halfLength, y: -direction.y * halfLength },
//     end: { x: direction.x * halfLength, y: direction.y * halfLength },
//   };
// }

type PreviewLegendProps = {
  label: string;
  className?: string;
  dashed?: boolean;
  kind?: "fill" | "stroke";
};

/** プレビューの凡例アイテムコンポーネント */
function PreviewLegend({ label, className, dashed = false, kind = "fill" }: PreviewLegendProps) {
  const swatchClassName = twMerge(
    clsx(
      "shrink-0",
      kind === "stroke" ? "h-4 w-0 border-l-2" : "h-3 w-3 rounded-sm",
      kind === "fill" && "bg-current",
      kind === "stroke" && "border-t-current",
    ),
    className,
    kind === "stroke" && dashed && "border-dashed",
    kind === "fill" && dashed && "border border-slate-400 bg-transparent",
  );

  return (
    <div className="flex items-center gap-2">
      <span aria-hidden="true" className={swatchClassName} />
      <span>{label}</span>
    </div>
  );
}

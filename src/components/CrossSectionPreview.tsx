import type { FormState } from "@/forms/form-state";
import type { AnnularSectionResult } from "@/models/annular-section";
import { parseNumber } from "@/utils/number-format";
import { cn } from "@/utils/cn";

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
  const outerRadius_Mm = parseNumber(form.outerRadius_Mm);
  const innerRadius_Mm = parseNumber(form.innerRadius_Mm);
  const rebarRadius_Mm = parseNumber(form.rebarRadius_Mm);
  const rebarDiameter_Mm =
    form.rebarKind === "round" ? parseNumber(form.roundRebarDiameter_Mm) : parseNumber(form.rebarDiameter_Mm);
  const barCount = Math.max(0, Math.round(parseNumber(form.barCount)));

  // ジオメトリが有効かどうかを判定
  const geometryIsValid =
    Number.isFinite(outerRadius_Mm) &&
    outerRadius_Mm > 0 &&
    Number.isFinite(innerRadius_Mm) &&
    innerRadius_Mm >= 0 &&
    innerRadius_Mm <= outerRadius_Mm &&
    Number.isFinite(rebarRadius_Mm) &&
    rebarRadius_Mm >= innerRadius_Mm &&
    rebarRadius_Mm <= outerRadius_Mm;

  // 表示用の基本半径
  const baseOuterRadius = 200;

  // 表示用の寸法を計算（外径半径は固定し、入力寸法を倍率変換する）
  const displayOuterRadius_Mm = Number.isFinite(outerRadius_Mm) && outerRadius_Mm > 0 ? outerRadius_Mm : 100;
  const displayScale = baseOuterRadius / displayOuterRadius_Mm;
  const displayOuterRadius = baseOuterRadius;
  const displayInnerRadius =
    Number.isFinite(innerRadius_Mm) && innerRadius_Mm >= 0 ? innerRadius_Mm * displayScale : 0;
  const displayRebarRadius =
    Number.isFinite(rebarRadius_Mm) && rebarRadius_Mm >= 0 ? rebarRadius_Mm * displayScale : 0;
  const displayRebarDiameter_Mm =
    Number.isFinite(rebarDiameter_Mm) && rebarDiameter_Mm > 0
      ? rebarDiameter_Mm * displayScale
      : 12 * displayScale;

  // SVGのviewBoxの半径を計算（断面が見切れないようにmarginを追加）
  const margin = Math.max(displayOuterRadius * 0.18, 14);
  const viewBoxRadius = displayOuterRadius + margin;
  const neutralAxisLine =
    result && Number.isFinite(result.neutralAxis.neutralAxisPosition_Mm)
      ? -result.neutralAxis.neutralAxisPosition_Mm * displayScale
      : null;

  // 描画用パラメータ
  const strokeWidth = 1.5;
  const dashDotLine = `${strokeWidth * 24} ${strokeWidth * 3} ${strokeWidth * 6} ${strokeWidth * 3}`;
  const strokeClassName = cn("stroke-slate-800");
  const concreteClassName = cn("bg-slate-200 fill-slate-200 stroke-slate-800");
  const rebarClassName = cn("bg-blue-700 fill-blue-700");
  const neutralAxisClassName = cn("border-red-600 stroke-red-600");

  return (
    <div className="w-full space-y-3 p-3">
      <div className="flex justify-center rounded-xs border border-slate-200 bg-white p-2">
        <svg
          viewBox={`${-viewBoxRadius} ${-viewBoxRadius} ${viewBoxRadius * 2} ${viewBoxRadius * 2}`}
          className="h-64 w-full"
          role="img"
          aria-label="円環断面のプレビュー"
        >
          <DimensionArrowDefs />

          {/* コンクリート円環 */}
          <Donut
            x={0}
            y={0}
            outerRadius={displayOuterRadius}
            innerRadius={displayInnerRadius}
            className={concreteClassName}
          />

          {/* 鉄筋群 */}
          {geometryIsValid && barCount > 0
            ? Array.from({ length: barCount }, (_, index) => {
                const angle = (index / barCount) * Math.PI * 2 - Math.PI / 2;
                const point = polarToCartesian(displayRebarRadius, angle);
                const maxBarRadius = Math.min(
                  // 鉄筋同士が接触しない最大半径
                  (Math.PI * 2 * displayRebarRadius) / barCount / 2,
                  // 鉄筋径がコンクリート幅の半分となる半径
                  (displayOuterRadius - displayInnerRadius) / 2 / 2,
                );

                // 外径の 1/50 を最小半径とする（視認性のため）
                const minBarRadius = displayOuterRadius / 50;

                // minBarRadius <= barRadius <= maxBarRadius
                const barRadius = Math.max(minBarRadius, Math.min(displayRebarDiameter_Mm / 2, maxBarRadius));

                return (
                  <circle
                    key={`${index}-${angle}`}
                    cx={point.x}
                    cy={point.y}
                    r={barRadius}
                    className={rebarClassName}
                  />
                );
              })
            : null}

          {/* 外径の中心線 */}
          <CenterMark
            x={0}
            y={0}
            size={displayOuterRadius * 1.2}
            strokeWidth={strokeWidth}
            strokeDasharray={dashDotLine}
            className={strokeClassName}
          />

          {/* 中立軸 */}
          {neutralAxisLine !== null ? (
            <VerticalCenterLine
              x={neutralAxisLine}
              size={viewBoxRadius * 1.2}
              strokeWidth={strokeWidth}
              strokeDasharray={dashDotLine}
              className={neutralAxisClassName}
            />
          ) : null}

          {/* 寸法線（外径半径） */}
          {geometryIsValid ? (
            <RadiusDimension
              x={0}
              y={0}
              radius={displayOuterRadius}
              label="r"
              rotate={-15}
              className={strokeClassName}
            />
          ) : null}

          {/* 寸法線（鉄筋位置） */}
          {geometryIsValid ? (
            <RadiusDimension
              x={0}
              y={0}
              radius={displayRebarRadius}
              label="rs"
              rotate={-35}
              className={strokeClassName}
            />
          ) : null}

          {/* 寸法線（内径半径） */}
          {geometryIsValid ? (
            <RadiusDimension
              x={0}
              y={0}
              radius={displayInnerRadius}
              label="r0"
              rotate={-55}
              className={strokeClassName}
            />
          ) : null}
        </svg>
      </div>

      <div className="flex gap-3 text-xs text-slate-600">
        <PreviewLegend label="コンクリート" className={concreteClassName} />
        <PreviewLegend label="鉄筋" className={rebarClassName} />
        <PreviewLegend label="中立軸" className={neutralAxisClassName} kind="stroke" dashed />
      </div>
    </div>
  );
}

/** 極座標をデカルト座標に変換する */
function polarToCartesian(radius: number, angleRad: number): Point {
  return {
    x: radius * Math.cos(angleRad),
    y: -radius * Math.sin(angleRad),
  };
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

type PreviewLegendProps = {
  label: string;
  className?: string;
  dashed?: boolean;
  kind?: "fill" | "stroke";
};

/** プレビューの凡例アイテムコンポーネント */
function PreviewLegend({ label, className, dashed = false, kind = "fill" }: PreviewLegendProps) {
  const swatchClassName = cn(
    "shrink-0",
    kind === "stroke" ? "h-4 w-0 border-l-2" : "h-3 w-3 rounded-sm",
    kind === "fill" && "bg-current",
    kind === "stroke" && "border-t-current",
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

type DonutProps = {
  x: number;
  y: number;
  outerRadius: number;
  innerRadius: number;
  className?: string;
};

/** ドーナツ形状 */
function Donut({ x, y, outerRadius, innerRadius, className }: DonutProps) {
  const outerPath = buildCirclePath(outerRadius);
  const innerPath = innerRadius > 0 ? buildCirclePath(innerRadius) : "";

  return (
    <path
      d={innerPath ? `${outerPath} ${innerPath}` : outerPath}
      transform={`translate(${x} ${y})`}
      fillRule="evenodd"
      clipRule="evenodd"
      className={className}
    />
  );
}

type CenterMarkProps = {
  x: number;
  y: number;
  size: number;
  strokeWidth: number;
  strokeDasharray: string;
  className?: string;
};

/** 円の中心線 */
function CenterMark({ x, y, size, strokeWidth, strokeDasharray, className }: CenterMarkProps) {
  // [X方向の倍率, Y方向の倍率] を定義 (右、下、左、上)
  const directions = [
    [1, 0], // 右方向 (x + size, y)
    [0, 1], // 下方向 (x, y + size)
    [-1, 0], // 左方向 (x - size, y)
    [0, -1], // 上方向 (x, y - size)
  ];

  return (
    <g className={className} aria-hidden="true">
      {directions.map(([dx, dy], index) => (
        <line
          key={index}
          x1={x}
          y1={y}
          x2={x + dx * size}
          y2={y + dy * size}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
        />
      ))}
    </g>
  );
}

type VerticalCenterLineProps = {
  x: number;
  size: number;
  strokeWidth: number;
  strokeDasharray: string;
  className?: string;
};

/** 縦中心線 */
function VerticalCenterLine({ x, size, strokeWidth, strokeDasharray, className }: VerticalCenterLineProps) {
  // [X方向の倍率, Y方向の倍率] を定義 (上、下)
  const directions = [
    [0, -1], // 上方向 (x, y - size)
    [0, 1], // 下方向 (x, y + size)
  ];

  return (
    <g className={className} aria-hidden="true">
      {directions.map(([dx, dy], index) => (
        <line
          key={index}
          x1={x}
          y1={0}
          x2={x + dx * size}
          y2={dy * size}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
        />
      ))}
    </g>
  );
}

type RadiusDimensionProps = {
  /** 中心のX座標 */
  x: number;
  /** 中心のY座標 */
  y: number;
  /** 半径 */
  radius: number;
  /** 表示文字列 */
  label: string;
  /** 回転角度 [deg] */
  rotate?: number;
  className?: string;
};

/** 半径寸法 */
function RadiusDimension({ x, y, radius, label, rotate, className }: RadiusDimensionProps) {
  const fontSize = 28;

  return (
    <g className={className} transform={`translate(${x} ${y}) rotate(${rotate ?? 0})`} aria-hidden="true">
      <line
        x1={0}
        y1={0}
        x2={radius}
        y2={0}
        strokeWidth={1.5}
        stroke="currentColor"
        markerEnd="url(#dimension-arrow)"
      />
      <line x1={radius} y1={0} x2={radius + fontSize * 2} y2={0} strokeWidth={1.5} stroke="currentColor" />
      <text
        x={radius + fontSize}
        y={-6}
        textAnchor="middle"
        fontSize={fontSize}
        fill="currentColor"
        className="font-mono"
      >
        {label}
      </text>
    </g>
  );
}

type DimensionArrowDefsProps = {
  className?: string;
};

/** 寸法線共通の矢印定義 */
function DimensionArrowDefs({ className }: DimensionArrowDefsProps) {
  return (
    <defs className={className}>
      <marker
        id="dimension-arrow"
        viewBox="0 0 10 10"
        refX="10"
        refY="5"
        markerWidth="12"
        markerHeight="12"
        orient="auto-start-reverse"
      >
        <path
          d="M 2 1 L 10 5 L 2 9"
          className="stroke-linecap-round stroke-linejoin-round fill-none stroke-black"
        />
      </marker>
    </defs>
  );
}

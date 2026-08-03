<script setup lang="ts">
import { computed } from "vue";
import type { FormState } from "@/forms/form-state";
import type { AnnularSectionResult } from "@/models/annular-section";
import { parseNumber } from "@/utils/number-format";
import { cn } from "@/utils/cn";

const props = defineProps<{
  /** 入力フォームの状態 */
  form: FormState;
  /** 計算結果 */
  result: AnnularSectionResult | null;
}>();

/** 座標の型 */
type Point = {
  x: number;
  y: number;
};

// 寸法を取得
const outerRadius_Mm = parseNumber(props.form.outerRadius_Mm);
const innerRadius_Mm = parseNumber(props.form.innerRadius_Mm);
const rebarRadius_Mm = parseNumber(props.form.rebarRadius_Mm);
const rebarDiameter_Mm =
  props.form.rebarKind === "round"
    ? parseNumber(props.form.roundRebarDiameter_Mm)
    : parseNumber(props.form.rebarDiameter_Mm);
const barCount = Math.max(0, Math.round(parseNumber(props.form.barCount)));

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
const margin = Math.max(displayOuterRadius * 0.18, 60);
const viewBoxRadius = displayOuterRadius + margin;
const neutralAxisLine =
  props.result && Number.isFinite(props.result.neutralAxis.neutralAxisPosition_Mm)
    ? -props.result.neutralAxis.neutralAxisPosition_Mm * displayScale
    : null;

// 描画用パラメータ
const strokeWidth = 1.5;
const dashDotLine = `${strokeWidth * 24} ${strokeWidth * 3} ${strokeWidth * 6} ${strokeWidth * 3}`;
const strokeClassName = cn("stroke-gray-800");
const concreteClassName = cn("bg-slate-200 fill-slate-200 stroke-gray-800");
const rebarClassName = cn("bg-blue-700 fill-blue-700");
const neutralAxisClassName = cn("border-red-600 stroke-red-600");

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

/** 鉄筋の円を生成する */
const rebarCircles = computed(() => {
  if (!geometryIsValid || barCount <= 0) return [];

  return Array.from({ length: barCount }, (_, index) => {
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

    return {
      key: `${index}-${angle}`,
      cx: point.x,
      cy: point.y,
      r: barRadius,
    };
  });
});

/** ドーナツ形状のパス */
const donutPath = computed(() => {
  const outerPath = buildCirclePath(displayOuterRadius);
  const innerPath = displayInnerRadius > 0 ? buildCirclePath(displayInnerRadius) : "";
  return innerPath ? `${outerPath} ${innerPath}` : outerPath;
});

/** 中心線の方向 */
const centerMarkDirections = [
  [1, 0], // 右方向 (x + size, y)
  [0, 1], // 下方向 (x, y + size)
  [-1, 0], // 左方向 (x - size, y)
  [0, -1], // 上方向 (x, y - size)
];

/** 縦中心線の方向 */
const verticalCenterLineDirections = [
  [0, -1], // 上方向 (x, y - size)
  [0, 1], // 下方向 (x, y + size)
];
</script>

<template>
  <div class="w-full space-y-3 p-3">
    <div class="flex justify-center rounded-xs border border-slate-200 bg-white p-2">
      <svg
        :viewBox="`${-viewBoxRadius} ${-viewBoxRadius + 20} ${viewBoxRadius * 2} ${viewBoxRadius * 2}`"
        class="h-full w-full"
        role="img"
        aria-label="円環断面のプレビュー"
      >
        <defs>
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
              class="stroke-linecap-round stroke-linejoin-round fill-none stroke-black"
            />
          </marker>
        </defs>

        <!-- コンクリート円環 -->
        <path
          :d="donutPath"
          transform="translate(0 0)"
          fill-rule="evenodd"
          clip-rule="evenodd"
          :class="concreteClassName"
        />

        <!-- 鉄筋位置の中心線 -->
        <circle
          cx="0"
          cy="0"
          :r="displayRebarRadius"
          :stroke-dasharray="dashDotLine"
          class="fill-none stroke-gray-600"
        />

        <!-- 鉄筋群 -->
        <circle
          v-for="rebar in rebarCircles"
          :key="rebar.key"
          :cx="rebar.cx"
          :cy="rebar.cy"
          :r="rebar.r"
          :class="rebarClassName"
        />

        <!-- 外径の中心線 -->
        <g
          :class="strokeClassName"
          aria-hidden="true"
        >
          <line
            v-for="(dir, index) in centerMarkDirections"
            :key="index"
            x1="0"
            y1="0"
            :x2="dir[0] * displayOuterRadius * 1.15"
            :y2="dir[1] * displayOuterRadius * 1.15"
            :stroke-width="strokeWidth"
            :stroke-dasharray="dashDotLine"
            stroke-linecap="round"
          />
        </g>

        <!-- 中立軸の水平寸法 -->
        <g
          v-if="geometryIsValid"
          :class="strokeClassName"
          aria-hidden="true"
        >
          <line
            :x1="neutralAxisLine ?? 0"
            :y1="displayOuterRadius * 1.15 + 10"
            :x2="0"
            :y2="displayOuterRadius * 1.15 + 10"
            stroke-width="1"
            stroke="currentColor"
          />
          <line
            :x1="neutralAxisLine ?? 0"
            :y1="displayOuterRadius * 1.15 + 10"
            :x2="neutralAxisLine ?? 0"
            :y2="displayOuterRadius * 1.15 + 40"
            stroke-width="1"
            stroke="currentColor"
          />
          <line
            x1="0"
            :y1="displayOuterRadius * 1.15 + 10"
            x2="0"
            :y2="displayOuterRadius * 1.15 + 40"
            stroke-width="1"
            stroke="currentColor"
          />
          <line
            :x1="neutralAxisLine ?? 0"
            :y1="displayOuterRadius * 1.15 + 40"
            :x2="0"
            :y2="displayOuterRadius * 1.15 + 40"
            stroke-width="1"
            stroke="currentColor"
            marker-start="url(#dimension-arrow)"
            marker-end="url(#dimension-arrow)"
          />
          <text
            :x="(neutralAxisLine ?? 0) / 2"
            :y="displayOuterRadius * 1.15 + 34"
            text-anchor="middle"
            font-size="24"
            fill="currentColor"
            class="font-mono"
          >
            x
          </text>
        </g>

        <!-- 中立軸 -->
        <g
          v-if="neutralAxisLine !== null"
          :class="neutralAxisClassName"
          aria-hidden="true"
        >
          <line
            v-for="(dir, index) in verticalCenterLineDirections"
            :key="index"
            :x1="neutralAxisLine"
            y1="0"
            :x2="neutralAxisLine + dir[0] * displayOuterRadius * 1.15"
            :y2="dir[1] * displayOuterRadius * 1.15"
            :stroke-width="strokeWidth"
            :stroke-dasharray="dashDotLine"
            stroke-linecap="round"
          />
        </g>

        <!-- 寸法線（外径半径） -->
        <g
          v-if="geometryIsValid"
          :class="strokeClassName"
          transform="translate(0 0) rotate(-15)"
          aria-hidden="true"
        >
          <line
            x1="0"
            y1="0"
            :x2="displayOuterRadius"
            y2="0"
            stroke-width="1"
            stroke="currentColor"
            marker-end="url(#dimension-arrow)"
          />
          <line
            :x1="displayOuterRadius"
            y1="0"
            :x2="displayOuterRadius + 48"
            y2="0"
            stroke-width="1"
            stroke="currentColor"
          />
          <text
            :x="displayOuterRadius + 24"
            y="-6"
            text-anchor="middle"
            font-size="24"
            fill="currentColor"
            class="font-mono"
          >
            r
          </text>
        </g>

        <!-- 寸法線（鉄筋位置） -->
        <g
          v-if="geometryIsValid"
          :class="strokeClassName"
          transform="translate(0 0) rotate(-35)"
          aria-hidden="true"
        >
          <line
            x1="0"
            y1="0"
            :x2="displayRebarRadius"
            y2="0"
            stroke-width="1"
            stroke="currentColor"
            marker-end="url(#dimension-arrow)"
          />
          <line
            :x1="displayRebarRadius"
            y1="0"
            :x2="displayRebarRadius + 48"
            y2="0"
            stroke-width="1"
            stroke="currentColor"
          />
          <text
            :x="displayRebarRadius + 24"
            y="-6"
            text-anchor="middle"
            font-size="24"
            fill="currentColor"
            class="font-mono"
          >
            rs
          </text>
        </g>

        <!-- 寸法線（内径半径） -->
        <g
          v-if="geometryIsValid"
          :class="strokeClassName"
          transform="translate(0 0) rotate(-55)"
          aria-hidden="true"
        >
          <line
            x1="0"
            y1="0"
            :x2="displayInnerRadius"
            y2="0"
            stroke-width="1"
            stroke="currentColor"
            marker-end="url(#dimension-arrow)"
          />
          <line
            :x1="displayInnerRadius"
            y1="0"
            :x2="displayInnerRadius + 48"
            y2="0"
            stroke-width="1"
            stroke="currentColor"
          />
          <text
            :x="displayInnerRadius + 24"
            y="-6"
            text-anchor="middle"
            font-size="24"
            fill="currentColor"
            class="font-mono"
          >
            r0
          </text>
        </g>
      </svg>
    </div>

    <div class="flex gap-3 text-xs text-slate-600">
      <div class="flex items-center gap-2">
        <span
          aria-hidden="true"
          :class="cn('h-3 w-3 rounded-sm bg-current', concreteClassName)"
        />
        <span>コンクリート</span>
      </div>
      <div class="flex items-center gap-2">
        <span
          aria-hidden="true"
          :class="cn('h-3 w-3 rounded-sm bg-current', rebarClassName)"
        />
        <span>鉄筋</span>
      </div>
      <div class="flex items-center gap-2">
        <span
          aria-hidden="true"
          :class="cn('h-4 w-0 border-l-2 border-dashed border-t-current', neutralAxisClassName)"
        />
        <span>中立軸</span>
      </div>
    </div>
  </div>
</template>

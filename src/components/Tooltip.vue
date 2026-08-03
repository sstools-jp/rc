<script setup lang="ts">
import { computed, ref } from "vue";
import { useFloating, offset, flip, shift, arrow, autoUpdate, type Placement } from "@floating-ui/vue";
import MarkdownIt from "markdown-it";
import markdownItKatex from "markdown-it-katex";
import type { TooltipContent, TooltipContentValue } from "@/types/tooltip-content";

const props = withDefaults(
  defineProps<{
    content?: TooltipContentValue;
    delay?: number;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
    sideOffset?: number;
    alignOffset?: number;
  }>(),
  {
    delay: 200,
    side: "top",
    align: "start",
    sideOffset: 8,
    alignOffset: -9,
  },
);

const isOpen = ref(false);
const triggerRef = ref<HTMLElement | null>(null);
const popupRef = ref<HTMLElement | null>(null);
const arrowRef = ref<HTMLElement | null>(null);
let openTimeoutId: ReturnType<typeof setTimeout> | null = null;
let closeTimeoutId: ReturnType<typeof setTimeout> | null = null;

const { floatingStyles, middlewareData } = useFloating(triggerRef, popupRef, {
  placement: computed<Placement>(() => {
    if (props.align === "center") {
      return props.side;
    }
    return `${props.side}-${props.align}`;
  }),
  middleware: computed(() => [
    offset(props.sideOffset),
    flip(),
    shift({ padding: 8 }),
    arrow({ element: arrowRef }),
  ]),
  whileElementsMounted: autoUpdate,
});

const arrowStyle = computed(() => {
  const arrowData = middlewareData.value.arrow;
  if (!arrowData) return {};
  return {
    left: arrowData.x != null ? `${arrowData.x}px` : undefined,
    top: arrowData.y != null ? `${arrowData.y}px` : undefined,
  };
});

// マウスが入った時の処理（表示遅延）
function handleMouseEnter() {
  if (closeTimeoutId) clearTimeout(closeTimeoutId);

  openTimeoutId = setTimeout(() => {
    isOpen.value = true;
  }, props.delay);
}

// マウスが離れた時の処理（非表示遅延）
function handleMouseLeave() {
  if (openTimeoutId) clearTimeout(openTimeoutId);

  closeTimeoutId = setTimeout(() => {
    isOpen.value = false;
  }, 200);
}

// クリック時の処理（トグル）
function handleClick() {
  // タイマーをクリア
  if (openTimeoutId) clearTimeout(openTimeoutId);
  if (closeTimeoutId) clearTimeout(closeTimeoutId);

  isOpen.value = !isOpen.value;
}

const md = new MarkdownIt();
md.use(markdownItKatex);

function renderMarkdown(content: string): string {
  return md.render(content);
}

function isTooltipContent(value: unknown): value is TooltipContent {
  return typeof value === "object" && value !== null && "line" in value;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}
</script>

<template>
  <div class="tooltip-wrapper">
    <button
      ref="triggerRef"
      type="button"
      class="tooltip-button"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @click="handleClick"
    >
      <slot />
    </button>

    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="popupRef"
        :style="floatingStyles"
        class="tooltip-popup-container"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
      >
        <div class="tooltip-popup">
          <div ref="arrowRef" class="tooltip-arrow" :style="arrowStyle" />
          <template v-if="content">
            <template v-if="Array.isArray(content)">
              <div class="tooltip-content-list">
                <template v-for="(item, index) in content" :key="index">
                  <hr v-if="index > 0" class="tooltip-separator" />
                  <TooltipContentRenderer :content="item" />
                </template>
              </div>
            </template>
            <template v-else-if="isString(content)">
              <div class="tooltip-text" v-html="renderMarkdown(content)" />
            </template>
            <template v-else-if="isTooltipContent(content)">
              <template v-if="content.nestedLines && content.nestedLines.length > 0">
                <Tooltip
                  :content="content.nestedLines"
                  :delay="delay"
                  :side="side"
                  :align="align"
                  :side-offset="sideOffset"
                  :align-offset="alignOffset"
                >
                  <div class="tooltip-text" v-html="renderMarkdown(content.line)" />
                </Tooltip>
              </template>
              <template v-else>
                <div class="tooltip-text" v-html="renderMarkdown(content.line)" />
              </template>
            </template>
          </template>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.tooltip-wrapper {
  @apply inline-flex;
}

.tooltip-button {
  @apply cursor-help rounded border-0 bg-transparent px-0.5 mix-blend-multiply outline-none hover:bg-slate-100;
}

.tooltip-popup-container {
  @apply z-50;
}

.tooltip-popup {
  @apply relative box-border flex max-w-full flex-col rounded-sm border border-gray-500 bg-white p-2 leading-5 shadow-lg outline-none;
}

.tooltip-content-list {
  @apply flex flex-col gap-2;
}

.tooltip-separator {
  @apply my-1 border-slate-200;
}

.tooltip-text {
  @apply text-left text-sm;
}

.tooltip-arrow {
  display: block;
  position: relative;
  width: 12px;
  height: 6px;
  overflow: clip;
}

.tooltip-arrow[data-side="top"] {
  bottom: -6px;
  rotate: 180deg;
}

.tooltip-arrow[data-side="bottom"] {
  top: -6px;
  rotate: 0deg;
}

.tooltip-arrow[data-side="left"] {
  right: -9px;
  rotate: 90deg;
}

.tooltip-arrow[data-side="right"] {
  left: -9px;
  rotate: -90deg;
}

.tooltip-arrow::before {
  content: "";
  display: block;
  position: absolute;
  bottom: 0;
  left: 50%;
  box-sizing: border-box;
  width: calc(6px * sqrt(2));
  height: calc(6px * sqrt(2));
  background-color: white;
  border: 1px solid #6a7282;
  transform: translate(-50%, 50%) rotate(45deg);
}
</style>

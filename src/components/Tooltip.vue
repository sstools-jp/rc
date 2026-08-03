<script setup lang="ts">
import { computed, ref } from "vue";
import { useFloating, offset, flip, shift, arrow, autoUpdate, type Placement } from "@floating-ui/vue";
import MarkdownIt from "markdown-it";
import markdownItKatex from "markdown-it-katex";
import styles from "@/components/Tooltip.module.css";
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
  <div class="inline-flex">
    <button
      ref="triggerRef"
      type="button"
      class="cursor-help rounded border-0 bg-transparent px-0.5 mix-blend-multiply outline-none hover:bg-slate-100"
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
        class="z-50"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
      >
        <div
          class="relative box-border flex max-w-full flex-col rounded-sm border border-gray-500 bg-white p-2 leading-5 shadow-lg outline-none"
        >
          <div ref="arrowRef" :class="styles.Arrow" :style="arrowStyle" />
          <template v-if="content">
            <template v-if="Array.isArray(content)">
              <div class="flex flex-col gap-2">
                <template v-for="(item, index) in content" :key="index">
                  <hr v-if="index > 0" class="my-1 border-slate-200" />
                  <TooltipContentRenderer :content="item" />
                </template>
              </div>
            </template>
            <template v-else-if="isString(content)">
              <div class="text-left text-sm" v-html="renderMarkdown(content)" />
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
                  <div class="text-left text-sm" v-html="renderMarkdown(content.line)" />
                </Tooltip>
              </template>
              <template v-else>
                <div class="text-left text-sm" v-html="renderMarkdown(content.line)" />
              </template>
            </template>
          </template>
        </div>
      </div>
    </Teleport>
  </div>
</template>

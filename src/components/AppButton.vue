<script setup lang="ts">
import { cn } from "@/utils/cn";
import type { Component } from "vue";

type AppButtonVariant = "primary" | "secondary";
type AppButtonSize = "md" | "sm";

const props = withDefaults(
  defineProps<{
    /** ボタンのスタイル */
    variant?: AppButtonVariant;
    /** ボタンのサイズ */
    size?: AppButtonSize;
    /** ボタン左側に表示するアイコン */
    icon?: Component;
    className?: string;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    ariaLabel?: string;
  }>(),
  {
    variant: "secondary",
    size: "sm",
    type: "button",
    disabled: false,
  },
);

/** ボタン種類毎のスタイルを定義 */
const variantClassNames: Record<AppButtonVariant, string> = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-500 disabled:text-white/70",
  secondary:
    "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400",
};

/** サイズ毎のスタイルを定義 */
const sizeClassNames: Record<AppButtonSize, string> = {
  md: "min-h-9 px-5 text-sm",
  sm: "min-h-8 px-4 text-sm",
};

const buttonClass = cn(
  "group inline-flex items-center justify-center gap-1.5 rounded-xs transition-colors",
  sizeClassNames[props.size],
  variantClassNames[props.variant],
  props.icon ? "px-2" : "",
  props.className,
);
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :aria-label="ariaLabel"
    :class="buttonClass"
  >
    <component
      :is="icon"
      v-if="icon"
      class="h-5 w-5 shrink-0"
      aria-hidden="true"
    />
    <span class="pt-0.5 transition-transform duration-75 group-active:translate-y-px">
      <slot />
    </span>
  </button>
</template>

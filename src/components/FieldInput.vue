<script setup lang="ts">
import { cn } from "@/utils/cn";

withDefaults(
  defineProps<{
    value: string;
    inputMode?: "decimal" | "numeric";
    readOnly?: boolean;
  }>(),
  {
    inputMode: "decimal",
    readOnly: false,
  },
);

const emit = defineEmits<{
  change: [value: string];
  blur: [value: string];
}>();

const className = cn(
  "box-border block h-full w-full [appearance:textfield] border border-transparent px-1 py-0.5 text-right font-mono outline-none placeholder:text-slate-400",
  "focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 focus:ring-inset",
  "read-only:bg-slate-50 read-only:text-slate-600 read-only:caret-transparent read-only:focus:border-transparent read-only:focus:ring-0",
  "[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
);

function handleFocus(event: FocusEvent) {
  (event.currentTarget as HTMLInputElement).select();
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === "ArrowUp" || event.key === "ArrowDown") {
    event.preventDefault();
  }
}

function handleWheel(event: WheelEvent) {
  (event.currentTarget as HTMLInputElement).blur();
}

function handleInput(event: Event) {
  emit("change", (event.target as HTMLInputElement).value);
}

function handleBlur(event: FocusEvent) {
  emit("blur", (event.currentTarget as HTMLInputElement).value);
}
</script>

<template>
  <input
    type="number"
    :inputmode="inputMode"
    step="any"
    :class="className"
    :value="value"
    :readonly="readOnly"
    :aria-readonly="readOnly"
    @focus="handleFocus"
    @keydown="handleKeyDown"
    @wheel="handleWheel"
    @input="handleInput"
    @blur="handleBlur"
  >
</template>

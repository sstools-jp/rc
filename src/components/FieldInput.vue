<script setup lang="ts">
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
    class="field-input"
    :value="value"
    :readonly="readOnly"
    :aria-readonly="readOnly"
    @focus="handleFocus"
    @keydown="handleKeyDown"
    @wheel="handleWheel"
    @input="handleInput"
    @blur="handleBlur"
  />
</template>

<style scoped>
@reference "tailwindcss";

.field-input {
  @apply box-border block h-full w-full border border-transparent px-1 py-0.5 text-right font-mono outline-none placeholder:text-slate-400;
  @apply focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 focus:ring-inset;
  @apply read-only:bg-slate-50 read-only:text-slate-600 read-only:caret-transparent read-only:focus:border-transparent read-only:focus:ring-0;
  appearance: textfield;
}

.field-input::-webkit-inner-spin-button,
.field-input::-webkit-outer-spin-button {
  appearance: none;
  margin: 0;
}
</style>

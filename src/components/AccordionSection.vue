<script setup lang="ts">
/**
 * タイトル行のクリックで開閉可能なブロック
 */

import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/vue";
import { FeChevronRight } from "@kalimahapps/vue-icons/fe";
import { usePersistedSectionCollapse } from "@/composables/usePersistedSectionCollapse";

const props = withDefaults(
  defineProps<{
    title: string;
    defaultOpen?: boolean;
  }>(),
  {
    defaultOpen: false,
  },
);

const { isOpen, toggleOpen } = usePersistedSectionCollapse(props.title, props.defaultOpen);
</script>

<template>
  <Disclosure :default-open="isOpen">
    <template #default="{ open }">
      <section class="accordion-section">
        <h3 class="accordion-header">
          <DisclosureButton as="button" :aria-expanded="open" class="accordion-button" @click="toggleOpen">
            <FeChevronRight
              aria-hidden="true"
              class="accordion-icon"
              :class="open ? 'rotate-90' : 'rotate-0'"
            />
            <span>{{ title }}</span>
          </DisclosureButton>
        </h3>

        <DisclosurePanel class="accordion-panel">
          <slot />
        </DisclosurePanel>
      </section>
    </template>
  </Disclosure>
</template>

<style scoped>
@reference "tailwindcss";

.accordion-section {
  @apply space-y-1;
}

.accordion-header {
  @apply flex items-center justify-between gap-1;
}

.accordion-button {
  @apply flex items-center rounded py-0.5 pr-1 text-left text-sm text-slate-800 outline-none hover:bg-slate-100 hover:text-black;
}

.accordion-icon {
  @apply h-4 w-4 shrink-0;
}

.accordion-panel {
  @apply mb-2 overflow-hidden border border-slate-400 bg-slate-50/80;
}
</style>

<script setup lang="ts">
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/vue";
import { FeChevronRight } from "@kalimahapps/vue-icons/fe";
import { usePersistedSectionCollapse } from "@/composables/usePersistedSectionCollapse";
import { cn } from "@/utils/cn";

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
      <section class="space-y-1">
        <h3 class="flex items-center justify-between gap-1">
          <DisclosureButton
            as="button"
            :aria-expanded="open"
            class="flex items-center rounded py-0.5 pr-1 text-left text-sm text-slate-800 outline-none hover:bg-slate-100 hover:text-black"
            @click="toggleOpen"
          >
            <FeChevronRight
              aria-hidden="true"
              :class="cn('h-4 w-4 shrink-0', open ? 'rotate-90' : 'rotate-0')"
            />
            <span>{{ title }}</span>
          </DisclosureButton>
        </h3>

        <DisclosurePanel class="mb-2 overflow-hidden border border-slate-400 bg-slate-50/80">
          <slot />
        </DisclosurePanel>
      </section>
    </template>
  </Disclosure>
</template>

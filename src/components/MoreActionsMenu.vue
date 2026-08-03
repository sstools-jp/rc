<script setup lang="ts">
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
import { LuCheck } from "@kalimahapps/vue-icons/lu";
import { FeMoreHorizontal } from "@kalimahapps/vue-icons/fe";
import { cn } from "@/utils/cn";
import type { VNode } from "vue";

export type MoreActionItem = {
  /** key の指定は任意 */
  key?: string;
  label: string | VNode;
  onClick: () => void;
  disabled?: boolean;
  selected?: boolean;
};

export type MoreActionGroup = {
  key: string;
  label: string | VNode;
  items: MoreActionItem[];
};

const props = withDefaults(
  defineProps<{
    items?: MoreActionItem[];
    groups?: MoreActionGroup[];
    ariaLabel?: string;
    className?: string;
    align?: "right" | "left";
  }>(),
  {
    ariaLabel: "その他の操作",
    className: "",
    align: "right",
  },
);

const anchor =
  props.align === "right"
    ? { to: "bottom end" as const, gap: 2, padding: 8 }
    : { to: "bottom start" as const, gap: 6, padding: 8 };
</script>

<template>
  <Menu
    as="div"
    :class="`relative inline-flex ${className}`"
  >
    <MenuButton
      :aria-label="ariaLabel"
      class="rounded-sm p-0.5 hover:bg-slate-100 focus:outline-none"
    >
      <FeMoreHorizontal
        class="h-4.5 w-4.5 text-slate-700"
        aria-hidden="true"
      />
    </MenuButton>

    <MenuItems
      :anchor="anchor"
      class="z-20 w-max max-w-[calc(100vw-1rem)] min-w-40 rounded-sm bg-white p-1 shadow-lg ring-1 ring-slate-200/60 focus:outline-none"
    >
      <template v-if="groups">
        <template
          v-for="(group, groupIndex) in groups"
          :key="group.key"
        >
          <!-- セパレータは2番目以降のグループの前にのみ表示 -->
          <hr
            v-if="groupIndex > 0"
            role="separator"
            aria-hidden="true"
            class="my-1 border-t border-slate-200"
          >
          <!-- グループラベルを表示 -->
          <div class="px-2 py-1.5 text-sm font-normal text-slate-800">
            {{ group.label }}
          </div>
          <!-- グループ内のアイテムを表示 -->
          <MenuItem
            v-for="(entry, idx) in group.items"
            :key="entry.key ?? `${group.key}-${idx}`"
            :disabled="Boolean(entry?.disabled)"
          >
            <template #default="{ active, disabled }">
              <button
                type="button"
                :disabled="disabled"
                :class="
                  cn(
                    'flex w-full items-center gap-1.5 rounded-sm px-2 py-1.5 text-left text-sm',
                    entry.selected && 'bg-sky-50 text-sky-800',
                    active && 'bg-slate-50',
                    !entry.selected && !active && 'text-slate-800',
                    disabled && 'text-slate-300',
                  )
                "
                @click="entry.onClick"
              >
                <LuCheck
                  v-if="entry.selected"
                  class="h-4 w-4 shrink-0 text-sky-700"
                  aria-hidden="true"
                />
                <span
                  v-else
                  class="h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                <span class="whitespace-nowrap">{{ entry.label }}</span>
              </button>
            </template>
          </MenuItem>
        </template>
      </template>
      <template v-else-if="items">
        <MenuItem
          v-for="(entry, idx) in items"
          :key="entry.key ?? `items-${idx}`"
          :disabled="Boolean(entry?.disabled)"
        >
          <template #default="{ active, disabled }">
            <button
              type="button"
              :disabled="disabled"
              :class="
                cn(
                  'flex w-full items-center gap-2 rounded-sm px-3 py-1.5 text-left text-sm',
                  entry.selected && 'bg-sky-50 text-sky-800',
                  active && 'bg-slate-50',
                  !entry.selected && !active && 'text-slate-800',
                  disabled && 'text-slate-300',
                )
              "
              @click="entry.onClick"
            >
              <LuCheck
                v-if="entry.selected"
                class="h-4 w-4 shrink-0 text-sky-700"
                aria-hidden="true"
              />
              <span
                v-else
                class="h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              <span class="whitespace-nowrap">{{ entry.label }}</span>
            </button>
          </template>
        </MenuItem>
      </template>
    </MenuItems>
  </Menu>
</template>

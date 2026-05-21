import React from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { LuCheck } from "react-icons/lu";
import { FiMoreHorizontal } from "react-icons/fi";
import { cn } from "@/utils/cn";

export type MoreActionItem = {
  /** key の指定は任意 */
  key?: string;
  label: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  selected?: boolean;
  /** セパレータを指定する場合 true */
  separator?: boolean;
};

export type SeparatorItem = { separator: true };

export type MoreActionGroup = {
  key: string;
  label: React.ReactNode;
  items: (MoreActionItem | SeparatorItem)[];
};

type MoreActionsMenuProps = {
  items?: (MoreActionItem | SeparatorItem)[];
  groups?: MoreActionGroup[];
  ariaLabel?: string;
  className?: string;
  align?: "right" | "left";
};

export function MoreActionsMenu({
  items,
  groups,
  ariaLabel = "その他の操作",
  className = "",
  align = "right",
}: MoreActionsMenuProps) {
  const anchor =
    align === "right"
      ? { to: "bottom end" as const, gap: 2, padding: 8 }
      : { to: "bottom start" as const, gap: 6, padding: 8 };

  /** entry がセパレータ項目の場合 true を返す */
  const isSeparatorItem = (entry: unknown): entry is SeparatorItem =>
    typeof entry === "object" &&
    entry !== null &&
    "separator" in (entry as Record<string, unknown>) &&
    (entry as Record<string, unknown>)["separator"] === true;

  /** アイテム（通常項目またはセパレータ）をレンダリングするヘルパー */
  const renderItem = (
    entry: MoreActionItem | SeparatorItem,
    keyBase: string,
    idx: number,
    isGroup = false,
  ) => {
    const isSep = isSeparatorItem(entry);
    const item = entry as MoreActionItem;
    const key = isSep ? `${keyBase}-sep-${idx}` : (item.key ?? `${keyBase}-${idx}`);
    const buttonClass = isGroup
      ? "flex w-full items-center gap-1.5 rounded-sm px-2 py-1.5 text-left text-sm"
      : "flex w-full items-center gap-2 rounded-sm px-3 py-1.5 text-left text-sm";
    return (
      <MenuItem key={key} disabled={Boolean(item?.disabled) || isSep}>
        {({ active, disabled }) =>
          isSep ? (
            <div className="my-1 border-t border-slate-100" aria-hidden="true" />
          ) : (
            <button
              type="button"
              onClick={item.onClick}
              disabled={disabled}
              className={cn(
                buttonClass,
                item.selected && "bg-sky-50 text-sky-800",
                active && "bg-slate-50",
                !item.selected && !active && "text-slate-800",
                disabled && "text-slate-300",
              )}
            >
              {item.selected ? (
                <LuCheck className="h-4 w-4 shrink-0 text-sky-700" aria-hidden="true" />
              ) : (
                <span className="h-4 w-4 shrink-0" aria-hidden="true" />
              )}
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          )
        }
      </MenuItem>
    );
  };

  return (
    <Menu as="div" className={`relative inline-flex ${className}`}>
      <MenuButton
        aria-label={ariaLabel}
        className="rounded-sm p-0.5 hover:bg-slate-100 focus:ring-2 focus:ring-sky-300 focus:outline-none"
      >
        <FiMoreHorizontal className="h-4.5 w-4.5 text-slate-700" aria-hidden="true" />
      </MenuButton>

      <MenuItems
        anchor={anchor}
        className="z-20 w-max max-w-[calc(100vw-1rem)] min-w-40 rounded-sm bg-white p-1 shadow-lg ring-1 ring-slate-200/60 focus:outline-none"
      >
        {groups
          ? groups.map((group, groupIndex) => (
              <div key={group.key} className={groupIndex > 0 ? "mt-1 border-t border-slate-100 pt-1" : ""}>
                <div className="px-3 py-1.5 text-sm font-normal text-slate-700">{group.label}</div>
                {group.items.map((entry, idx) => renderItem(entry, group.key, idx, true))}
              </div>
            ))
          : items?.map((entry, idx) => renderItem(entry, "items", idx, false))}
      </MenuItems>
    </Menu>
  );
}

export default MoreActionsMenu;

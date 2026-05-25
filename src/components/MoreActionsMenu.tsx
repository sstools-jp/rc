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
};

export type MoreActionGroup = {
  key: string;
  label: React.ReactNode;
  items: MoreActionItem[];
};

type MoreActionsMenuProps = {
  items?: MoreActionItem[];
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

  /** アクション項目コンポーネント */
  function ActionItem({ item, isGroup = false }: { item: MoreActionItem; isGroup?: boolean }) {
    const buttonClass = isGroup
      ? "flex w-full items-center gap-1.5 rounded-sm px-2 py-1.5 text-left text-sm"
      : "flex w-full items-center gap-2 rounded-sm px-3 py-1.5 text-left text-sm";

    return (
      <MenuItem disabled={Boolean(item?.disabled)}>
        {({ active, disabled }) => (
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
        )}
      </MenuItem>
    );
  }

  return (
    <Menu as="div" className={`relative inline-flex ${className}`}>
      <MenuButton aria-label={ariaLabel} className="rounded-sm p-0.5 hover:bg-slate-100 focus:outline-none">
        <FiMoreHorizontal className="h-4.5 w-4.5 text-slate-700" aria-hidden="true" />
      </MenuButton>

      <MenuItems
        anchor={anchor}
        className="z-20 w-max max-w-[calc(100vw-1rem)] min-w-40 rounded-sm bg-white p-1 shadow-lg ring-1 ring-slate-200/60 focus:outline-none"
      >
        {groups
          ? groups.map((group, groupIndex) => (
              // グループがある場合はグループごとにアイテムを表示
              <React.Fragment key={group.key}>
                {/* セパレータは2番目以降のグループの前にのみ表示 */}
                {groupIndex > 0 && (
                  <hr role="separator" aria-hidden="true" className="my-1 border-t border-slate-200" />
                )}
                {/* グループラベルを表示 */}
                <div className="px-2 py-1.5 text-sm font-normal text-slate-800">{group.label}</div>
                {/* グループ内のアイテムを表示 */}
                {group.items.map((entry, idx) => (
                  <ActionItem key={entry.key ?? `${group.key}-${idx}`} item={entry} isGroup />
                ))}
              </React.Fragment>
            ))
          : items?.map((entry, idx) => (
              // グループがない場合は単一アイテムを表示
              <ActionItem key={entry.key ?? `items-${idx}`} item={entry} />
            ))}
      </MenuItems>
    </Menu>
  );
}

export default MoreActionsMenu;

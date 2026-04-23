import { useState } from "react";

const UI_STORAGE_KEY_PREFIX = "rc:ui:";
const RESULT_PANEL_COLLAPSIBLE_SECTION_STORAGE_KEY = `${UI_STORAGE_KEY_PREFIX}result-panel:collapsible`;

/** セクションの折りたたみ状態を永続化するフック */
export function usePersistedSectionCollapse(title: string, defaultOpen = false) {
  const [isOpen, setIsOpen] = useState(() => loadCollapsedState(title, defaultOpen));

  function toggleOpen() {
    setIsOpen((current) => {
      const nextValue = !current;
      saveCollapsedState(title, nextValue);
      return nextValue;
    });
  }

  return {
    isOpen,
    toggleOpen,
  };
}

function loadCollapsedState(title: string, defaultOpen: boolean): boolean {
  if (typeof window === "undefined") {
    return defaultOpen;
  }

  try {
    const storedValue = window.localStorage.getItem(RESULT_PANEL_COLLAPSIBLE_SECTION_STORAGE_KEY);
    if (storedValue === null) {
      return defaultOpen;
    }

    const parsedValue = JSON.parse(storedValue) as unknown;
    if (typeof parsedValue !== "object" || parsedValue === null) {
      return defaultOpen;
    }

    const stateMap = parsedValue as Record<string, unknown>;
    const currentValue = stateMap[title];
    return typeof currentValue === "boolean" ? currentValue : defaultOpen;
  } catch {
    return defaultOpen;
  }
}

function saveCollapsedState(title: string, isOpen: boolean): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const storedValue = window.localStorage.getItem(RESULT_PANEL_COLLAPSIBLE_SECTION_STORAGE_KEY);
    const parsedValue = storedValue ? (JSON.parse(storedValue) as unknown) : {};
    const stateMap =
      typeof parsedValue === "object" && parsedValue !== null ? (parsedValue as Record<string, boolean>) : {};

    window.localStorage.setItem(
      RESULT_PANEL_COLLAPSIBLE_SECTION_STORAGE_KEY,
      JSON.stringify({ ...stateMap, [title]: isOpen }),
    );
  } catch {
    // 保存失敗でも折りたたみ操作は継続する
  }
}

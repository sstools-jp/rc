import { useState, type Dispatch, type SetStateAction } from "react";

const UI_STORAGE_KEY = "rc:ui:annular-section:material-params-visibility";

/** 諸係数の編集可否の状態の型定義 */
type MaterialParamsEditableState = {
  /** ヤング係数比 */
  youngRatio: boolean;
  /** コンクリート強度補正係数 */
  concreteStrengthFactor: boolean;
};

/** 諸係数の編集可否を永続化するフックの返り値の型定義 */
type UsePersistedMaterialParamsEditableResult = {
  /** ヤング係数比の編集可否 */
  youngRatioEditable: boolean;
  /** コンクリート強度補正係数の編集可否 */
  concreteStrengthFactorEditable: boolean;
  /** ヤング係数比の編集可否を設定する関数 */
  setYoungRatioEditable: Dispatch<SetStateAction<boolean>>;
  /** コンクリート強度補正係数の編集可否を設定する関数 */
  setConcreteStrengthFactorEditable: Dispatch<SetStateAction<boolean>>;
};

/** デフォルト状態 */
const DEFAULT_STATE: MaterialParamsEditableState = {
  youngRatio: false,
  concreteStrengthFactor: false,
};

/** 諸係数の編集可否を永続化するフック */
export function usePersistedMaterialParamsEditable(): UsePersistedMaterialParamsEditableResult {
  const [state, setState] = useState<MaterialParamsEditableState>(() => loadState());

  const setYoungRatioEditable: Dispatch<SetStateAction<boolean>> = (nextEditable) => {
    setState((current) => {
      const nextState = {
        ...current,
        youngRatio: typeof nextEditable === "function" ? nextEditable(current.youngRatio) : nextEditable,
      };
      saveState(nextState);
      return nextState;
    });
  };

  const setConcreteStrengthFactorEditable: Dispatch<SetStateAction<boolean>> = (nextEditable) => {
    setState((current) => {
      const nextState = {
        ...current,
        concreteStrengthFactor:
          typeof nextEditable === "function" ? nextEditable(current.concreteStrengthFactor) : nextEditable,
      };
      saveState(nextState);
      return nextState;
    });
  };

  return {
    youngRatioEditable: state.youngRatio,
    concreteStrengthFactorEditable: state.concreteStrengthFactor,
    setYoungRatioEditable,
    setConcreteStrengthFactorEditable,
  };
}

/** ローカルストレージから状態を読み込む関数 */
function loadState(): MaterialParamsEditableState {
  if (typeof window === "undefined") {
    return DEFAULT_STATE;
  }

  try {
    const storedValue = window.localStorage.getItem(UI_STORAGE_KEY);
    if (storedValue === null) {
      return DEFAULT_STATE;
    }

    const parsedValue = JSON.parse(storedValue) as unknown;
    if (typeof parsedValue !== "object" || parsedValue === null) {
      return DEFAULT_STATE;
    }

    const candidate = parsedValue as Record<string, unknown>;

    return {
      youngRatio: typeof candidate.youngRatio === "boolean" ? candidate.youngRatio : DEFAULT_STATE.youngRatio,
      concreteStrengthFactor:
        typeof candidate.concreteStrengthFactor === "boolean"
          ? candidate.concreteStrengthFactor
          : DEFAULT_STATE.concreteStrengthFactor,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

/** ローカルストレージに状態を保存する関数 */
function saveState(state: MaterialParamsEditableState): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(UI_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 保存失敗でも表示切り替えは継続する
  }
}

import { useState, type SubmitEventHandler } from "react";
import {
  AnnularSectionCalculator,
  AnnularSectionGeometry,
  type AnnularSectionResult,
  type AnnularSectionValidationIssue,
} from "@/model/annular-section";
import type {
  SectionForceFormState,
  GeometryFormState,
  MaterialParamsFormState,
  FormState,
} from "@/forms/form-state";
import type { AnnularSectionInput } from "@/model/section-types";
import { type SectionForceMode } from "@/components/SectionForceModeSelector";
import { parseNumber } from "@/utils/number-format";
import type { RebarDiameter_Mm } from "@/model/rebar";
import type { ConcreteDesignStrength_NPerMm2 } from "@/model/concrete";

/** 断面力のデフォルト入力値 */
const DEFAULT_SECTION_FORCE_FORM_STATE: SectionForceFormState = {
  fx_KN: "",
  fy_KN: "",
  fz_KN: "",
  mx_KNm: "",
  my_KNm: "",
  mz_KNm: "",
};

/** 断面形状のデフォルト入力値 */
const DEFAULT_GEOMETRY_FORM_STATE: GeometryFormState = {
  outerRadius_Mm: "",
  innerRadius_Mm: "",
  rebarRadius_Mm: "",
  rebarDiameter_Mm: "22",
  barCount: "",
};

/** 諸係数のデフォルト入力値  */
const DEFAULT_MATERIAL_PARAMS_FORM_STATE: MaterialParamsFormState = {
  youngRatio: "15",
  rebarYieldStrength_NPerMm2: "345",
  concreteDesignStrength_NPerMm2: "30",
};

/** フォームのデフォルト入力値 */
const DEFAULT_FORM_STATE: FormState = {
  ...DEFAULT_SECTION_FORCE_FORM_STATE,
  ...DEFAULT_GEOMETRY_FORM_STATE,
  ...DEFAULT_MATERIAL_PARAMS_FORM_STATE,
};

/** 断面力タイプのデフォルト値 */
const DEFAULT_SECTION_FORCE_MODE: SectionForceMode = "3";

/** ローカルストレージ用のキー */
const FORM_STORAGE_KEY = "rc:annular-section-form";

type StoredPageState = {
  form: FormState;
  sectionForceMode: SectionForceMode;
};

type PageCalculationState = {
  result: AnnularSectionResult | null;
  issues: AnnularSectionValidationIssue[];
  statusMessage: string;
};

/** フォーム状態の型ガード */
function isFormState(value: unknown): value is FormState {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.fx_KN === "string" &&
    typeof candidate.fy_KN === "string" &&
    typeof candidate.fz_KN === "string" &&
    typeof candidate.mx_KNm === "string" &&
    typeof candidate.my_KNm === "string" &&
    typeof candidate.mz_KNm === "string" &&
    typeof candidate.outerRadius_Mm === "string" &&
    typeof candidate.innerRadius_Mm === "string" &&
    typeof candidate.rebarRadius_Mm === "string" &&
    typeof candidate.rebarDiameter_Mm === "string" &&
    typeof candidate.barCount === "string" &&
    typeof candidate.youngRatio === "string" &&
    typeof candidate.rebarYieldStrength_NPerMm2 === "string" &&
    typeof candidate.concreteDesignStrength_NPerMm2 === "string"
  );
}

function isSectionForceMode(value: unknown): value is SectionForceMode {
  return value === "3" || value === "6";
}

/** ローカルストレージからページ状態を読み込む */
function loadPageState(): StoredPageState {
  if (typeof window === "undefined") {
    return {
      form: DEFAULT_FORM_STATE,
      sectionForceMode: DEFAULT_SECTION_FORCE_MODE,
    };
  }

  try {
    const storedValue = window.localStorage.getItem(FORM_STORAGE_KEY);
    if (!storedValue) {
      return {
        form: DEFAULT_FORM_STATE,
        sectionForceMode: DEFAULT_SECTION_FORCE_MODE,
      };
    }

    const parsedValue = JSON.parse(storedValue) as unknown;

    if (typeof parsedValue === "object" && parsedValue !== null) {
      const candidate = parsedValue as Record<string, unknown>;

      if (isFormState(candidate.form)) {
        return {
          form: { ...DEFAULT_FORM_STATE, ...candidate.form },
          sectionForceMode: isSectionForceMode(candidate.sectionForceMode)
            ? candidate.sectionForceMode
            : DEFAULT_SECTION_FORCE_MODE,
        };
      }
    }

    if (isFormState(parsedValue)) {
      return {
        form: { ...DEFAULT_FORM_STATE, ...parsedValue },
        sectionForceMode: DEFAULT_SECTION_FORCE_MODE,
      };
    }

    return {
      form: DEFAULT_FORM_STATE,
      sectionForceMode: DEFAULT_SECTION_FORCE_MODE,
    };
  } catch {
    return {
      form: DEFAULT_FORM_STATE,
      sectionForceMode: DEFAULT_SECTION_FORCE_MODE,
    };
  }
}

/** ページ状態をローカルストレージに保存する */
function savePageState(form: FormState, sectionForceMode: SectionForceMode): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify({ form, sectionForceMode }));
  } catch {
    // 保存に失敗しても計算処理は継続する
  }
}

/** フォームの状態から計算用の入力オブジェクトを構築する */
function buildInput(form: FormState, sectionForceMode: SectionForceMode): AnnularSectionInput {
  const force: AnnularSectionInput["force"] =
    sectionForceMode === "3"
      ? {
          fx_KN: parseNumber(form.fx_KN),
          fy_KN: 0,
          fz_KN: parseNumber(form.fz_KN),
          mx_KNm: 0,
          my_KNm: parseNumber(form.my_KNm),
          mz_KNm: 0,
        }
      : {
          fx_KN: parseNumber(form.fx_KN),
          fy_KN: parseNumber(form.fy_KN),
          fz_KN: parseNumber(form.fz_KN),
          mx_KNm: parseNumber(form.mx_KNm),
          my_KNm: parseNumber(form.my_KNm),
          mz_KNm: parseNumber(form.mz_KNm),
        };

  return {
    force,
    geometry: AnnularSectionGeometry.fromInput({
      outerRadius_Mm: parseNumber(form.outerRadius_Mm),
      innerRadius_Mm: parseNumber(form.innerRadius_Mm),
      rebarRadius_Mm: parseNumber(form.rebarRadius_Mm),
      rebarDiameter_Mm: parseNumber(form.rebarDiameter_Mm) as RebarDiameter_Mm,
      barCount: parseNumber(form.barCount),
    }),
    materialParams: {
      youngRatio: parseNumber(form.youngRatio),
      rebarYieldStrength_NPerMm2: parseNumber(form.rebarYieldStrength_NPerMm2),
      concreteDesignStrength_NPerMm2: parseNumber(
        form.concreteDesignStrength_NPerMm2,
      ) as ConcreteDesignStrength_NPerMm2,
    },
  };
}

/** フォームの状態から計算結果を生成し、入力に問題がある場合は `null` を返す */
function createResult(form: FormState, sectionForceMode: SectionForceMode): AnnularSectionResult | null {
  const calculator = new AnnularSectionCalculator(buildInput(form, sectionForceMode));
  const validationIssues = calculator.validate();

  if (validationIssues.length > 0) {
    return null;
  }

  try {
    return calculator.calculate();
  } catch {
    return null;
  }
}

/** フォームの状態から画面に表示する計算状態を生成する */
function evaluatePageState(form: FormState, sectionForceMode: SectionForceMode): PageCalculationState {
  const calculator = new AnnularSectionCalculator(buildInput(form, sectionForceMode));
  const validationIssues = calculator.validate();

  if (validationIssues.length > 0) {
    return {
      result: null,
      issues: validationIssues,
      statusMessage: "入力値を確認してください。",
    };
  }

  try {
    return {
      result: calculator.calculate(),
      issues: [],
      statusMessage: "計算が完了しました。",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "計算に失敗しました。";

    return {
      result: null,
      issues: [{ field: "force", message }],
      statusMessage: message,
    };
  }
}

type UseAnnularSectionPageStateResult = {
  /** 入力中のフォームの状態 */
  form: FormState;
  /** 確定済みのフォームの状態 */
  committedForm: FormState;
  /** 計算結果 */
  result: AnnularSectionResult | null;
  /** 検証問題リスト */
  issues: AnnularSectionValidationIssue[];
  /** ステータスメッセージ */
  statusMessage: string;
  /** 印刷プレビューモーダルの開閉状態 */
  isPrintPreviewOpen: boolean;
  /** 断面力タイプ */
  sectionForceMode: SectionForceMode;
  handleSubmit: SubmitEventHandler<HTMLFormElement>;
  handleReset: () => void;
  updateField: (field: keyof FormState) => (value: string) => void;
  commitField: (field: keyof FormState) => (value: string) => void;
  updateSectionForceMode: (value: SectionForceMode) => void;
  openPrintPreview: () => void;
  closePrintPreview: () => void;
};

/** 円環断面計算画面の状態とイベントを管理する */
export function useAnnularSectionPageState(): UseAnnularSectionPageStateResult {
  const initialPageState = loadPageState();
  const [form, setForm] = useState<FormState>(initialPageState.form);
  const [committedForm, setCommittedForm] = useState<FormState>(initialPageState.form);
  const [result, setResult] = useState<AnnularSectionResult | null>(() =>
    createResult(initialPageState.form, initialPageState.sectionForceMode),
  );
  const [issues, setIssues] = useState<AnnularSectionValidationIssue[]>([]);
  const [statusMessage, setStatusMessage] = useState("入力を待機しています。");
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [sectionForceMode, setSectionForceMode] = useState<SectionForceMode>(
    initialPageState.sectionForceMode,
  );

  /** フォームの状態を確定し、計算結果を更新する共通処理 */
  const applyCommittedState = (nextForm: FormState, nextSectionForceMode: SectionForceMode) => {
    setCommittedForm(nextForm);
    savePageState(nextForm, nextSectionForceMode);

    const nextState = evaluatePageState(nextForm, nextSectionForceMode);
    setResult(nextState.result);
    setIssues(nextState.issues);
    setStatusMessage(nextState.statusMessage);
  };

  /** フォームの送信イベントハンドラー */
  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    applyCommittedState(form, sectionForceMode);
  };

  /** フォームのリセットイベントハンドラー */
  const handleReset = () => {
    setForm(DEFAULT_FORM_STATE);
    applyCommittedState(DEFAULT_FORM_STATE, DEFAULT_SECTION_FORCE_MODE);
    setIsPrintPreviewOpen(false);
    setSectionForceMode(DEFAULT_SECTION_FORCE_MODE);
  };

  /** フォームの特定のフィールドを更新する関数 */
  const updateField = (field: keyof FormState) => (value: string) => {
    setForm((current: FormState) => ({ ...current, [field]: value }));
  };

  /** フォームの特定のフィールドを確定する関数 */
  const commitField = (field: keyof FormState) => (value: string) => {
    applyCommittedState({ ...committedForm, [field]: value }, sectionForceMode);
  };

  return {
    form,
    committedForm,
    result,
    issues,
    statusMessage,
    isPrintPreviewOpen,
    sectionForceMode,
    handleSubmit,
    handleReset,
    updateField,
    commitField,
    updateSectionForceMode: (value: SectionForceMode) => {
      setSectionForceMode(value);
      applyCommittedState(committedForm, value);
    },
    openPrintPreview: () => setIsPrintPreviewOpen(true),
    closePrintPreview: () => setIsPrintPreviewOpen(false),
  };
}

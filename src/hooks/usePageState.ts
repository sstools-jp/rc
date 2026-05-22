import { useState, type SubmitEventHandler } from "react";
import {
  AnnularSectionCalculator,
  AnnularSectionGeometry,
  type AnnularSectionResult,
  type AnnularSectionValidationIssue,
} from "@/models/annular-section";
import type {
  SectionForceFormState,
  GeometryFormState,
  MaterialParamsFormState,
  FormState,
  RebarStrengthMode,
} from "@/forms/form-state";
import type { AnnularSectionInput } from "@/models/section-types";
import { type SectionForceMode } from "@/components/SectionForceModeSelector";
import { parseNumber } from "@/utils/number-format";
import { getRebarYieldStrengthMm2, isRebarKind, isRebarMaterialName } from "@/models/rebar";
import type { ConcreteDesignStrength_NPerMm2 } from "@/models/concrete";
import {
  loadAnnularSectionPageStateFromStorage,
  resolveAnnularSectionPageStateFromUrl,
  saveAnnularSectionPageStateToStorage,
  type AnnularSectionPageState,
} from "@/utils/annular-section-page-state";

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
  rebarKind: "deformed",
  rebarDiameter_Mm: "22",
  roundRebarDiameter_Mm: "22",
  barCount: "",
};

/** 諸係数のデフォルト入力値  */
const DEFAULT_MATERIAL_PARAMS_FORM_STATE: MaterialParamsFormState = {
  rebarStrengthMode: "material",
  rebarMaterialName: "SD345",
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

type PageCalculationState = {
  result: AnnularSectionResult | null;
  issues: AnnularSectionValidationIssue[];
};

function isRebarStrengthMode(value: unknown): value is RebarStrengthMode {
  return value === "material" || value === "direct";
}

/** フォームの状態が有効であるかを判定する */
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
    (candidate.rebarKind === undefined || typeof candidate.rebarKind === "string") &&
    typeof candidate.rebarDiameter_Mm === "string" &&
    (candidate.roundRebarDiameter_Mm === undefined || typeof candidate.roundRebarDiameter_Mm === "string") &&
    typeof candidate.barCount === "string" &&
    (candidate.rebarStrengthMode === undefined || typeof candidate.rebarStrengthMode === "string") &&
    (candidate.rebarMaterialName === undefined || typeof candidate.rebarMaterialName === "string") &&
    typeof candidate.youngRatio === "string" &&
    typeof candidate.rebarYieldStrength_NPerMm2 === "string" &&
    typeof candidate.concreteDesignStrength_NPerMm2 === "string"
  );
}

/** フォームの状態を正規化する */
function normalizeMaterialParamsFormState(rawForm: Record<string, unknown>): FormState {
  const form = { ...DEFAULT_FORM_STATE, ...rawForm } as FormState;
  const isLegacyForm = !("rebarStrengthMode" in rawForm) && !("rebarMaterialName" in rawForm);
  const rebarStrengthMode =
    isLegacyForm || !isRebarStrengthMode(form.rebarStrengthMode) ? "material" : form.rebarStrengthMode;
  const rebarMaterialName = isRebarMaterialName(form.rebarMaterialName) ? form.rebarMaterialName : "SD345";

  return {
    ...form,
    rebarStrengthMode,
    rebarMaterialName,
    rebarYieldStrength_NPerMm2:
      rebarStrengthMode === "material"
        ? String(getRebarYieldStrengthMm2(rebarMaterialName))
        : form.rebarYieldStrength_NPerMm2,
  };
}

/** 保存済みJSONからページ状態を復元する */
function resolveStoredFormState(value: unknown): AnnularSectionPageState | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const candidate = value as Record<string, unknown>;

  if (isFormState(candidate.form)) {
    return {
      form: normalizeMaterialParamsFormState(candidate.form),
      sectionForceMode: resolveStoredSectionForceMode(candidate),
    };
  }

  if (isFormState(value)) {
    return {
      form: normalizeMaterialParamsFormState(value),
      sectionForceMode: resolveStoredSectionForceMode(candidate),
    };
  }

  return null;
}

/** 有効な断面力タイプであるかを判定する */
function isSectionForceMode(value: unknown): value is SectionForceMode {
  return value === "3" || value === "6";
}

/** 保存データから断面力モードを復元する */
function resolveStoredSectionForceMode(value: unknown): SectionForceMode {
  if (
    typeof value === "object" &&
    value !== null &&
    isSectionForceMode((value as Record<string, unknown>).sectionForceMode)
  ) {
    return (value as Record<string, unknown>).sectionForceMode as SectionForceMode;
  }

  return DEFAULT_SECTION_FORCE_MODE;
}

/** 初期ページ状態 */
const DEFAULT_PAGE_STATE: AnnularSectionPageState = {
  form: DEFAULT_FORM_STATE,
  sectionForceMode: DEFAULT_SECTION_FORCE_MODE,
};

/** ローカルストレージからページ状態を読み込む */
function loadPageState(): AnnularSectionPageState {
  const urlState = resolveAnnularSectionPageStateFromUrl(
    DEFAULT_PAGE_STATE,
    normalizeMaterialParamsFormState,
  );

  if (urlState) {
    return urlState;
  }

  return loadAnnularSectionPageStateFromStorage(FORM_STORAGE_KEY, DEFAULT_PAGE_STATE, resolveStoredFormState);
}

/** ページ状態をローカルストレージに保存する */
function savePageState(form: FormState, sectionForceMode: SectionForceMode): void {
  saveAnnularSectionPageStateToStorage(FORM_STORAGE_KEY, form, sectionForceMode);
}

/** フォームの状態から計算用の入力オブジェクトを構築する */
function buildInput(form: FormState, sectionForceMode: SectionForceMode): AnnularSectionInput {
  const rebarKind = isRebarKind(form.rebarKind) ? form.rebarKind : "deformed";
  const rebarDiameter_Mm =
    rebarKind === "round" ? parseNumber(form.roundRebarDiameter_Mm) : parseNumber(form.rebarDiameter_Mm);
  const rebarYieldStrength_NPerMm2 =
    form.rebarStrengthMode === "material"
      ? getRebarYieldStrengthMm2(form.rebarMaterialName)
      : parseNumber(form.rebarYieldStrength_NPerMm2);

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
      rebarKind,
      rebarDiameter_Mm,
      barCount: parseNumber(form.barCount),
    }),
    materialParams: {
      youngRatio: parseNumber(form.youngRatio),
      rebarYieldStrength_NPerMm2,
      concreteDesignStrength_NPerMm2: parseNumber(
        form.concreteDesignStrength_NPerMm2,
      ) as ConcreteDesignStrength_NPerMm2,
    },
  };
}

/** フォームの状態から画面に表示する計算状態を生成する */
function evaluatePageState(form: FormState, sectionForceMode: SectionForceMode): PageCalculationState {
  const calculator = new AnnularSectionCalculator(buildInput(form, sectionForceMode));
  const validationIssues = calculator.validate();

  if (validationIssues.length > 0) {
    return {
      result: null,
      issues: validationIssues,
    };
  }

  try {
    return {
      result: calculator.calculate(),
      issues: [],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "計算に失敗しました。";

    return {
      result: null,
      issues: [{ field: "force", message }],
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
  const initialEvaluation = evaluatePageState(initialPageState.form, initialPageState.sectionForceMode);
  const [form, setForm] = useState<FormState>(initialPageState.form);
  const [committedForm, setCommittedForm] = useState<FormState>(initialPageState.form);
  const [result, setResult] = useState<AnnularSectionResult | null>(initialEvaluation.result);
  const [issues, setIssues] = useState<AnnularSectionValidationIssue[]>(initialEvaluation.issues);
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
    isPrintPreviewOpen,
    sectionForceMode,
    handleSubmit,
    handleReset,
    updateField,
    commitField,
    updateSectionForceMode: (value: SectionForceMode) => {
      setSectionForceMode(value);
      applyCommittedState(form, value);
    },
    openPrintPreview: () => setIsPrintPreviewOpen(true),
    closePrintPreview: () => setIsPrintPreviewOpen(false),
  };
}

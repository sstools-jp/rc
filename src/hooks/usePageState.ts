import { useEffect, useState, type SubmitEventHandler } from "react";
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

/** 断面力のデフォルト入力値 */
const DEFAULT_SECTION_FORCE_FORM_STATE: SectionForceFormState = {
  fxKN: "",
  fyKN: "",
  fzKN: "",
  mxKNm: "",
  myKNm: "",
  mzKNm: "",
};

/** 断面形状のデフォルト入力値 */
const DEFAULT_GEOMETRY_FORM_STATE: GeometryFormState = {
  outerRadiusMm: "",
  innerRadiusMm: "",
  rebarRadiusMm: "",
  rebarDiameterMm: "22",
  barCount: "",
};

/** 諸係数のデフォルト入力値  */
const DEFAULT_MATERIAL_PARAMS_FORM_STATE: MaterialParamsFormState = {
  youngRatio: "15",
  rebarYieldStrengthNPerMm2: "345",
  concreteDesignStrengthNPerMm2: "30",
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

/** フォーム状態の型ガード */
function isFormState(value: unknown): value is FormState {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.momentKNm === "string" &&
    typeof candidate.shearKN === "string" &&
    typeof candidate.axialKN === "string" &&
    typeof candidate.fxKN === "string" &&
    typeof candidate.fyKN === "string" &&
    typeof candidate.fzKN === "string" &&
    typeof candidate.mxKNm === "string" &&
    typeof candidate.myKNm === "string" &&
    typeof candidate.mzKNm === "string" &&
    typeof candidate.outerRadiusMm === "string" &&
    typeof candidate.innerRadiusMm === "string" &&
    typeof candidate.rebarRadiusMm === "string" &&
    typeof candidate.rebarDiameterMm === "string" &&
    typeof candidate.barCount === "string" &&
    typeof candidate.youngRatio === "string" &&
    typeof candidate.rebarYieldStrengthNPerMm2 === "string" &&
    typeof candidate.concreteDesignStrengthNPerMm2 === "string"
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
          fxKN: parseNumber(form.fxKN),
          fyKN: 0,
          fzKN: parseNumber(form.fzKN),
          mxKNm: 0,
          myKNm: parseNumber(form.myKNm),
          mzKNm: 0,
        }
      : {
          fxKN: parseNumber(form.fxKN),
          fyKN: parseNumber(form.fyKN),
          fzKN: parseNumber(form.fzKN),
          mxKNm: parseNumber(form.mxKNm),
          myKNm: parseNumber(form.myKNm),
          mzKNm: parseNumber(form.mzKNm),
        };

  return {
    force,
    geometry: AnnularSectionGeometry.fromInput({
      outerRadiusMm: parseNumber(form.outerRadiusMm),
      innerRadiusMm: parseNumber(form.innerRadiusMm),
      rebarRadiusMm: parseNumber(form.rebarRadiusMm),
      rebarDiameterMm: parseNumber(
        form.rebarDiameterMm,
      ) as AnnularSectionInput["geometry"]["rebarDiameterMm"],
      barCount: parseNumber(form.barCount),
    }),
    materialParams: {
      youngRatio: parseNumber(form.youngRatio),
      rebarYieldStrengthNPerMm2: parseNumber(form.rebarYieldStrengthNPerMm2),
      concreteDesignStrength_NPerMm2: parseNumber(
        form.concreteDesignStrengthNPerMm2,
      ) as AnnularSectionInput["materialParams"]["concreteDesignStrength_NPerMm2"],
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

type UseAnnularSectionPageStateResult = {
  /** フォームの状態 */
  form: FormState;
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
  updateSectionForceMode: (value: SectionForceMode) => void;
  openPrintPreview: () => void;
  closePrintPreview: () => void;
};

/** 円環断面計算画面の状態とイベントを管理する */
export function useAnnularSectionPageState(): UseAnnularSectionPageStateResult {
  const initialPageState = loadPageState();
  const [form, setForm] = useState<FormState>(initialPageState.form);
  const [result, setResult] = useState<AnnularSectionResult | null>(() =>
    createResult(initialPageState.form, initialPageState.sectionForceMode),
  );
  const [issues, setIssues] = useState<AnnularSectionValidationIssue[]>([]);
  const [statusMessage, setStatusMessage] = useState("入力を待機しています。");
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [sectionForceMode, setSectionForceMode] = useState<SectionForceMode>(
    initialPageState.sectionForceMode,
  );

  useEffect(() => {
    savePageState(form, sectionForceMode);
  }, [form, sectionForceMode]);

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const input = buildInput(form, sectionForceMode);
    const calculator = new AnnularSectionCalculator(input);
    const validationIssues = calculator.validate();

    if (validationIssues.length > 0) {
      setIssues(validationIssues);
      setResult(null);
      setIsPrintPreviewOpen(false);
      setStatusMessage("入力値を確認してください。");
      return;
    }

    try {
      const nextResult = calculator.calculate();
      setResult(nextResult);
      setIssues([]);
      setStatusMessage("計算が完了しました。");
    } catch (error) {
      const message = error instanceof Error ? error.message : "計算に失敗しました。";
      setIssues([{ field: "force", message }]);
      setResult(null);
      setIsPrintPreviewOpen(false);
      setStatusMessage(message);
    }
  };

  const handleReset = () => {
    setForm(DEFAULT_FORM_STATE);
    setResult(createResult(DEFAULT_FORM_STATE, DEFAULT_SECTION_FORCE_MODE));
    setIssues([]);
    setStatusMessage("入力を待機しています。");
    setIsPrintPreviewOpen(false);
    setSectionForceMode(DEFAULT_SECTION_FORCE_MODE);
  };

  const updateField = (field: keyof FormState) => (value: string) => {
    setForm((current: FormState) => ({ ...current, [field]: value }));
  };

  return {
    form,
    result,
    issues,
    statusMessage,
    isPrintPreviewOpen,
    sectionForceMode,
    handleSubmit,
    handleReset,
    updateField,
    updateSectionForceMode: setSectionForceMode,
    openPrintPreview: () => setIsPrintPreviewOpen(true),
    closePrintPreview: () => setIsPrintPreviewOpen(false),
  };
}

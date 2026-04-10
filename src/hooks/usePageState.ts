import { useEffect, useState, type SubmitEventHandler } from "react";
import {
  AnnularSectionCalculator,
  type AnnularSectionInput,
  type AnnularSectionResult,
  type AnnularSectionValidationIssue,
} from "@/model/annular-section";
import type { FormState } from "@/forms/form-state";
import { parseNumber } from "@/utils/number-format";

/** フォームのデフォルト入力値 */
const DEFAULT_FORM_STATE: FormState = {
  momentKNm: "",
  shearKN: "",
  axialKN: "",
  outerRadiusMm: "",
  innerRadiusMm: "",
  rebarRadiusMm: "",
  rebarDiameterMm: "22",
  barCount: "",
  youngRatio: "15",
  rebarYieldStrengthNPerMm2: "345",
  concreteDesignStrengthNPerMm2: "30",
};

/** ローカルストレージ用のキー */
const FORM_STORAGE_KEY = "rc:annular-section-form";

/** ローカルストレージからフォームの状態を読み込むための型ガード */
function isFormState(value: unknown): value is FormState {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.momentKNm === "string" &&
    typeof candidate.shearKN === "string" &&
    typeof candidate.axialKN === "string" &&
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

/** フォームの状態をローカルストレージから読み込む */
function loadFormState(): FormState {
  if (typeof window === "undefined") {
    return DEFAULT_FORM_STATE;
  }

  try {
    const storedValue = window.localStorage.getItem(FORM_STORAGE_KEY);
    if (!storedValue) {
      return DEFAULT_FORM_STATE;
    }

    const parsedValue = JSON.parse(storedValue) as unknown;
    if (!isFormState(parsedValue)) {
      return DEFAULT_FORM_STATE;
    }

    return { ...DEFAULT_FORM_STATE, ...parsedValue };
  } catch {
    return DEFAULT_FORM_STATE;
  }
}

/** フォームの状態をローカルストレージに保存する */
function saveFormState(form: FormState): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(form));
  } catch {
    // 保存に失敗しても計算処理は継続する
  }
}

/** フォームの状態から計算用の入力オブジェクトを構築する */
function buildInput(form: FormState): AnnularSectionInput {
  return {
    momentKNm: parseNumber(form.momentKNm),
    shearKN: parseNumber(form.shearKN),
    axialKN: parseNumber(form.axialKN),
    outerRadiusMm: parseNumber(form.outerRadiusMm),
    innerRadiusMm: parseNumber(form.innerRadiusMm),
    rebarRadiusMm: parseNumber(form.rebarRadiusMm),
    rebarDiameterMm: parseNumber(form.rebarDiameterMm) as AnnularSectionInput["rebarDiameterMm"],
    barCount: parseNumber(form.barCount),
    youngRatio: parseNumber(form.youngRatio),
    rebarYieldStrengthNPerMm2: parseNumber(form.rebarYieldStrengthNPerMm2),
    concreteDesignStrengthNPerMm2: parseNumber(form.concreteDesignStrengthNPerMm2),
  };
}

/** フォームの状態から計算結果を生成し、入力に問題がある場合は `null` を返す */
function createResult(form: FormState): AnnularSectionResult | null {
  const calculator = new AnnularSectionCalculator(buildInput(form));
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
  handleSubmit: SubmitEventHandler<HTMLFormElement>;
  handleReset: () => void;
  updateField: (field: keyof FormState) => (value: string) => void;
  openPrintPreview: () => void;
  closePrintPreview: () => void;
};

/** 円環断面計算画面の状態とイベントを管理する */
export function useAnnularSectionPageState(): UseAnnularSectionPageStateResult {
  const initialFormState = loadFormState();
  const [form, setForm] = useState<FormState>(initialFormState);
  const [result, setResult] = useState<AnnularSectionResult | null>(() => createResult(initialFormState));
  const [issues, setIssues] = useState<AnnularSectionValidationIssue[]>([]);
  const [statusMessage, setStatusMessage] = useState("入力を待機しています。");
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);

  useEffect(() => {
    saveFormState(form);
  }, [form]);

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const input = buildInput(form);
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
      setIssues([{ field: "momentKNm", message }]);
      setResult(null);
      setIsPrintPreviewOpen(false);
      setStatusMessage(message);
    }
  };

  const handleReset = () => {
    setForm(DEFAULT_FORM_STATE);
    setResult(createResult(DEFAULT_FORM_STATE));
    setIssues([]);
    setStatusMessage("入力を待機しています。");
    setIsPrintPreviewOpen(false);
  };

  const updateField = (field: keyof FormState) => (value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  return {
    form,
    result,
    issues,
    statusMessage,
    isPrintPreviewOpen,
    handleSubmit,
    handleReset,
    updateField,
    openPrintPreview: () => setIsPrintPreviewOpen(true),
    closePrintPreview: () => setIsPrintPreviewOpen(false),
  };
}

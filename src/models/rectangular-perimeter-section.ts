import {
  resolveSectionForceComponents,
  type AxialForceSign,
  type SectionForce,
} from "@/models/section-force";
import { getRebarAreaMm2ByKind, isRebarKind, type RebarKind } from "@/models/rebar";
import type { MaterialParams } from "@/models/section-types";

/** 数値計算用の極小値（ゼロ判定用） */
const EPSILON = 1e-9;

/** 矩形周囲鉄筋の入力全体を表す型定義 */
export interface RectanglarPerimeterSectionInput {
  /** 断面力 */
  force: Partial<SectionForce>;
  /** 断面形状 */
  geometry: RectanglarPerimeterSectionGeometryInput;
  /** 諸係数 */
  materialParams: MaterialParams;
}

/** 矩形周囲鉄筋の形状を表す入力型定義 */
export interface RectanglarPerimeterSectionGeometryInput {
  /** 幅 [mm] */
  width_Mm: number;
  /** 高さ [mm] */
  height_Mm: number;
  /** 複鉄筋の引張鉄筋の有効高さ [mm] */
  subRebarEffectiveHeight_Mm: number;
  /** 複鉄筋の圧縮鉄筋の被り [mm] */
  subRebarCover_Mm: number;
  /** 複鉄筋の種類 */
  subRebarKind: RebarKind;
  /** 複鉄筋の径 [mm] */
  subRebarDiameter_Mm: number;
  /** 複鉄筋の本数 [本/片側] */
  subRebarCount: number;
  /** 側鉄筋の種類 */
  sideRebarKind: RebarKind;
  /** 側鉄筋の径 [mm] */
  sideRebarDiameter_Mm: number;
  /** 側鉄筋の本数 [本/片側] */
  sideRebarCount: number;
}

/** 検証結果の型定義 */
export interface RectanglarPerimeterSectionValidationIssue {
  field: "force" | "geometry" | "materialParams" | keyof SectionForce;
  message: string;
}

/** 断面結果の型定義 */
export interface RectanglarPerimeterSectionSectionResult {
  /** 断面積 [mm2] */
  sectionArea_Mm2: number;
  /** 全断面積 [mm2] */
  fullSectionArea_Mm2: number;
  /** 複鉄筋の1本あたりの断面積 [mm2] */
  subRebarAreaPerBar_Mm2: number;
  /** 複鉄筋の断面積 [mm2] */
  mainRebarArea_Mm2: number;
  /** 側鉄筋の1本あたりの断面積 [mm2] */
  sideRebarAreaPerBar_Mm2: number;
  /** 側鉄筋の断面積 [mm2] */
  sideRebarArea_Mm2: number;
  /** 複鉄筋比 [%] */
  rebarRatioPercent: number;
}

/** 荷重状態の結果定義 */
export interface RectanglarPerimeterSectionLoadingResult {
  /** 換算曲げモーメント [kN.m] */
  combinedMoment_KNm: number;
  /** 軸力の符号 */
  axialForceSign: AxialForceSign;
}

/** 中立軸の結果定義 */
export interface RectanglarPerimeterSectionNeutralAxisResult {
  /** 中立軸比 */
  k: number;
  /** 中立軸位置 [mm] */
  neutralAxisPosition_Mm: number;
  /** コンクリート圧縮応力度係数 */
  concreteCompressionCoefficient: number;
  /** 鋼材応力度係数 */
  steelStressCoefficient: number;
  /** せん断応力度係数 */
  shearCoefficient: number;
}

/** 応力度の結果定義 */
export interface RectanglarPerimeterSectionStressResult {
  /** コンクリート曲げ圧縮応力度 [N/mm2] */
  concreteCompressionStress_NPerMm2: number;
  /** 鉄筋曲げ引張応力度 [N/mm2] */
  rebarStress_NPerMm2: number;
  /** コンクリートせん断応力度 [N/mm2] */
  concreteShearStress_NPerMm2: number;
  /** 平均せん断応力度 [N/mm2] */
  rebarShearStress_NPerMm2: number;
}

/** 計算結果をまとめた型定義 */
export interface RectanglarPerimeterSectionResult {
  /** 断面形状の結果 */
  section: RectanglarPerimeterSectionSectionResult;
  /** 荷重状態の結果 */
  loading: RectanglarPerimeterSectionLoadingResult;
  /** 中立軸の結果 */
  neutralAxis: RectanglarPerimeterSectionNeutralAxisResult;
  /** 応力度の結果 */
  stress: RectanglarPerimeterSectionStressResult;
}

/** 矩形周囲鉄筋の形状を表す値オブジェクト */
export class RectanglarPerimeterSectionGeometry {
  readonly width_Mm: number;
  readonly height_Mm: number;
  readonly subRebarEffectiveHeight_Mm: number;
  readonly subRebarCover_Mm: number;
  readonly subRebarKind: RebarKind;
  readonly subRebarDiameter_Mm: number;
  readonly subRebarCount: number;
  readonly sideRebarKind: RebarKind;
  readonly sideRebarDiameter_Mm: number;
  readonly sideRebarCount: number;

  private constructor(input: RectanglarPerimeterSectionGeometryInput) {
    this.width_Mm = input.width_Mm;
    this.height_Mm = input.height_Mm;
    this.subRebarEffectiveHeight_Mm = input.subRebarEffectiveHeight_Mm;
    this.subRebarCover_Mm = input.subRebarCover_Mm;
    this.subRebarKind = input.subRebarKind;
    this.subRebarDiameter_Mm = input.subRebarDiameter_Mm;
    this.subRebarCount = input.subRebarCount;
    this.sideRebarKind = input.sideRebarKind;
    this.sideRebarDiameter_Mm = input.sideRebarDiameter_Mm;
    this.sideRebarCount = input.sideRebarCount;
  }

  /** 入力値から値オブジェクトを生成する */
  static fromInput(input: RectanglarPerimeterSectionGeometryInput): RectanglarPerimeterSectionGeometry {
    return new RectanglarPerimeterSectionGeometry(input);
  }

  /** 断面積 [mm2] */
  get sectionArea_Mm2(): number {
    return this.width_Mm * this.height_Mm;
  }

  /** 全断面積 [mm2] */
  get fullSectionArea_Mm2(): number {
    return this.sectionArea_Mm2;
  }

  /** 複鉄筋の1本あたりの断面積 [mm2] */
  get subRebarAreaPerBar_Mm2(): number {
    return this.hasSubRebar ? getRebarAreaMm2ByKind(this.subRebarKind, this.subRebarDiameter_Mm) : 0;
  }

  /** 複鉄筋の断面積 [mm2] */
  get mainRebarArea_Mm2(): number {
    return this.subRebarAreaPerBar_Mm2 * this.subRebarCount;
  }

  /** 側鉄筋の1本あたりの断面積 [mm2] */
  get sideRebarAreaPerBar_Mm2(): number {
    return this.hasSideRebar ? getRebarAreaMm2ByKind(this.sideRebarKind, this.sideRebarDiameter_Mm) : 0;
  }

  /** 側鉄筋の断面積 [mm2] */
  get sideRebarArea_Mm2(): number {
    return this.sideRebarAreaPerBar_Mm2 * this.sideRebarCount;
  }

  /** 複鉄筋比 [%] */
  get rebarRatioPercent(): number {
    if (this.sectionArea_Mm2 === 0) {
      return 0;
    }
    return (this.totalRebarArea_Mm2 / this.sectionArea_Mm2) * 100;
  }

  /** 全配筋断面積 [mm2] */
  get totalRebarArea_Mm2(): number {
    return this.mainRebarArea_Mm2 + this.sideRebarArea_Mm2;
  }

  /** 複鉄筋の有効高さの中心からのずれ [mm] */
  get eccentricity_Mm(): number {
    return this.subRebarEffectiveHeight_Mm - this.height_Mm / 2;
  }

  /** 複鉄筋があるかどうか */
  get hasSubRebar(): boolean {
    return this.subRebarCount > 0 && this.subRebarDiameter_Mm > 0;
  }

  /** 側鉄筋があるかどうか */
  get hasSideRebar(): boolean {
    return this.sideRebarCount > 0 && this.sideRebarDiameter_Mm > 0;
  }
}

/** 矩形周囲鉄筋の計算クラス */
export class RectanglarPerimeterSectionCalculator {
  private readonly input: RectanglarPerimeterSectionInput;

  constructor(input: RectanglarPerimeterSectionInput) {
    this.input = input;
  }

  /** 入力値の検査 */
  validate(): RectanglarPerimeterSectionValidationIssue[] {
    const issues: RectanglarPerimeterSectionValidationIssue[] = [];
    validateSectionForce(this.input.force, issues);
    validateGeometry(this.input.geometry, issues);
    validateMaterialParams(this.input.materialParams, issues);
    return issues;
  }

  /** 計算処理 */
  calculate(): RectanglarPerimeterSectionResult {
    const issues = this.validate();
    if (issues.length > 0) {
      throw new Error(issues.map((issue) => issue.message).join(" "));
    }

    const geometry = RectanglarPerimeterSectionGeometry.fromInput(this.input.geometry);
    const force = normalizeSectionForce(this.input.force);
    const forceComponents = resolveSectionForceComponents(force);
    const axial_KN = forceComponents.axial_KN;
    const moment_KNm = forceComponents.moment_KNm;
    const shear_KN = forceComponents.shear_KN;

    const mainRebarAreaPerBar_Mm2 = geometry.subRebarAreaPerBar_Mm2;
    const sideRebarAreaPerBar_Mm2 = geometry.sideRebarAreaPerBar_Mm2;
    const sideRebarArea_Mm2 = geometry.sideRebarArea_Mm2;
    const effectiveHeight_Mm = geometry.subRebarEffectiveHeight_Mm;
    const eccentricity_Mm = geometry.eccentricity_Mm;
    const youngRatio = this.input.materialParams.youngRatio;

    const mainRebarArea_Mm2 = Math.round(geometry.mainRebarArea_Mm2);
    const mainRebarRatio = mainRebarArea_Mm2 / (geometry.width_Mm * effectiveHeight_Mm);
    const sideRebarRatio = sideRebarArea_Mm2 / (geometry.width_Mm * effectiveHeight_Mm);
    const c = mainRebarArea_Mm2 > 0 ? sideRebarArea_Mm2 / mainRebarArea_Mm2 : 0;

    const combinedMoment_Nmm = moment_KNm * 1_000_000 + axial_KN * 1000 * eccentricity_Mm;
    const combinedMoment_KNm = combinedMoment_Nmm / 1_000_000;

    const neutralAxis = calculateNeutralAxisResult({
      geometry,
      axial_KN,
      moment_KNm,
      mainRebarRatio,
      sideRebarRatio,
      c,
      youngRatio,
    });

    const stress = calculateStressResult({
      geometry,
      combinedMoment_Nmm,
      shear_KN,
      youngRatio,
      neutralAxis,
    });

    return {
      section: {
        sectionArea_Mm2: geometry.sectionArea_Mm2,
        fullSectionArea_Mm2: geometry.fullSectionArea_Mm2,
        subRebarAreaPerBar_Mm2: mainRebarAreaPerBar_Mm2,
        mainRebarArea_Mm2,
        sideRebarAreaPerBar_Mm2,
        sideRebarArea_Mm2,
        rebarRatioPercent: mainRebarRatio * 100,
      },
      loading: {
        combinedMoment_KNm,
        axialForceSign: classifyAxialForce(axial_KN),
      },
      neutralAxis: {
        k: neutralAxis.k,
        neutralAxisPosition_Mm: neutralAxis.k * effectiveHeight_Mm,
        concreteCompressionCoefficient: neutralAxis.concreteCompressionCoefficient,
        steelStressCoefficient: neutralAxis.steelStressCoefficient,
        shearCoefficient: neutralAxis.shearCoefficient,
      },
      stress,
    };
  }
}

/** 断面力の入力値を検査する */
function validateSectionForce(
  force: Partial<SectionForce> | undefined,
  issues: RectanglarPerimeterSectionValidationIssue[],
): void {
  const forceLabels: Record<keyof SectionForce, string> = {
    fx_KN: "軸力",
    fy_KN: "せん断力（面外）",
    fz_KN: "せん断力（面内）",
    mx_KNm: "ねじりモーメント",
    my_KNm: "曲げモーメント（面内）",
    mz_KNm: "曲げモーメント（面外）",
  };

  for (const [key, label] of Object.entries(forceLabels)) {
    const value = force?.[key as keyof SectionForce];
    if (value !== undefined && !Number.isFinite(value)) {
      issues.push({ field: key as keyof SectionForce, message: `${label}は数値で指定してください。` });
    }
  }
}

/** 部分指定の断面力を完全な形に正規化する */
function normalizeSectionForce(force: Partial<SectionForce> | undefined): SectionForce {
  return {
    fx_KN: force?.fx_KN ?? 0,
    fy_KN: force?.fy_KN ?? 0,
    fz_KN: force?.fz_KN ?? 0,
    mx_KNm: force?.mx_KNm ?? 0,
    my_KNm: force?.my_KNm ?? 0,
    mz_KNm: force?.mz_KNm ?? 0,
  };
}

/** 断面形状の入力値を検査する */
function validateGeometry(
  geometry: RectanglarPerimeterSectionGeometryInput,
  issues: RectanglarPerimeterSectionValidationIssue[],
): void {
  const {
    width_Mm,
    height_Mm,
    subRebarEffectiveHeight_Mm,
    subRebarCover_Mm,
    subRebarKind,
    subRebarDiameter_Mm,
    subRebarCount,
    sideRebarKind,
    sideRebarDiameter_Mm,
    sideRebarCount,
  } = geometry;

  if (!Number.isFinite(width_Mm) || width_Mm <= 0) {
    issues.push({ field: "geometry", message: "幅は正の数で指定してください。" });
  }
  if (!Number.isFinite(height_Mm) || height_Mm <= 0) {
    issues.push({ field: "geometry", message: "高さは正の数で指定してください。" });
  }
  if (!Number.isFinite(subRebarEffectiveHeight_Mm) || subRebarEffectiveHeight_Mm <= 0) {
    issues.push({ field: "geometry", message: "複鉄筋の引張鉄筋の有効高さは正の数で指定してください。" });
  }
  if (!Number.isFinite(subRebarCover_Mm) || subRebarCover_Mm <= 0) {
    issues.push({ field: "geometry", message: "複鉄筋の圧縮鉄筋の被りは正の数で指定してください。" });
  }

  if (
    Number.isFinite(width_Mm) &&
    Number.isFinite(height_Mm) &&
    Number.isFinite(subRebarEffectiveHeight_Mm)
  ) {
    if (height_Mm <= subRebarEffectiveHeight_Mm) {
      issues.push({
        field: "geometry",
        message: "高さは複鉄筋の引張鉄筋の有効高さより大きい値で指定してください。",
      });
    }
  }
  if (
    Number.isFinite(subRebarEffectiveHeight_Mm) &&
    Number.isFinite(subRebarCover_Mm) &&
    subRebarEffectiveHeight_Mm > 0 &&
    subRebarCover_Mm > 0 &&
    subRebarCover_Mm >= subRebarEffectiveHeight_Mm
  ) {
    issues.push({
      field: "geometry",
      message: "複鉄筋の引張鉄筋の有効高さは複鉄筋の圧縮鉄筋の被りより大きい値で指定してください。",
    });
  }

  const hasMainRebarCount = subRebarCount > 0;
  const hasMainRebarDiameter = subRebarDiameter_Mm > 0;
  if (hasMainRebarCount !== hasMainRebarDiameter) {
    issues.push({ field: "geometry", message: "複鉄筋の径と本数は両方入力してください。" });
  }
  if (hasMainRebarCount && hasMainRebarDiameter && !isRebarKind(subRebarKind)) {
    issues.push({ field: "geometry", message: "複鉄筋の種類は異形棒鋼または丸鋼で指定してください。" });
  }

  const hasSideRebarCount = sideRebarCount > 0;
  const hasSideRebarDiameter = sideRebarDiameter_Mm > 0;
  if (!hasSideRebarCount || !hasSideRebarDiameter) {
    issues.push({ field: "geometry", message: "側鉄筋の径と本数を入力してください。" });
  } else if (!isRebarKind(sideRebarKind)) {
    issues.push({ field: "geometry", message: "側鉄筋の種類は異形棒鋼または丸鋼で指定してください。" });
  }
}

/** 諸係数を検査する */
function validateMaterialParams(
  materialParams: MaterialParams,
  issues: RectanglarPerimeterSectionValidationIssue[],
): void {
  const { youngRatio, rebarYieldStrength_NPerMm2, concreteDesignStrength_NPerMm2 } = materialParams;

  if (!Number.isFinite(youngRatio) || youngRatio <= 0) {
    issues.push({ field: "materialParams", message: "ヤング係数比は正の数で指定してください。" });
  }
  if (!Number.isFinite(rebarYieldStrength_NPerMm2) || rebarYieldStrength_NPerMm2 <= 0) {
    issues.push({ field: "materialParams", message: "鉄筋降伏強度は正の数で指定してください。" });
  }
  if (!Number.isFinite(concreteDesignStrength_NPerMm2) || concreteDesignStrength_NPerMm2 <= 0) {
    issues.push({ field: "materialParams", message: "コンクリート設計基準強度は正の数で指定してください。" });
  }
}

/** 軸力の符号を判定する */
function classifyAxialForce(axial_KN: number): AxialForceSign {
  if (axial_KN > EPSILON) {
    return "tension";
  }
  if (axial_KN < -EPSILON) {
    return "compression";
  }
  return "zero";
}

/** 中立軸の結果を算出する */
function calculateNeutralAxisResult(input: {
  geometry: RectanglarPerimeterSectionGeometry;
  axial_KN: number;
  moment_KNm: number;
  mainRebarRatio: number;
  sideRebarRatio: number;
  c: number;
  youngRatio: number;
}): RectanglarPerimeterSectionNeutralAxisResult {
  const { geometry, axial_KN, moment_KNm, mainRebarRatio, sideRebarRatio, c, youngRatio } = input;
  const d = geometry.subRebarEffectiveHeight_Mm;
  const a = geometry.subRebarCover_Mm / d;
  const b =
    axial_KN === 0
      ? Number.POSITIVE_INFINITY
      : ((moment_KNm * 1000) / axial_KN + geometry.eccentricity_Mm) / d;
  const hasMainRebar = geometry.mainRebarArea_Mm2 > 0;

  const k =
    axial_KN === 0
      ? solveNeutralAxisRatioForZeroAxial({ hasMainRebar, a, mainRebarRatio, sideRebarRatio, c, youngRatio })
      : solveNeutralAxisRatioForNonZeroAxial({
          hasMainRebar,
          a,
          b,
          mainRebarRatio,
          sideRebarRatio,
          c,
          youngRatio,
        });

  if (!Number.isFinite(k) || !(k > 0 && k < 1)) {
    const message = axial_KN > 0 ? "全圧縮" : "全引張";
    throw new Error(`${message}\n\n中立軸比 [k=${k}] が\n[0]以上 [1]未満の有効範囲にありません`);
  }

  const concreteCompressionCoefficient = hasMainRebar
    ? (2 * k) /
      ((1 - k / 3) * k ** 2 +
        2 * youngRatio * mainRebarRatio * k * (1 - a) * (1 + c) +
        2 * youngRatio * mainRebarRatio * (a ** 2 - a + (c / 3) * (2 * a ** 2 - a - 1)))
    : (2 * k) /
      ((1 - k / 3) * k ** 2 + 2 * youngRatio * sideRebarRatio * k - (2 * youngRatio * sideRebarRatio) / 3);

  const steelStressCoefficient = (concreteCompressionCoefficient * (1 - k)) / k;
  const shearCoefficient = hasMainRebar
    ? calculateShearCoefficientWithMain({ k, a, mainRebarRatio, c, youngRatio })
    : calculateShearCoefficientWithoutMain({ k, sideRebarRatio, youngRatio });

  return {
    k,
    neutralAxisPosition_Mm: k * d,
    concreteCompressionCoefficient,
    steelStressCoefficient,
    shearCoefficient,
  };
}

/** 軸力 0 の中立軸比を求める */
function solveNeutralAxisRatioForZeroAxial(input: {
  hasMainRebar: boolean;
  a: number;
  mainRebarRatio: number;
  sideRebarRatio: number;
  c: number;
  youngRatio: number;
}): number {
  const { hasMainRebar, a, mainRebarRatio, sideRebarRatio, c, youngRatio } = input;

  if (hasMainRebar) {
    const b = 4 * youngRatio * mainRebarRatio * (1 + c);
    const d = -2 * youngRatio * mainRebarRatio * (1 + a + a * c + c);
    return solveQuadraticRootInRange(1, b, d);
  }

  return solveQuadraticRootInRange(1, 4 * youngRatio * sideRebarRatio, -2 * youngRatio * sideRebarRatio);
}

/** 軸力 0 以外の中立軸比を求める */
function solveNeutralAxisRatioForNonZeroAxial(input: {
  hasMainRebar: boolean;
  a: number;
  b: number;
  mainRebarRatio: number;
  sideRebarRatio: number;
  c: number;
  youngRatio: number;
}): number {
  const { hasMainRebar, a, b, mainRebarRatio, sideRebarRatio, c, youngRatio } = input;

  if (hasMainRebar) {
    const k3 = 1 / 3;
    const k2 = -(1 - b);
    const k1 = -2 * youngRatio * mainRebarRatio * (1 - a - 2 * b) * (1 + c);
    const k0 =
      2 * youngRatio * mainRebarRatio * (-(a ** 2) + a - b - a * b) +
      2 * youngRatio * mainRebarRatio * (-(c / 3) * (2 * a ** 2 - a - 1 + 3 * a * b + 3 * b));
    return solveCubicRootInRange(k3, k2, k1, k0);
  }

  const k3 = 1 / 3;
  const k2 = -(1 - b);
  const k1 = -2 * youngRatio * sideRebarRatio * (1 - 2 * b);
  const k0 = 2 * youngRatio * sideRebarRatio * (-(1 / 3) * (-1 + 3 * b));
  return solveCubicRootInRange(k3, k2, k1, k0);
}

/** 複鉄筋ありの場合のせん断係数を算出する */
function calculateShearCoefficientWithMain(input: {
  k: number;
  a: number;
  mainRebarRatio: number;
  c: number;
  youngRatio: number;
}): number {
  const { k, a, mainRebarRatio, c, youngRatio } = input;
  const zz =
    (0.5 * k ** 2 + youngRatio * mainRebarRatio * (1 + a) * (1 + c)) /
    (k + 2 * youngRatio * mainRebarRatio * (1 + c));
  const z1 = youngRatio * mainRebarRatio * (1 - zz + (c / (1 - a)) * (1 - k) * (1 + k - 2 * zz));
  const z2 =
    (1 / 3) * k ** 3 -
    k ** 2 * zz +
    k * zz ** 2 +
    youngRatio * mainRebarRatio * ((1 - zz) ** 2 + (zz - a) ** 2 + (c / 2) * (1 + a - 2 * zz) ** 2) +
    youngRatio * mainRebarRatio * ((c / 6) * (1 - a) ** 2);
  return z1 / z2;
}

/** 複鉄筋なしの場合のせん断係数を算出する */
function calculateShearCoefficientWithoutMain(input: {
  k: number;
  sideRebarRatio: number;
  youngRatio: number;
}): number {
  const { k, sideRebarRatio, youngRatio } = input;
  const zz = (0.5 * k ** 2 + youngRatio * sideRebarRatio) / (k + 2 * youngRatio * sideRebarRatio);
  const z1 = youngRatio * sideRebarRatio * ((1 - k) * (1 + k - 2 * zz));
  const z2 =
    (1 / 3) * k ** 3 -
    k ** 2 * zz +
    k * zz ** 2 +
    youngRatio * sideRebarRatio * (0.5 * (1 - 2 * zz) ** 2) +
    (youngRatio * sideRebarRatio) / 6;
  return z1 / z2;
}

/** 応力度を算出する */
function calculateStressResult(input: {
  geometry: RectanglarPerimeterSectionGeometry;
  combinedMoment_Nmm: number;
  shear_KN: number;
  youngRatio: number;
  neutralAxis: RectanglarPerimeterSectionNeutralAxisResult;
}): RectanglarPerimeterSectionStressResult {
  const { geometry, combinedMoment_Nmm, shear_KN, youngRatio, neutralAxis } = input;
  const scale = combinedMoment_Nmm / (geometry.width_Mm * geometry.subRebarEffectiveHeight_Mm ** 2);
  const averageShearStress_NPerMm2 =
    (shear_KN * 1000) / (geometry.width_Mm * geometry.subRebarEffectiveHeight_Mm);

  return {
    concreteCompressionStress_NPerMm2: scale * neutralAxis.concreteCompressionCoefficient,
    rebarStress_NPerMm2: scale * neutralAxis.steelStressCoefficient * youngRatio,
    concreteShearStress_NPerMm2: averageShearStress_NPerMm2 * neutralAxis.shearCoefficient,
    rebarShearStress_NPerMm2: averageShearStress_NPerMm2,
  };
}

/** 2次方程式の解のうち、0 < k < 1 を返す */
function solveQuadraticRootInRange(a: number, b: number, c: number): number {
  const discriminant = b ** 2 - 4 * a * c;
  if (discriminant < -EPSILON) {
    throw new Error("Ｋ（中立軸比）が求まりません");
  }

  const sqrtDiscriminant = Math.sqrt(Math.max(0, discriminant));
  const root1 = (-b + sqrtDiscriminant) / (2 * a);
  const root2 = (-b - sqrtDiscriminant) / (2 * a);
  const candidates = [root1, root2].filter((root) => Number.isFinite(root) && root > 0 && root < 1);

  if (candidates.length === 0) {
    throw new Error("有効なＫ（中立軸比）が見つかりません");
  }

  return candidates.sort((left, right) => Math.abs(left - 0.5) - Math.abs(right - 0.5))[0];
}

/** 3次方程式の実数解のうち、0 < k < 1 で 0.5 に最も近い解を返す */
function solveCubicRootInRange(a: number, b: number, c: number, d: number): number {
  if (Math.abs(a) < EPSILON) {
    throw new Error("３乗の項には０以外を指定して下さい");
  }

  const aa = b / a;
  const bb = c / a;
  const cc = d / a;
  const p = (3 * bb - aa ** 2) / 9;
  const q = (27 * cc - 9 * aa * bb + 2 * aa ** 3) / 27;
  const discriminant = q ** 2 + 4 * p ** 3;
  const roots: number[] = [];

  if (discriminant > EPSILON) {
    const su = (-q + Math.sqrt(discriminant)) / 2;
    const sv = (-q - Math.sqrt(discriminant)) / 2;
    const u = Math.cbrt(su);
    const v = Math.cbrt(sv);
    roots.push(u + v - aa / 3);
  } else {
    const t = q === 0 ? Math.PI / 2 : Math.atan(Math.sqrt(Math.max(0, -discriminant)) / -q);
    const normalizedT = t < 0 ? t + Math.PI : t;
    const p2 = Math.sqrt(Math.max(0, -p)) * 2;
    roots.push(-p2 * Math.sin(Math.PI / 6 + normalizedT / 3) - aa / 3);
    roots.push(-p2 * Math.sin(Math.PI / 6 - normalizedT / 3) - aa / 3);
    roots.push(p2 * Math.sin(Math.PI / 2 - normalizedT / 3) - aa / 3);
  }

  const candidates = roots.filter((root) => Number.isFinite(root) && root > 0 && root < 1);
  if (candidates.length === 0) {
    throw new Error("有効なＫ（中立軸比）が見つかりません");
  }

  return candidates.sort((left, right) => Math.abs(left - 0.5) - Math.abs(right - 0.5))[0];
}

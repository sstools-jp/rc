import { classifyAxialForce, normalizeSectionForce } from "@/models/section-force-utils";
import type { SectionForce } from "@/models/section-force";
import type { MaterialParams } from "@/models/section-types";
import type {
  RectanglarPerimeterSectionGeometry,
  RectanglarPerimeterSectionNeutralAxisResult,
  RectanglarPerimeterSectionResult,
  RectanglarPerimeterSectionStressResult,
} from "@/models/rectangular-perimeter-section";
import { EPSILON } from "@/models/constants";

/** 断面力 0 の中立軸比を求める */
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

/** 断面力 0 以外の中立軸比を求める */
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

/** 結果をまとめて算出する */
export function calculateRectanglarPerimeterSectionResult(input: {
  geometry: RectanglarPerimeterSectionGeometry;
  force: Partial<SectionForce> | undefined;
  materialParams: MaterialParams;
}): RectanglarPerimeterSectionResult {
  const geometry = input.geometry;
  const force = normalizeSectionForce(input.force);
  const axial_KN = -force.fx_KN;
  const moment_KNm = Math.sqrt(force.my_KNm ** 2 + force.mz_KNm ** 2);
  const shear_KN = Math.sqrt(force.fy_KN ** 2 + force.fz_KN ** 2);
  const mainRebarAreaPerBar_Mm2 = geometry.subRebarAreaPerBar_Mm2;
  const sideRebarAreaPerBar_Mm2 = geometry.sideRebarAreaPerBar_Mm2;
  const sideRebarArea_Mm2 = geometry.sideRebarArea_Mm2;
  const effectiveHeight_Mm = geometry.subRebarEffectiveHeight_Mm;
  const eccentricity_Mm = geometry.eccentricity_Mm;
  const youngRatio = input.materialParams.youngRatio;

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

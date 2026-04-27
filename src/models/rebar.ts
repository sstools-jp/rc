/** 鉄筋データ（公称直径および公称断面積） */
const REBAR_DATA = [
  { d: 6, area_Mm2: 31.67 },
  { d: 8, area_Mm2: 49.51 },
  { d: 10, area_Mm2: 71.33 },
  { d: 13, area_Mm2: 126.7 },
  { d: 16, area_Mm2: 198.6 },
  { d: 19, area_Mm2: 286.5 },
  { d: 22, area_Mm2: 387.1 },
  { d: 25, area_Mm2: 506.7 },
  { d: 29, area_Mm2: 642.4 },
  { d: 32, area_Mm2: 794.2 },
  { d: 35, area_Mm2: 956.6 },
  { d: 38, area_Mm2: 1140 },
  { d: 41, area_Mm2: 1340 },
  { d: 51, area_Mm2: 2027 },
] as const;

/** 鉄筋種別の一覧 */
export const REBAR_KINDS = ["deformed", "round"] as const;

/** 鉄筋種別を表す型 */
export type RebarKind = (typeof REBAR_KINDS)[number];

/** 鉄筋径のリスト */
export const REBAR_DIAMETERS_MM = REBAR_DATA.map((rebar) => rebar.d);

/** 鉄筋径を表す型 */
export type RebarDiameter_Mm = (typeof REBAR_DATA)[number]["d"];

/** 鉄筋種別かどうかを判定する関数 */
export function isRebarKind(value: unknown): value is RebarKind {
  return value === "deformed" || value === "round";
}

/** 鉄筋径から断面積を取得する関数 */
export function getRebarAreaMm2(diameter_Mm: RebarDiameter_Mm): number {
  const rebar = REBAR_DATA.find((r) => r.d === diameter_Mm);
  if (!rebar) {
    throw new Error(`鉄筋径 ${diameter_Mm} mm の断面積データが見つかりません。`);
  }
  return rebar.area_Mm2;
}

/** 丸鋼の断面積を取得する関数 */
export function getRoundBarAreaMm2(diameter_Mm: number): number {
  return (Math.PI * diameter_Mm ** 2) / 4;
}

/** 鉄筋種別と径から断面積を取得する関数 */
export function getRebarAreaMm2ByKind(rebarKind: RebarKind, diameter_Mm: number): number {
  return rebarKind === "round"
    ? getRoundBarAreaMm2(diameter_Mm)
    : getRebarAreaMm2(diameter_Mm as RebarDiameter_Mm);
}

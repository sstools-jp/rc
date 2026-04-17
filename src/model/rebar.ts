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

/** 鉄筋径のリスト */
export const REBAR_DIAMETERS_MM = REBAR_DATA.map((rebar) => rebar.d);

/** 鉄筋径を表す型 */
export type RebarDiameterMm = (typeof REBAR_DATA)[number]["d"];

/** 鉄筋径から断面積を取得する関数 */
export function getRebarAreaMm2(diameterMm: RebarDiameterMm): number {
  const rebar = REBAR_DATA.find((r) => r.d === diameterMm);
  if (!rebar) {
    throw new Error(`鉄筋径 ${diameterMm} mm の断面積データが見つかりません。`);
  }
  return rebar.area_Mm2;
}

/** 鉄筋データ（公称直径および公称断面積） */
const REBAR_DATA = [
  { d: 6, areaMm2: 31.67 },
  { d: 8, areaMm2: 49.51 },
  { d: 10, areaMm2: 71.33 },
  { d: 13, areaMm2: 126.7 },
  { d: 16, areaMm2: 198.6 },
  { d: 19, areaMm2: 286.5 },
  { d: 22, areaMm2: 387.1 },
  { d: 25, areaMm2: 506.7 },
  { d: 29, areaMm2: 642.4 },
  { d: 32, areaMm2: 794.2 },
  { d: 35, areaMm2: 956.6 },
  { d: 38, areaMm2: 1140 },
  { d: 41, areaMm2: 1340 },
  { d: 51, areaMm2: 2027 },
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
  return rebar.areaMm2;
}
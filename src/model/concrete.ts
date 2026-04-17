/**
 * コンクリート設計基準強度
 *
 * コンクリートが負担できる平均せん断応力度の基本値 τc は 【H29道路橋示方書 表-5.8.5】 に基づく
 * */
export const CONCRETE_DATA = [
  { sigmaCk_NPerMm2: 21.0, tauC_NPerMm2: 0.33 },
  { sigmaCk_NPerMm2: 24.0, tauC_NPerMm2: 0.35 },
  { sigmaCk_NPerMm2: 27.0, tauC_NPerMm2: 0.36 },
  { sigmaCk_NPerMm2: 30.0, tauC_NPerMm2: 0.37 },
  { sigmaCk_NPerMm2: 40.0, tauC_NPerMm2: 0.41 },
  { sigmaCk_NPerMm2: 50.0, tauC_NPerMm2: 0.44 },
  { sigmaCk_NPerMm2: 60.0, tauC_NPerMm2: 0.47 },
  { sigmaCk_NPerMm2: 70.0, tauC_NPerMm2: 0.47 },
  { sigmaCk_NPerMm2: 80.0, tauC_NPerMm2: 0.47 },
] as const;

/** コンクリート設計基準強度のリスト */
export const CONCRETE_DESIGN_STRENGTHS_N_PER_MM2 = CONCRETE_DATA.map((c) => c.sigmaCk_NPerMm2);

/** コンクリート設計基準強度を表す型 */
export type ConcreteDesignStrengthNPerMm2 = (typeof CONCRETE_DATA)[number]["sigmaCk_NPerMm2"];

/** コンクリート設計基準強度から平均せん断応力度の基本値を取得する関数 */
export function getTauCNPerMm2(concreteDesignStrengthNPerMm2: ConcreteDesignStrengthNPerMm2): number {
  const concrete = CONCRETE_DATA.find((c) => c.sigmaCk_NPerMm2 === concreteDesignStrengthNPerMm2);
  if (!concrete) {
    throw new Error(
      `コンクリート設計基準強度 ${concreteDesignStrengthNPerMm2} N/mm2 のデータが見つかりません。`,
    );
  }
  return concrete.tauC_NPerMm2;
}

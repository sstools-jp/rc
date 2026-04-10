/**
 * 文字列を数値に変換し、変換できない場合は `NaN` を返す。
 * @param value 変換対象の文字列
 * @returns 変換された数値、または `NaN`
 */
export function parseNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

/**
 * 数値を指定桁数まで四捨五入し、非数値や無限大の場合は `-` を返す。
 *
 * 既定では小数点以下の末尾 0 を保持し、`omitTrailingZeros` を `true` にした場合のみ省略する。
 * @param value 整形対象の数値
 * @param digits 小数点以下の最大桁数
 * @param omitTrailingZeros 末尾の 0 を省略するかどうか
 * @returns 整形された文字列
 */
export function formatNumber(value: number | undefined, digits = 4, omitTrailingZeros = false): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "-";
  }

  return new Intl.NumberFormat("ja-JP", {
    maximumFractionDigits: digits,
    minimumFractionDigits: omitTrailingZeros ? 0 : digits,
    useGrouping: false,
  }).format(value);
}

import { describe, expect, it } from "vitest";
import { formatNumber, parseNumber } from "@/utils/number-format";

describe("number-format", () => {
  it("parseNumber は数値化できない文字列を NaN にする", () => {
    expect(parseNumber("12.5")).toBe(12.5);
    expect(Number.isNaN(parseNumber("abc"))).toBe(true);
  });

  it("formatNumber は既定で末尾 0 を保持する", () => {
    expect(formatNumber(1.2, 4)).toBe("1.2000");
    expect(formatNumber(12, 4)).toBe("12.0000");
  });

  it("formatNumber は omitTrailingZeros で末尾 0 を省略できる", () => {
    expect(formatNumber(1.2, 4, true)).toBe("1.2");
    expect(formatNumber(12, 4, true)).toBe("12");
  });

  it("formatNumber は不正値をハイフンにする", () => {
    expect(formatNumber(undefined)).toBe("-");
    expect(formatNumber(Number.NaN)).toBe("-");
    expect(formatNumber(Number.POSITIVE_INFINITY)).toBe("-");
  });
});

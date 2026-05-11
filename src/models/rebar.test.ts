import { describe, expect, it } from "vitest";
import { getRebarYieldStrengthMm2 } from "@/models/rebar";

describe("rebar materials", () => {
  it("材質名から降伏強度を取得できる", () => {
    expect(getRebarYieldStrengthMm2("SD345")).toBe(345);
    expect(getRebarYieldStrengthMm2("SM570")).toBe(570);
  });
});

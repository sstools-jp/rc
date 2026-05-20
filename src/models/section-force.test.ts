import { describe, expect, it } from "vitest";
import { resolveSectionForceComponents } from "@/models/section-force";

describe("section-force", () => {
  it("未指定成分を 0 として換算する", () => {
    expect(
      resolveSectionForceComponents({
        fx_KN: -1200,
        my_KNm: 3500,
      }),
    ).toEqual({
      axial_KN: 1200,
      shear_KN: 0,
      moment_KNm: 3500,
    });
  });
});

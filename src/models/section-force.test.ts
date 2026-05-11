import { describe, expect, it } from "vitest";
import { SectionForce } from "@/models/section-force";

describe("SectionForce", () => {
  it("コンストラクタで正規化し、断面力の表示を返す", () => {
    const force = new SectionForce({
      fx_KN: -12,
      my_KNm: 3,
      mz_KNm: 4,
      fz_KN: 5,
    });

    expect(force.fx_KN).toBe(-12);
    expect(force.fy_KN).toBe(0);
    expect(force.mx_KNm).toBe(0);
    expect(force.sixForce).toEqual({
      fx_KN: -12,
      fy_KN: 0,
      fz_KN: 5,
      mx_KNm: 0,
      my_KNm: 3,
      mz_KNm: 4,
    });
    expect(force.threeForce).toEqual({
      moment_KNm: 5,
      shear_KN: 5,
      axial_KN: 12,
    });
  });

  it("軸力の符号を判定する", () => {
    expect(new SectionForce({ fx_KN: 1 }).axialForceSign).toBe("tension");
    expect(new SectionForce({ fx_KN: -1 }).axialForceSign).toBe("compression");
    expect(new SectionForce({ fx_KN: 0 }).axialForceSign).toBe("zero");
  });
});

import { afterEach, describe, expect, it } from "vitest";
import type { FormState } from "@/forms/form-state";
import {
  buildAnnularSectionShareUrl,
  resolveAnnularSectionPageStateFromUrl,
} from "@/utils/share-url";

const defaultFormState: FormState = {
  fx_KN: "",
  fy_KN: "",
  fz_KN: "",
  mx_KNm: "",
  my_KNm: "",
  mz_KNm: "",
  outerRadius_Mm: "",
  innerRadius_Mm: "",
  rebarRadius_Mm: "",
  rebarKind: "deformed",
  rebarDiameter_Mm: "22",
  roundRebarDiameter_Mm: "22",
  barCount: "",
  rebarStrengthMode: "material",
  rebarMaterialName: "SD345",
  rebarYieldStrength_NPerMm2: "345",
  concreteDesignStrength_NPerMm2: "30",
  youngRatio: "15",
};

const sampleFormState: FormState = {
  fx_KN: "-850.25",
  fy_KN: "126.90",
  fz_KN: "339.11",
  mx_KNm: "0.00",
  my_KNm: "3002.53",
  mz_KNm: "1229.95",
  outerRadius_Mm: "750",
  innerRadius_Mm: "425",
  rebarRadius_Mm: "600",
  rebarKind: "deformed",
  rebarDiameter_Mm: "51",
  roundRebarDiameter_Mm: "36",
  barCount: "12",
  rebarStrengthMode: "direct",
  rebarMaterialName: "SD390",
  rebarYieldStrength_NPerMm2: "365",
  concreteDesignStrength_NPerMm2: "27",
  youngRatio: "14",
};

const defaults = {
  form: defaultFormState,
  sectionForceMode: "3" as const,
};

function setWindowHref(href: string) {
  Object.defineProperty(globalThis, "window", {
    value: {
      location: {
        href,
      },
    },
    writable: true,
    configurable: true,
  });
}

afterEach(() => {
  Reflect.deleteProperty(globalThis, "window");
});

describe("share-url", () => {
  it("共有URLは v パラメータ単一で生成される", () => {
    setWindowHref("http://localhost:5173/");

    const url = buildAnnularSectionShareUrl(sampleFormState, "6");
    const searchParams = new URL(url).searchParams;

    expect(searchParams.has("v")).toBe(true);
    expect(Array.from(searchParams.keys())).toEqual(["v"]);
  });

  it("共有URLを round-trip 復元できる", () => {
    setWindowHref("http://localhost:5173/");
    const url = buildAnnularSectionShareUrl(sampleFormState, "6");

    setWindowHref(url);
    const restored = resolveAnnularSectionPageStateFromUrl(defaults, (rawForm) => {
      return { ...defaults.form, ...rawForm } as FormState;
    });

    expect(restored).not.toBeNull();
    expect(restored?.sectionForceMode).toBe("6");
    expect(restored?.form).toEqual(sampleFormState);
  });

  it("破損した v パラメータは null を返す", () => {
    setWindowHref("http://localhost:5173/?v=broken_payload");

    const restored = resolveAnnularSectionPageStateFromUrl(defaults, (rawForm) => {
      return { ...defaults.form, ...rawForm } as FormState;
    });

    expect(restored).toBeNull();
  });

  it("v が無い場合は null を返す", () => {
    setWindowHref("http://localhost:5173/");

    const restored = resolveAnnularSectionPageStateFromUrl(defaults, (rawForm) => {
      return { ...defaults.form, ...rawForm } as FormState;
    });

    expect(restored).toBeNull();
  });
});

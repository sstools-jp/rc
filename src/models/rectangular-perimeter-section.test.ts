import { describe, expect, it } from "vitest";
import { RectanglarPerimeterSectionCalculator } from "@/models/rectangular-perimeter-section";
import type { MaterialParams } from "@/models/section-types";
// import { getRebarAreaMm2, type RebarDiameter_Mm } from "@/models/rebar";
// import type { SectionForce } from "@/models/section-force";

const materialParams: MaterialParams = {
  youngRatio: 15, // ヤング係数比
  rebarYieldStrength_NPerMm2: 345, // 鉄筋降伏強度 [N/mm2]
  concreteDesignStrength_NPerMm2: 30, // コンクリート設計基準強度 [N/mm2]
};

describe("RectangularPerimeterSectionCalculator", () => {
  it("計算結果の照合 (1)", () => {
    const calculator = new RectanglarPerimeterSectionCalculator({
      force: {
        fx_KN: -500, // 軸力 [kN]
        fz_KN: 200, // せん断力（面内） [kN]
        my_KNm: 100, // 曲げモーメント（面内） [kN.m]
      },
      geometry: {
        width_Mm: 800, // 幅 [mm]
        height_Mm: 600, // 高さ [mm]
        subRebarEffectiveHeight_Mm: 550, // 複鉄筋の引張鉄筋の有効高さ [mm]
        subRebarCover_Mm: 50, // 複鉄筋の圧縮鉄筋の被り [mm]
        subRebarKind: "deformed", // 複鉄筋の種類
        subRebarDiameter_Mm: 22, // 複鉄筋の径 [mm]
        subRebarCount: 13, // 複鉄筋の本数 [本/片側、角筋含む]
        sideRebarKind: "deformed", // 側鉄筋の種類
        sideRebarDiameter_Mm: 22, // 側鉄筋の径 [mm]
        sideRebarCount: 7, // 側鉄筋の本数 [本/片側]
      },
      materialParams,
    });

    const result = calculator.calculate(); // 矩形周囲鉄筋断面を計算
    const section = result.section;
    const neutralAxis = result.neutralAxis;
    const stress = result.stress;

    // 計算結果を検証
    expect(section.mainRebarArea_Mm2).toBeCloseTo(5032, 0); // 主鉄筋の断面積 [mm2]
    expect(section.sideRebarArea_Mm2).toBeCloseTo(2710, 0); // 側鉄筋の断面積（片側当り） [mm2]
    expect(section.rebarRatioPercent).toBeCloseTo(1.14, 2); // 鉄筋比 [%]

    expect(neutralAxis.concreteCompressionCoefficient).toBeCloseTo(2.0818, 3); // コンクリート曲げ圧縮応力度の係数
    expect(neutralAxis.steelStressCoefficient).toBeCloseTo(0.4558, 3); // 鉄筋曲げ引張応力度の係数
    expect(neutralAxis.shearCoefficient).toBeCloseTo(0.8001, 3); // コンクリートせん断応力度の係数

    expect(stress.concreteCompressionStress_NPerMm2).toBeCloseTo(1.9, 1); // コンクリート曲げ圧縮応力度 [N/mm2]
    expect(stress.rebarStress_NPerMm2).toBeCloseTo(6.4, 1); // 鉄筋曲げ引張応力度 [N/mm2]
    expect(stress.concreteShearStress_NPerMm2).toBeCloseTo(0.364, 3); // コンクリートせん断応力度 [N/mm2]
    expect(stress.rebarShearStress_NPerMm2).toBeCloseTo(0.455, 3); // 鉄筋せん断応力度 [N/mm2]
  });

  it("計算結果の照合 (2)", () => {
    const calculator = new RectanglarPerimeterSectionCalculator({
      force: {
        fx_KN: -500, // 軸力 [kN]
        fz_KN: 200, // せん断力（面内） [kN]
        my_KNm: 180, // 曲げモーメント（面内） [kN.m]
      },
      geometry: {
        width_Mm: 1200, // 幅 [mm]
        height_Mm: 800, // 高さ [mm]
        subRebarEffectiveHeight_Mm: 755, // 複鉄筋の引張鉄筋の有効高さ [mm]
        subRebarCover_Mm: 55, // 複鉄筋の圧縮鉄筋の被り [mm]
        subRebarKind: "deformed", // 複鉄筋の種類
        subRebarDiameter_Mm: 25, // 複鉄筋の径 [mm]
        subRebarCount: 15, // 複鉄筋の本数 [本/片側、角筋含む]
        sideRebarKind: "deformed", // 側鉄筋の種類
        sideRebarDiameter_Mm: 25, // 側鉄筋の径 [mm]
        sideRebarCount: 9, // 側鉄筋の本数 [本/片側]
      },
      materialParams,
    });

    const result = calculator.calculate(); // 矩形周囲鉄筋断面を計算
    const section = result.section;
    const neutralAxis = result.neutralAxis;
    const stress = result.stress;

    // 計算結果を検証
    expect(section.mainRebarArea_Mm2).toBeCloseTo(7601, 0); // 主鉄筋の断面積 [mm2]
    expect(section.sideRebarArea_Mm2).toBeCloseTo(4560, 0); // 側鉄筋の断面積（片側当り） [mm2]
    expect(section.rebarRatioPercent).toBeCloseTo(0.84, 2); // 鉄筋比 [%]

    expect(neutralAxis.concreteCompressionCoefficient).toBeCloseTo(2.5324, 3); // コンクリート曲げ圧縮応力度の係数
    expect(neutralAxis.steelStressCoefficient).toBeCloseTo(1.2376, 3); // 鉄筋曲げ引張応力度の係数
    expect(neutralAxis.shearCoefficient).toBeCloseTo(0.9655, 3); // コンクリートせん断応力度の係数

    expect(stress.concreteCompressionStress_NPerMm2).toBeCloseTo(1.3, 1); // コンクリート曲げ圧縮応力度 [N/mm2]
    expect(stress.rebarStress_NPerMm2).toBeCloseTo(9.7, 1); // 鉄筋曲げ引張応力度 [N/mm2]
    expect(stress.concreteShearStress_NPerMm2).toBeCloseTo(0.213, 3); // コンクリートせん断応力度 [N/mm2]
    expect(stress.rebarShearStress_NPerMm2).toBeCloseTo(0.221, 3); // 鉄筋せん断応力度 [N/mm2]
  });
});

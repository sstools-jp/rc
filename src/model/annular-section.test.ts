import { describe, expect, it } from "vitest";
import { AnnularSectionCalculator } from "@/model/annular-section";

describe("AnnularSectionCalculator", () => {
  it("計算結果の照合 (1)", () => {
    const calculator = new AnnularSectionCalculator({
      force: {
        fx_KN: -500, // 軸力 [kN]
        fy_KN: 0, // せん断力（面外） [kN]
        fz_KN: 200, // せん断力（面内） [kN]
        mx_KNm: 0, // ねじりモーメント [kN.m]
        my_KNm: 1250, // 曲げモーメント（面内） [kN.m]
        mz_KNm: 0, // 曲げモーメント（面外） [kN.m]
      },
      geometry: {
        outerRadius_Mm: 800, // 外径 [mm]
        innerRadius_Mm: 600, // 内径 [mm]
        rebarRadius_Mm: 700, // 鉄筋半径 [mm]
        rebarDiameter_Mm: 22, // 鉄筋径 [mm]
        barCount: 16, // 鉄筋本数
      },
      materialParams: {
        youngRatio: 15, // ヤング係数比
        rebarYieldStrength_NPerMm2: 345, // 鉄筋降伏強度 [N/mm2]
        concreteDesignStrength_NPerMm2: 30, // コンクリート設計基準強度 [N/mm2]
      },
    });

    const result = calculator.calculate(); // 円環断面を計算
    const section = result.section;
    const neutralAxis = result.neutralAxis;
    const stress = result.stress;

    // 計算結果を検証
    expect(section.totalRebarArea_Mm2).toBeCloseTo(6194, 0); // 鉄筋断面積 [mm2]
    expect(section.rebarRatioPercent).toBeCloseTo(0.31, 2); // 鉄筋比 [%]
    expect(neutralAxis.neutralAxisPosition_Mm).toBeCloseTo(420, 0); // 中立軸位置 [mm]
    expect(neutralAxis.concreteCompressionCoefficient).toBeCloseTo(2.6455, 4); // コンクリート曲げ圧縮応力度の係数
    expect(neutralAxis.steelStressCoefficient).toBeCloseTo(6.7991, 4); // 鉄筋曲げ引張応力度の係数
    expect(neutralAxis.shearCoefficient).toBeCloseTo(1.2053, 4); // コンクリートせん断応力度の係数
    expect(stress.concreteCompressionStress_NPerMm2).toBeCloseTo(8.53, 2); // コンクリート曲げ圧縮応力度 [N/mm2]
    expect(stress.rebarStress_NPerMm2).toBeCloseTo(328.7, 1); // 鉄筋曲げ引張応力度 [N/mm2]
    expect(stress.concreteShearStress_NPerMm2).toBeCloseTo(0.37, 3); // コンクリートせん断応力度 [N/mm2]
    expect(stress.rebarShearStress_NPerMm2).toBeCloseTo(0.007, 3); // 鉄筋せん断応力度 [N/mm2]
  });

  it("計算結果の照合 (2)", () => {
    const calculator = new AnnularSectionCalculator({
      force: {
        fx_KN: -1800, // 軸力 [kN]
        fy_KN: 0, // せん断力（面外） [kN]
        fz_KN: 1200, // せん断力（面内） [kN]
        mx_KNm: 0, // ねじりモーメント [kN.m]
        my_KNm: 850, // 曲げモーメント（面内） [kN.m]
        mz_KNm: 0, // 曲げモーメント（面外） [kN.m]
      },
      geometry: {
        outerRadius_Mm: 1200, // 外径 [mm]
        innerRadius_Mm: 900, // 内径 [mm]
        rebarRadius_Mm: 1050, // 鉄筋半径 [mm]
        rebarDiameter_Mm: 22, // 鉄筋径 [mm]
        barCount: 24, // 鉄筋本数
      },
      materialParams: {
        youngRatio: 15, // ヤング係数比
        rebarYieldStrength_NPerMm2: 345, // 鉄筋降伏強度 [N/mm2]
        concreteDesignStrength_NPerMm2: 30, // コンクリート設計基準強度 [N/mm2]
      },
    });

    const result = calculator.calculate(); // 円環断面を計算
    const section = result.section;
    const neutralAxis = result.neutralAxis;
    const stress = result.stress;

    // 計算結果を検証
    expect(section.totalRebarArea_Mm2).toBeCloseTo(9290, 0); // 鉄筋断面積 [mm2]
    expect(section.rebarRatioPercent).toBeCloseTo(0.21, 2); // 鉄筋比 [%]
    expect(neutralAxis.neutralAxisPosition_Mm).toBeCloseTo(2224, 0); // 中立軸位置 [mm]
    expect(neutralAxis.concreteCompressionCoefficient).toBeCloseTo(0.9211, 4); // コンクリート曲げ圧縮応力度の係数
    expect(neutralAxis.steelStressCoefficient).toBeCloseTo(0.0108, 4); // 鉄筋曲げ引張応力度の係数
    expect(neutralAxis.shearCoefficient).toBeCloseTo(0.0129, 4); // コンクリートせん断応力度の係数
    expect(stress.concreteCompressionStress_NPerMm2).toBeCloseTo(1.6, 1); // コンクリート曲げ圧縮応力度 [N/mm2]
    expect(stress.rebarStress_NPerMm2).toBeCloseTo(0.3, 1); // 鉄筋曲げ引張応力度 [N/mm2]
    expect(stress.concreteShearStress_NPerMm2).toBeCloseTo(0.011, 3); // コンクリートせん断応力度 [N/mm2]
    expect(stress.rebarShearStress_NPerMm2).toBeCloseTo(0, 3); // 鉄筋せん断応力度 [N/mm2]
  });

  it("コンクリート設計基準強度を変更した場合のせん断応力度の照合", () => {
    const calculator = new AnnularSectionCalculator({
      force: {
        fx_KN: -500, // 軸力 [kN]
        fy_KN: 0, // せん断力（面外） [kN]
        fz_KN: 200, // せん断力（面内） [kN]
        mx_KNm: 0, // ねじりモーメント [kN.m]
        my_KNm: 1250, // 曲げモーメント（面内） [kN.m]
        mz_KNm: 0, // 曲げモーメント（面外） [kN.m]
      },
      geometry: {
        outerRadius_Mm: 800, // 外径 [mm]
        innerRadius_Mm: 600, // 内径 [mm]
        rebarRadius_Mm: 700, // 鉄筋半径 [mm]
        rebarDiameter_Mm: 22, // 鉄筋径 [mm]
        barCount: 16, // 鉄筋本数
      },
      materialParams: {
        youngRatio: 15, // ヤング係数比
        rebarYieldStrength_NPerMm2: 345, // 鉄筋降伏強度 [N/mm2]
        concreteDesignStrength_NPerMm2: 24, // コンクリート設計基準強度 [N/mm2]
      },
    });

    const result = calculator.calculate(); // 円環断面を計算
    const stress = result.stress;

    // 計算結果を検証
    expect(stress.concreteShearStress_NPerMm2).toBeCloseTo(0.35, 3); // コンクリートせん断応力度 [N/mm2]
    expect(stress.rebarShearStress_NPerMm2).toBeCloseTo(0.027, 3); // 鉄筋せん断応力度 [N/mm2]
  });

  it("計算結果の照合 (曲げモーメントのみ)", () => {
    const calculator = new AnnularSectionCalculator({
      force: {
        fx_KN: 0, // 軸力 [kN]
        fy_KN: 0, // せん断力（面外） [kN]
        fz_KN: 0, // せん断力（面内） [kN]
        mx_KNm: 0, // ねじりモーメント [kN.m]
        my_KNm: 2.5, // 曲げモーメント（面内） [kN.m]
        mz_KNm: 0, // 曲げモーメント（面外） [kN.m]
      },
      geometry: {
        outerRadius_Mm: 1200, // 外径 [mm]
        innerRadius_Mm: 800, // 内径 [mm]
        rebarRadius_Mm: 1025, // 鉄筋半径 [mm]
        rebarDiameter_Mm: 51, // 鉄筋径 [mm]
        barCount: 16, // 鉄筋本数
      },
      materialParams: {
        youngRatio: 15, // ヤング係数比
        rebarYieldStrength_NPerMm2: 345, // 鉄筋降伏強度 [N/mm2]
        concreteDesignStrength_NPerMm2: 30, // コンクリート設計基準強度 [N/mm2]
      },
    });

    const result = calculator.calculate(); // 円環断面を計算
    const section = result.section;
    const neutralAxis = result.neutralAxis;
    const stress = result.stress;

    // 計算結果を検証
    expect(section.totalRebarArea_Mm2).toBeCloseTo(32432, 0); // 鉄筋断面積 [mm2]
    expect(section.rebarRatioPercent).toBeCloseTo(0.72, 2); // 鉄筋比 [%]
    expect(neutralAxis.neutralAxisPosition_Mm).toBeCloseTo(668, 0); // 中立軸位置 [mm]
    expect(neutralAxis.concreteCompressionCoefficient).toBeCloseTo(2.3142, 4); // コンクリート曲げ圧縮応力度の係数
    expect(neutralAxis.steelStressCoefficient).toBeCloseTo(5.3907, 4); // 鉄筋曲げ引張応力度の係数
    expect(neutralAxis.shearCoefficient).toBeCloseTo(0.9355, 4); // コンクリートせん断応力度の係数
    expect(stress.concreteCompressionStress_NPerMm2).toBeCloseTo(0, 1); // コンクリート曲げ圧縮応力度 [N/mm2]
    expect(stress.rebarStress_NPerMm2).toBeCloseTo(0.1, 1); // 鉄筋曲げ引張応力度 [N/mm2]
    expect(stress.concreteShearStress_NPerMm2).toBeCloseTo(0, 3); // コンクリートせん断応力度 [N/mm2]
    expect(stress.rebarShearStress_NPerMm2).toBeCloseTo(0, 3); // 鉄筋せん断応力度 [N/mm2]
  });

  it("不正な入力の場合はエラー", () => {
    const calculator = new AnnularSectionCalculator({
      force: {
        fx_KN: 0, // 軸力 [kN]
        fy_KN: 0, // せん断力（面外） [kN]
        fz_KN: 0, // せん断力（面内） [kN]
        mx_KNm: 0, // ねじりモーメント [kN.m]
        my_KNm: 0.1, // 曲げモーメント（面内） [kN.m]
        mz_KNm: 0, // 曲げモーメント（面外） [kN.m]
      },
      geometry: {
        outerRadius_Mm: 300, // 外径 [mm]
        innerRadius_Mm: 400, // 内径 [mm]
        rebarRadius_Mm: 200, // 鉄筋半径 [mm]
        rebarDiameter_Mm: 10, // 鉄筋径 [mm]
        barCount: 8, // 鉄筋本数
      },
      materialParams: {
        youngRatio: 15, // ヤング係数比
        rebarYieldStrength_NPerMm2: 345, // 鉄筋降伏強度 [N/mm2]
        concreteDesignStrength_NPerMm2: 30, // コンクリート設計基準強度 [N/mm2]
      },
    });

    expect(() => calculator.calculate()).toThrow("半径（内）は半径（外）以下で指定してください。");
  });

  it("鉄筋本数に小数を指定できる", () => {
    const calculator = new AnnularSectionCalculator({
      force: {
        fx_KN: 0, // 軸力 [kN]
        fy_KN: 0, // せん断力（面外） [kN]
        fz_KN: 0, // せん断力（面内） [kN]
        mx_KNm: 0, // ねじりモーメント [kN.m]
        my_KNm: 10, // 曲げモーメント（面内） [kN.m]
        mz_KNm: 0, // 曲げモーメント（面外） [kN.m]
      },
      geometry: {
        outerRadius_Mm: 500, // 外径 [mm]
        innerRadius_Mm: 200, // 内径 [mm]
        rebarRadius_Mm: 350, // 鉄筋半径 [mm]
        rebarDiameter_Mm: 10, // 鉄筋径 [mm]
        barCount: 8.5, // 鉄筋本数
      },
      materialParams: {
        youngRatio: 15, // ヤング係数比
        rebarYieldStrength_NPerMm2: 345, // 鉄筋降伏強度 [N/mm2]
        concreteDesignStrength_NPerMm2: 30, // コンクリート設計基準強度 [N/mm2]
      },
    });

    const result = calculator.calculate();

    expect(result.section.totalRebarArea_Mm2).toBeCloseTo(606.3, 1);
    expect(result.section.rebarRatioPercent).toBeGreaterThan(0);
  });
});

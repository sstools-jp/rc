import { describe, expect, it } from "vitest";
import { AnnularSectionCalculator } from "./annular-section";

describe("AnnularSectionCalculator", () => {
  it("計算結果の照合 (1)", () => {
    const calculator = new AnnularSectionCalculator({
      // 入力値
      momentKNm: 1250, // 曲げモーメント [kN.m]
      shearKN: 200, // せん断力 [kN]
      axialKN: 500, // 軸力 [kN]
      outerRadiusMm: 800, // 外径 [mm]
      innerRadiusMm: 600, // 内径 [mm]
      rebarRadiusMm: 700, // 鉄筋半径 [mm]
      rebarDiameterMm: 22, // 鉄筋径 [mm]
      barCount: 16, // 鉄筋本数
      youngRatio: 15, // ヤング係数比
      rebarYieldStrengthNPerMm2: 345, // 鉄筋降伏強度 [N/mm2]
      concreteDesignStrengthNPerMm2: 30, // コンクリート設計基準強度 [N/mm2]
    });

    const result = calculator.calculate(); // 円環断面を計算

    // 計算結果を検証
    expect(result.totalRebarAreaMm2).toBeCloseTo(6194, 0); // 鉄筋断面積 [mm2]
    expect(result.rebarRatioPercent).toBeCloseTo(0.31, 2); // 鉄筋比 [%]
    expect(result.neutralAxisPositionMm).toBeCloseTo(420, 0); // 中立軸位置 [mm]
    expect(result.concreteCompressionCoefficient).toBeCloseTo(2.6455, 4); // コンクリート曲げ圧縮応力度の係数
    expect(result.steelStressCoefficient).toBeCloseTo(6.7991, 4); // 鉄筋曲げ引張応力度の係数
    expect(result.shearCoefficient).toBeCloseTo(1.2053, 4); // コンクリートせん断応力度の係数
    expect(result.concreteCompressionStressNPerMm2).toBeCloseTo(8.53, 2); // コンクリート曲げ圧縮応力度 [N/mm2]
    expect(result.rebarStressNPerMm2).toBeCloseTo(328.7, 1); // 鉄筋曲げ引張応力度 [N/mm2]
    expect(result.concreteShearStressNPerMm2).toBeCloseTo(0.377, 3); // コンクリートせん断応力度 [N/mm2]
  });

  it("計算結果の照合 (2)", () => {
    const calculator = new AnnularSectionCalculator({
      momentKNm: 850, // 曲げモーメント [kN.m]
      shearKN: 1200, // せん断力 [kN]
      axialKN: 1800, // 軸力 [kN]
      outerRadiusMm: 1200, // 外径 [mm]
      innerRadiusMm: 900, // 内径 [mm]
      rebarRadiusMm: 1050, // 鉄筋半径 [mm]
      rebarDiameterMm: 22, // 鉄筋径 [mm]
      barCount: 24, // 鉄筋本数
      youngRatio: 15, // ヤング係数比
      rebarYieldStrengthNPerMm2: 345, // 鉄筋降伏強度 [N/mm2]
      concreteDesignStrengthNPerMm2: 30, // コンクリート設計基準強度 [N/mm2]
    });

    const result = calculator.calculate(); // 円環断面を計算

    // 計算結果を検証
    expect(result.totalRebarAreaMm2).toBeCloseTo(9290, 0); // 鉄筋断面積 [mm2]
    expect(result.rebarRatioPercent).toBeCloseTo(0.21, 2); // 鉄筋比 [%]
    expect(result.neutralAxisPositionMm).toBeCloseTo(2224, 0); // 中立軸位置 [mm]
    expect(result.concreteCompressionCoefficient).toBeCloseTo(0.9211, 4); // コンクリート曲げ圧縮応力度の係数
    expect(result.steelStressCoefficient).toBeCloseTo(0.0108, 4); // 鉄筋曲げ引張応力度の係数
    expect(result.shearCoefficient).toBeCloseTo(0.0129, 4); // コンクリートせん断応力度の係数
    expect(result.concreteCompressionStressNPerMm2).toBeCloseTo(1.6, 1); // コンクリート曲げ圧縮応力度 [N/mm2]
    expect(result.rebarStressNPerMm2).toBeCloseTo(0.3, 1); // 鉄筋曲げ引張応力度 [N/mm2]
    expect(result.concreteShearStressNPerMm2).toBeCloseTo(0.011, 3); // コンクリートせん断応力度 [N/mm2]
  });

  it("計算結果の照合 (曲げモーメントのみ)", () => {
    const calculator = new AnnularSectionCalculator({
      momentKNm: 2.5, // 曲げモーメント [kN.m]
      shearKN: 0, // せん断力 [kN]
      axialKN: 0, // 軸力 [kN]
      outerRadiusMm: 1200, // 外径 [mm]
      innerRadiusMm: 800, // 内径 [mm]
      rebarRadiusMm: 1025, // 鉄筋半径 [mm]
      rebarDiameterMm: 51, // 鉄筋径 [mm]
      barCount: 16, // 鉄筋本数
      youngRatio: 15, // ヤング係数比
      rebarYieldStrengthNPerMm2: 345, // 鉄筋降伏強度 [N/mm2]
      concreteDesignStrengthNPerMm2: 30, // コンクリート設計基準強度 [N/mm2]
    });

    const result = calculator.calculate(); // 円環断面を計算

    // 計算結果を検証
    expect(result.totalRebarAreaMm2).toBeCloseTo(32432, 0); // 鉄筋断面積 [mm2]
    expect(result.rebarRatioPercent).toBeCloseTo(0.72, 2); // 鉄筋比 [%]
    expect(result.neutralAxisPositionMm).toBeCloseTo(668, 0); // 中立軸位置 [mm]
    expect(result.concreteCompressionCoefficient).toBeCloseTo(2.3142, 4); // コンクリート曲げ圧縮応力度の係数
    expect(result.steelStressCoefficient).toBeCloseTo(5.3907, 4); // 鉄筋曲げ引張応力度の係数
    expect(result.shearCoefficient).toBeCloseTo(0.9355, 4); // コンクリートせん断応力度の係数
    expect(result.concreteCompressionStressNPerMm2).toBeCloseTo(0, 1); // コンクリート曲げ圧縮応力度 [N/mm2]
    expect(result.rebarStressNPerMm2).toBeCloseTo(0.1, 1); // 鉄筋曲げ引張応力度 [N/mm2]
    expect(result.concreteShearStressNPerMm2).toBeCloseTo(0, 3); // コンクリートせん断応力度 [N/mm2]
  });

  it("不正な入力の場合はエラー", () => {
    const calculator = new AnnularSectionCalculator({
      momentKNm: 0.1, // 曲げモーメント [kN.m]
      shearKN: 0, // せん断力 [kN]
      axialKN: 0, // 軸力 [kN]
      outerRadiusMm: 300, // 外径 [mm]
      innerRadiusMm: 400, // 内径 [mm]
      rebarRadiusMm: 200, // 鉄筋半径 [mm]
      rebarDiameterMm: 10, // 鉄筋径 [mm]
      barCount: 8, // 鉄筋本数
      youngRatio: 15, // ヤング係数比
      rebarYieldStrengthNPerMm2: 345, // 鉄筋降伏強度 [N/mm2]
      concreteDesignStrengthNPerMm2: 30, // コンクリート設計基準強度 [N/mm2]
    });

    expect(() => calculator.calculate()).toThrow("半径（内）は半径（外）以下で指定してください。");
  });
});

import { getRebarAreaMm2ByKind, type RebarKind } from "@/models/rebar";

/** 矩形周囲鉄筋の形状を表す入力型定義 */
export interface RectanglarPerimeterSectionGeometryInput {
  /** 幅 [mm] */
  width_Mm: number;
  /** 高さ [mm] */
  height_Mm: number;
  /** 複鉄筋の引張鉄筋の有効高さ [mm] */
  subRebarEffectiveHeight_Mm: number;
  /** 複鉄筋の圧縮鉄筋の被り [mm] */
  subRebarCover_Mm: number;
  /** 複鉄筋の種類 */
  subRebarKind: RebarKind;
  /** 複鉄筋の径 [mm] */
  subRebarDiameter_Mm: number;
  /** 複鉄筋の本数 [本/片側] */
  subRebarCount: number;
  /** 側鉄筋の種類 */
  sideRebarKind: RebarKind;
  /** 側鉄筋の径 [mm] */
  sideRebarDiameter_Mm: number;
  /** 側鉄筋の本数 [本/片側] */
  sideRebarCount: number;
}

/** 矩形周囲鉄筋の形状を表す値オブジェクト */
export class RectanglarPerimeterSectionGeometry {
  readonly width_Mm: number;
  readonly height_Mm: number;
  readonly subRebarEffectiveHeight_Mm: number;
  readonly subRebarCover_Mm: number;
  readonly subRebarKind: RebarKind;
  readonly subRebarDiameter_Mm: number;
  readonly subRebarCount: number;
  readonly sideRebarKind: RebarKind;
  readonly sideRebarDiameter_Mm: number;
  readonly sideRebarCount: number;

  private constructor(input: RectanglarPerimeterSectionGeometryInput) {
    this.width_Mm = input.width_Mm;
    this.height_Mm = input.height_Mm;
    this.subRebarEffectiveHeight_Mm = input.subRebarEffectiveHeight_Mm;
    this.subRebarCover_Mm = input.subRebarCover_Mm;
    this.subRebarKind = input.subRebarKind;
    this.subRebarDiameter_Mm = input.subRebarDiameter_Mm;
    this.subRebarCount = input.subRebarCount;
    this.sideRebarKind = input.sideRebarKind;
    this.sideRebarDiameter_Mm = input.sideRebarDiameter_Mm;
    this.sideRebarCount = input.sideRebarCount;
  }

  /** 入力値から値オブジェクトを生成する */
  static fromInput(input: RectanglarPerimeterSectionGeometryInput): RectanglarPerimeterSectionGeometry {
    return new RectanglarPerimeterSectionGeometry(input);
  }

  /** 断面積 [mm2] */
  get sectionArea_Mm2(): number {
    return this.width_Mm * this.height_Mm;
  }

  /** 全断面積 [mm2] */
  get fullSectionArea_Mm2(): number {
    return this.sectionArea_Mm2;
  }

  /** 複鉄筋の1本あたりの断面積 [mm2] */
  get subRebarAreaPerBar_Mm2(): number {
    return this.hasSubRebar ? getRebarAreaMm2ByKind(this.subRebarKind, this.subRebarDiameter_Mm) : 0;
  }

  /** 複鉄筋の断面積 [mm2] */
  get mainRebarArea_Mm2(): number {
    return this.subRebarAreaPerBar_Mm2 * this.subRebarCount;
  }

  /** 側鉄筋の1本あたりの断面積 [mm2] */
  get sideRebarAreaPerBar_Mm2(): number {
    return this.hasSideRebar ? getRebarAreaMm2ByKind(this.sideRebarKind, this.sideRebarDiameter_Mm) : 0;
  }

  /** 側鉄筋の断面積 [mm2] */
  get sideRebarArea_Mm2(): number {
    return this.sideRebarAreaPerBar_Mm2 * this.sideRebarCount;
  }

  /** 複鉄筋比 [%] */
  get rebarRatioPercent(): number {
    if (this.sectionArea_Mm2 === 0) {
      return 0;
    }
    return (this.totalRebarArea_Mm2 / this.sectionArea_Mm2) * 100;
  }

  /** 全配筋断面積 [mm2] */
  get totalRebarArea_Mm2(): number {
    return this.mainRebarArea_Mm2 + this.sideRebarArea_Mm2;
  }

  /** 複鉄筋の有効高さの中心からのずれ [mm] */
  get eccentricity_Mm(): number {
    return this.subRebarEffectiveHeight_Mm - this.height_Mm / 2;
  }

  /** 複鉄筋があるかどうか */
  get hasSubRebar(): boolean {
    return this.subRebarCount > 0 && this.subRebarDiameter_Mm > 0;
  }

  /** 側鉄筋があるかどうか */
  get hasSideRebar(): boolean {
    return this.sideRebarCount > 0 && this.sideRebarDiameter_Mm > 0;
  }
}
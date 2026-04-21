# コンポーネント階層図

この図はアプリ起点の React コンポーネント階層を表す。

`src/main.tsx` から `src/App.tsx` を経由し、画面を構成する各コンポーネントへ展開する。

### 全体構成

```mermaid
%%{init: {'flowchart': {'curve': 'linear'}} }%%
flowchart TB
  Main["src/main.tsx"] --> App["App"]
  App --> InputFormPanel["AnnularSectionInputFormPanel"]
  App --> ResultPanel["AnnularSectionResultPanel"]
  App --> PrintPreviewModal["PrintPreviewModal"]
  App --> StatusBar["StatusBar"]
```

### 入力フォーム

```mermaid
%%{init: {'flowchart': {'curve': 'linear'}} }%%
flowchart TB
  InputFormPanel["AnnularSectionInputFormPanel"] --> SectionForceModeSelector["SectionForceModeSelector"]
  InputFormPanel --> AppButton["AppButton"]
  InputFormPanel --> FieldRow["FieldRow"]
  FieldRow --> FieldInput["FieldInput"]
  FieldRow --> FieldSelect["FieldSelect"]
  FieldRow --> SymbolText["SymbolText"]
```

### 結果表示

```mermaid
%%{init: {'flowchart': {'curve': 'linear'}} }%%
flowchart TB
  ResultPanel["AnnularSectionResultPanel"] --> AppButton["AppButton"]
  ResultPanel --> CrossSectionPreview["CrossSectionPreview"]
  ResultPanel --> CollapsibleSection["CollapsibleSection"]
  ResultPanel --> ResultCell["ResultCell"]
  CrossSectionPreview --> PreviewLegend["PreviewLegend"]
```

### 印刷プレビュー

```mermaid
%%{init: {'flowchart': {'curve': 'linear'}} }%%
flowchart TB
  PrintPreviewModal["PrintPreviewModal"] --> AppButton["AppButton"]
  PrintPreviewModal --> SymbolText["SymbolText"]
  PrintPreviewModal --> PreviewTable["PreviewTable"]
  PrintPreviewModal --> HeadlessDialog["Headless UI Dialog / DialogPanel"]
  PreviewTable --> SymbolText
```

## 補足

- [src/components/InputForm.tsx](../src/components/InputForm.tsx)
  - 入力フォーム本体
  - 内部の `FieldRow`、`FieldInput`、`FieldSelect`
- [src/components/ResultPanel.tsx](../src/components/ResultPanel.tsx)
  - 結果表示パネル
  - 折りたたみセクション、断面プレビュー
- [src/components/PrintPreviewModal.tsx](../src/components/PrintPreviewModal.tsx)
  - 印刷プレビュー用のモーダル
  - 印刷・コピー用の操作部品

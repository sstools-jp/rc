/**
 * 数式記号を表示する。
 * 2文字以上なら先頭を通常表示し、残りを下付き文字として表示する。
 */
export function SymbolText({ value }: { value: string }) {
  if (value.length <= 1) {
    return <>{value}</>;
  }

  return (
    <>
      {value[0]}
      <sub>{value.slice(1)}</sub>
    </>
  );
}

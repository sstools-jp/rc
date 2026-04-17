export type SectionForceMode = "3" | "6";

type SectionForceModeSelectorProps = {
  value: SectionForceMode;
  onChange: (value: SectionForceMode) => void;
};

export function SectionForceModeSelector({ value, onChange }: SectionForceModeSelectorProps) {
  return (
    <fieldset className="mr-2 flex gap-4 text-sm">
      <legend className="sr-only">断面力タイプ</legend>
      <label className="flex gap-1.5">
        <input
          type="radio"
          name="section-force-mode"
          checked={value === "3"}
          onChange={() => onChange("3")}
        />
        <span>3断面力</span>
      </label>
      <label className="flex gap-1.5">
        <input
          type="radio"
          name="section-force-mode"
          checked={value === "6"}
          onChange={() => onChange("6")}
        />
        <span>6断面力</span>
      </label>
    </fieldset>
  );
}
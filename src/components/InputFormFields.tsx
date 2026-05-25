import type { ReactNode } from "react";
import { SymbolText } from "@/components/SymbolText";
import type { FormState } from "@/forms/form-state";
import { REBAR_DIAMETERS_MM, REBAR_MATERIALS, getRebarYieldStrengthMm2 } from "@/models/rebar";
import { cn } from "@/utils/cn";

const GRID_ROW_CLASS = cn(
  "grid grid-cols-[minmax(0,1fr)_2.5rem_3rem_4.5rem]",
  "divide-x divide-slate-300",
  "border-b border-slate-300 last:border-b-0",
);

type FieldRowProps = {
  label: string;
  symbol: string;
  unit: string;
  children: ReactNode;
};

export function FieldRow({ label, symbol, unit, children }: FieldRowProps) {
  return (
    <div className={GRID_ROW_CLASS}>
      <div className="px-2 py-1">{label}</div>
      <div className="px-1 py-1 text-center font-mono">
        <SymbolText value={symbol} />
      </div>
      <div className="px-1 py-1 text-center font-mono">{unit}</div>
      <div className="bg-white">{children}</div>
    </div>
  );
}

export function FieldGridHeader() {
  return (
    <div
      className={cn(GRID_ROW_CLASS, "bg-slate-200/50 text-xs font-semibold tracking-wider text-slate-600")}
    >
      <div className="px-2 py-1 text-center">項目名</div>
      <div className="px-1 py-1 text-center">記号</div>
      <div className="px-1 py-1 text-center">単位</div>
      <div className="px-1 py-1 text-center">入力値</div>
    </div>
  );
}

type FieldInputProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur: (value: string) => void;
  inputMode?: "decimal" | "numeric";
  readOnly?: boolean;
};

export function FieldInput({
  value,
  onChange,
  onBlur,
  inputMode = "decimal",
  readOnly = false,
}: FieldInputProps) {
  const className = cn(
    "box-border block h-full w-full [appearance:textfield] border border-transparent px-1 py-0.5 text-right font-mono outline-none placeholder:text-slate-400",
    "focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 focus:ring-inset",
    "read-only:bg-slate-50 read-only:text-slate-600 read-only:caret-transparent read-only:focus:border-transparent read-only:focus:ring-0",
    "[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
  );

  return (
    <input
      type="number"
      inputMode={inputMode}
      step="any"
      className={className}
      value={value}
      readOnly={readOnly}
      aria-readonly={readOnly}
      onFocus={(event) => {
        event.currentTarget.select();
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
          event.preventDefault();
        }
      }}
      onWheel={(event) => event.currentTarget.blur()}
      onChange={(event) => onChange(event.target.value)}
      onBlur={(event) => onBlur(event.currentTarget.value)}
    />
  );
}

type FieldSelectOption = {
  value: string;
  label: string;
};

type FieldSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: Array<FieldSelectOption>;
};

export function FieldSelect({ value, onChange, options }: FieldSelectProps) {
  const className = cn(
    "box-border block h-full w-full border border-transparent px-1 py-0.5 text-right font-mono outline-none placeholder:text-slate-400",
    "focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 focus:ring-inset",
  );

  return (
    <select className={className} value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

type RebarFieldRowProps = {
  label: string;
  form: FormState;
  onChangeField: (field: keyof FormState) => (value: string) => void;
  onCommitField: (field: keyof FormState) => (value: string) => void;
};

export function RebarFieldRow({ label, form, onChangeField, onCommitField }: RebarFieldRowProps) {
  const isRound = form.rebarKind === "round";
  const symbol = isRound ? "φ" : "D";
  const unit = isRound ? "mm" : "-";

  return (
    <div className={GRID_ROW_CLASS}>
      <div className="px-2 py-1 align-top">
        <div className="flex flex-col gap-1">
          <span>{label}</span>
        </div>
      </div>
      <div className="flex items-center justify-center px-1 py-1 text-center font-mono">
        <SymbolText value={symbol} />
      </div>
      <div className="flex items-center justify-center px-1 py-1 text-center font-mono">{unit}</div>
      <div className="bg-white">
        {isRound ? (
          <FieldInput
            value={form.roundRebarDiameter_Mm}
            onChange={onChangeField("roundRebarDiameter_Mm")}
            onBlur={onCommitField("roundRebarDiameter_Mm")}
          />
        ) : (
          <FieldSelect
            value={form.rebarDiameter_Mm}
            onChange={(value) => {
              onChangeField("rebarDiameter_Mm")(value);
              onCommitField("rebarDiameter_Mm")(value);
            }}
            options={REBAR_DIAMETERS_MM.map((diameter) => ({
              value: String(diameter),
              label: `D${diameter}`,
            }))}
          />
        )}
      </div>
    </div>
  );
}

type RebarStrengthFieldRowProps = {
  label: string;
  form: FormState;
  onChangeField: (field: keyof FormState) => (value: string) => void;
  onCommitField: (field: keyof FormState) => (value: string) => void;
};

export function RebarStrengthFieldRow({
  label,
  form,
  onChangeField,
  onCommitField,
}: RebarStrengthFieldRowProps) {
  const isMaterialMode = form.rebarStrengthMode === "material";

  return (
    <div className={GRID_ROW_CLASS}>
      <div className="px-2 py-1 align-top">
        <div className="flex flex-col gap-1">
          <span>{label}</span>
        </div>
      </div>
      <div className="flex items-center justify-center px-1 py-1 text-center font-mono">
        <SymbolText value="σsy" />
      </div>
      <div className="flex items-center justify-center px-1 py-1 text-center font-mono">N/mm²</div>
      <div className="bg-white">
        {isMaterialMode ? (
          <FieldSelect
            value={form.rebarMaterialName}
            onChange={(value) => {
              onChangeField("rebarMaterialName")(value);
              onCommitField("rebarMaterialName")(value);
              const nextStrength = getRebarYieldStrengthMm2(
                value as (typeof REBAR_MATERIALS)[number]["name"],
              );
              onChangeField("rebarYieldStrength_NPerMm2")(String(nextStrength));
              onCommitField("rebarYieldStrength_NPerMm2")(String(nextStrength));
            }}
            options={REBAR_MATERIALS.map((material) => ({
              value: material.name,
              label: `${material.name}`,
            }))}
          />
        ) : (
          <FieldInput
            value={form.rebarYieldStrength_NPerMm2}
            onChange={onChangeField("rebarYieldStrength_NPerMm2")}
            onBlur={onCommitField("rebarYieldStrength_NPerMm2")}
          />
        )}
      </div>
    </div>
  );
}

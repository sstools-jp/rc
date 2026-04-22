import type { ReactNode } from "react";
import { SymbolText } from "@/components/SymbolText";
import type { FormState } from "@/forms/form-state";
import { REBAR_DIAMETERS_MM } from "@/model/rebar";
import { cn } from "@/utils/cn";

type FieldRowProps = {
  label: string;
  symbol: string;
  unit: string;
  children: ReactNode;
};

export function FieldRow({ label, symbol, unit, children }: FieldRowProps) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_3rem_4rem_6rem] divide-x divide-slate-400 border-b border-slate-400 last:border-b-0">
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
    <div className="grid grid-cols-[minmax(0,1fr)_3rem_4rem_6rem] divide-x divide-slate-400 border-b border-slate-400 bg-slate-200/50 text-xs font-semibold tracking-wider text-slate-600">
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
};

export function FieldInput({ value, onChange, onBlur, inputMode = "decimal" }: FieldInputProps) {
  const className = cn(
    "block h-full w-full border border-transparent [appearance:textfield] px-1 py-0.5 text-right font-mono outline-none box-border placeholder:text-slate-400",
    "focus:border-amber-500 focus:ring-2 focus:ring-inset focus:ring-amber-500/15",
    "[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
  );

  return (
    <input
      type="number"
      inputMode={inputMode}
      step="any"
      className={className}
      value={value}
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
    "block h-full w-full border border-transparent px-1 py-0.5 text-right font-mono outline-none box-border placeholder:text-slate-400",
    "focus:border-amber-500 focus:ring-2 focus:ring-inset focus:ring-amber-500/15",
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
  form: FormState;
  onChangeField: (field: keyof FormState) => (value: string) => void;
  onCommitField: (field: keyof FormState) => (value: string) => void;
};

export function RebarFieldRow({ form, onChangeField, onCommitField }: RebarFieldRowProps) {
  const isRound = form.rebarKind === "round";
  const symbol = isRound ? "φ" : "D";
  const unit = isRound ? "mm" : "-";

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_3rem_4rem_6rem] divide-x divide-slate-400 border-b border-slate-400 last:border-b-0">
      <div className="px-2 py-1 align-top">
        <div className="flex flex-col gap-1">
          <span>鉄筋径</span>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="rebarKind"
                value="deformed"
                checked={!isRound}
                onChange={(event) => {
                  onChangeField("rebarKind")(event.target.value);
                  onCommitField("rebarKind")(event.target.value);
                }}
              />
              異形棒鋼(DB)
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="rebarKind"
                value="round"
                checked={isRound}
                onChange={(event) => {
                  onChangeField("rebarKind")(event.target.value);
                  onCommitField("rebarKind")(event.target.value);
                }}
              />
              丸鋼(RB)
            </label>
          </div>
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

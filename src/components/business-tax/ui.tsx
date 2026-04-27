export function FieldInput({
  label,
  value,
  onChange,
  type = "number",
  step,
}: {
  label: string;
  value: number | string;
  onChange: (value: number | string) => void;
  type?: "number" | "text";
  step?: number;
}) {
  const displayValue =
    type === "number" && typeof value === "number" && value === 0 ? "" : value;
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">{label}</label>
      <input
        type={type}
        min={type === "number" ? 0 : undefined}
        step={type === "number" ? (step ?? "any") : undefined}
        value={displayValue}
        onChange={(event) => onChange(type === "number" ? Number(event.target.value) : event.target.value)}
        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm"
      />
    </div>
  );
}

export function FieldSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function SummaryCard({
  title,
  value,
  tone = "primary",
}: {
  title: string;
  value: string;
  tone?: "primary" | "danger" | "success";
}) {
  const toneClass =
    tone === "danger"
      ? "text-red-600"
      : tone === "success"
        ? "text-emerald-600"
        : "text-[#188a4b]";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">{title}</p>
      <p className={`text-xl font-bold mt-2 ${toneClass}`}>{value}</p>
    </div>
  );
}

export function StatRow({
  label,
  value,
  strong = false,
  tone = "neutral",
}: {
  label: string;
  value: string;
  strong?: boolean;
  tone?: "income" | "deduction" | "neutral";
}) {
  const toneClass =
    tone === "income"
      ? "text-[#188a4b]"
      : tone === "deduction"
        ? "text-red-600"
        : strong
          ? "text-slate-900"
          : "text-slate-700";

  return (
    <div className="flex items-center justify-between text-slate-700">
      <span className="text-slate-500">{label}</span>
      <span className={`tabular-nums ${strong ? "font-bold" : "font-semibold"} ${toneClass}`}>
        {value}
      </span>
    </div>
  );
}

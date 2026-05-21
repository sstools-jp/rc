export function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex break-inside-avoid flex-col">
      <div className="relative z-10 -mb-4 ml-2 flex h-8 w-fit items-center rounded-xs border border-slate-300 bg-white px-3">
        <h2 className="font-semibold text-slate-700">{title}</h2>
      </div>
      <div
        aria-live="polite"
        className="mb-2 flex w-sm flex-col gap-4 rounded-sm border border-slate-300 bg-white p-4 pt-6"
      >
        {children}
      </div>
    </section>
  );
}

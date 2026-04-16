type MobilePageHeaderProps = {
  eyebrow: string;
  title: string;
  chips?: string[];
};

export function MobilePageHeader({
  eyebrow,
  title,
  chips = [],
}: MobilePageHeaderProps) {
  return (
    <header className="rounded-3xl border border-white/10 bg-white/4 p-3 shadow-lg sm:hidden">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/60">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">
        {title}
      </h2>
      {chips.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <div
              key={chip}
              className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-medium text-stone-400"
            >
              {chip}
            </div>
          ))}
        </div>
      ) : null}
    </header>
  );
}

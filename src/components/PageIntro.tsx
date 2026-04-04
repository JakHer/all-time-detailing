type PageIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
  metrics?: Array<{
    label: string;
    value: string;
  }>;
};

export function PageIntro({
  eyebrow,
  title,
  description,
  metrics = [],
}: PageIntroProps) {
  return (
    <section className="rounded-[36px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.11),rgba(255,255,255,0.03)_45%,rgba(214,158,46,0.12)_100%)] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] md:p-8 xl:p-10">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">
        {eyebrow}
      </p>
      <h2 className="mt-4 max-w-[14ch] text-4xl leading-[0.95] font-semibold tracking-[-0.05em] text-white sm:text-5xl xl:text-6xl">
        {title}
      </h2>
      <p className="mt-5 max-w-3xl text-base leading-8 text-stone-300">
        {description}
      </p>

      {metrics.length > 0 ? (
        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <article
              key={metric.label}
              className="rounded-2xl border border-white/8 bg-white/6 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
                {metric.label}
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
                {metric.value}
              </p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

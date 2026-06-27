type SectionCardProps = {
  title: string;
  description?: string;
  items: string[];
};

export function SectionCard({ title, description, items }: SectionCardProps) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/6 p-4 shadow-lg sm:rounded-4xl sm:p-6 md:p-7">
      <h3 className="text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">
        {title}
      </h3>
      {description ? (
        <p className="mt-3 text-sm leading-6 text-stone-300 sm:leading-7">
          {description}
        </p>
      ) : null}

      <div className="mt-6 grid gap-3">
        {items.map((item) => (
          <div
            key={item}
            className="rounded-[22px] border border-white/8 bg-white/6 px-4 py-4 text-sm leading-6 text-stone-200 sm:leading-7"
          >
            {item}
          </div>
        ))}
      </div>
    </article>
  );
}

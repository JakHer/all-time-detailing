type SectionCardProps = {
  title: string;
  description: string;
  items: string[];
};

export function SectionCard({ title, description, items }: SectionCardProps) {
  return (
    <article className="rounded-4xl border border-white/10 bg-white/6 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] md:p-7">
      <h3 className="text-3xl font-semibold tracking-[-0.04em] text-white">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-7 text-stone-300">{description}</p>

      <div className="mt-6 grid gap-3">
        {items.map((item) => (
          <div
            key={item}
            className="rounded-[22px] border border-white/8 bg-white/6 px-4 py-4 text-sm leading-7 text-stone-200"
          >
            {item}
          </div>
        ))}
      </div>
    </article>
  );
}

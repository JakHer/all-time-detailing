import type { ReactNode } from 'react';

type KpiSectionProps = {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
};

export const KpiSection = ({
  eyebrow,
  title,
  description,
  action,
  children,
}: KpiSectionProps) => {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/6 p-4 shadow-[0_24px_90px_rgba(0,0,0,0.32)] sm:p-6 lg:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-200/70">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">
            {title}
          </h2>
        </div>
        {description ? (
          <p className="max-w-xl text-sm leading-6 text-stone-300">
            {description}
          </p>
        ) : null}
        {action}
      </div>
      {children}
    </section>
  );
};

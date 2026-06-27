import { processSteps, type KpiProcessStep } from '../../data/kpi';

export const KpiProcessSection = () => {
  return (
    <div className="mt-6 grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
      {processSteps.map((step, index) => (
        <ProcessStepCard key={step.title} step={step} index={index} />
      ))}
    </div>
  );
};

const ProcessStepCard = ({
  step,
  index,
}: {
  step: KpiProcessStep;
  index: number;
}) => {
  const Icon = step.icon;

  return (
    <article className="relative min-h-52 overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.11),rgba(255,255,255,0.04))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-13 w-13 items-center justify-center rounded-2xl border border-amber-200/25 bg-amber-300/12 text-amber-200">
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex h-8 min-w-8 items-center justify-center rounded-full bg-white text-sm font-black text-black">
          {index + 1}
        </div>
      </div>

      <h3 className="mt-6 text-lg font-semibold tracking-[-0.03em] text-white">
        {step.title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-stone-300">{step.body}</p>
    </article>
  );
};

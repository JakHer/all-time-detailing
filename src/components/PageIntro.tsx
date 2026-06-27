import { useEffect, useMemo, useState, type ReactNode } from 'react';

type PageIntroProps = {
  eyebrow: string;
  title: string;
  description?: string;
  metrics?: Array<{
    label: string;
    value: string;
  }>;
  action?: ReactNode;
};

type ParsedMetricValue = {
  parts: Array<
    | { type: 'text'; value: string }
    | {
        type: 'number';
        numericValue: number;
        decimals: number;
      }
  >;
  hasNumericParts: boolean;
};

export function PageIntro({
  eyebrow,
  title,
  description,
  metrics = [],
  action,
}: PageIntroProps) {
  return (
    <section className="w-full max-w-full overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.11),rgba(255,255,255,0.03)_45%,rgba(214,158,46,0.12)_100%)] p-4 shadow-[0_30px_120px_rgba(0,0,0,0.35)] sm:p-5 md:min-h-80 md:rounded-[36px] md:p-8 xl:min-h-68 xl:p-10">
      <div className="grid gap-5 sm:gap-6 xl:h-full xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] xl:items-start xl:gap-8">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200 sm:text-xs">
            {eyebrow}
          </p>
          <h2 className="mt-3 max-w-[22ch] text-[2rem] leading-[0.98] font-semibold tracking-tighter text-white sm:mt-4 sm:max-w-[24ch] sm:text-5xl xl:min-h-44 xl:text-6xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-300 sm:mt-5 sm:text-base sm:leading-8 xl:min-h-16">
              {description}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 sm:gap-4 xl:self-stretch">
          {action ? <div className="flex sm:justify-end">{action}</div> : null}
          {metrics.length > 0 ? (
            <div className="flex max-w-full snap-x snap-mandatory gap-2 overflow-x-auto pb-1 sm:grid sm:gap-3 sm:overflow-visible sm:pb-0 sm:grid-cols-2">
              {metrics.map((metric) => (
                <article
                  key={metric.label}
                  className="flex min-h-24 min-w-37 shrink-0 snap-start flex-col justify-between rounded-2xl border border-white/8 bg-white/6 px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:min-h-26 sm:min-w-0 sm:px-4 sm:py-4"
                >
                  <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400 sm:text-xs sm:tracking-[0.18em]">
                    {metric.label}
                  </p>
                  <p
                    className="mt-1.5 truncate whitespace-nowrap text-xl font-semibold tracking-[-0.04em] text-white sm:mt-2 sm:text-2xl"
                    title={metric.value}
                  >
                    <AnimatedMetricValue value={metric.value} />
                  </p>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function AnimatedMetricValue({ value }: { value: string }) {
  const parsedValue = useMemo(() => parseMetricValue(value), [value]);
  const [progress, setProgress] = useState(parsedValue.hasNumericParts ? 0 : 1);

  useEffect(() => {
    if (!parsedValue.hasNumericParts) {
      setProgress(1);
      return;
    }

    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setProgress(1);
      return;
    }

    setProgress(0);

    const duration = 900;
    const start = performance.now();
    let frameId = 0;

    function tick(now: number) {
      const elapsed = now - start;
      const nextProgress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - nextProgress, 3);

      setProgress(easedProgress);

      if (nextProgress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    }

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [parsedValue]);

  if (!parsedValue.hasNumericParts) {
    return value;
  }

  return parsedValue.parts
    .map((part) => {
      if (part.type === 'text') {
        return part.value;
      }

      return formatAnimatedNumber(part.numericValue * progress, part.decimals);
    })
    .join('');
}

function parseMetricValue(value: string): ParsedMetricValue {
  const numberPattern = /\d(?:[\d\s,.]*\d)?|\d/g;
  const parts: ParsedMetricValue['parts'] = [];
  let currentIndex = 0;

  for (const match of value.matchAll(numberPattern)) {
    const raw = match[0];
    const matchIndex = match.index ?? 0;

    if (matchIndex > currentIndex) {
      parts.push({
        type: 'text',
        value: value.slice(currentIndex, matchIndex),
      });
    }

    const normalized = raw.replace(/\s/g, '').replace(',', '.');
    const numericValue = Number.parseFloat(normalized);

    if (Number.isNaN(numericValue)) {
      parts.push({ type: 'text', value: raw });
    } else {
      const decimalPart = normalized.split('.')[1];

      parts.push({
        type: 'number',
        numericValue,
        decimals: decimalPart?.length ?? 0,
      });
    }

    currentIndex = matchIndex + raw.length;
  }

  if (currentIndex < value.length) {
    parts.push({
      type: 'text',
      value: value.slice(currentIndex),
    });
  }

  return {
    parts,
    hasNumericParts: parts.some((part) => part.type === 'number'),
  };
}

function formatAnimatedNumber(value: number, decimals: number) {
  return new Intl.NumberFormat('pl-PL', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

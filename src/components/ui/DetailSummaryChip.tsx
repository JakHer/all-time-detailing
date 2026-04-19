import type { ReactNode } from 'react';

type DetailSummaryChipProps = {
  label: string;
  value: string;
  accent?: ReactNode;
};

export function DetailSummaryChip({
  label,
  value,
  accent,
}: DetailSummaryChipProps) {
  return (
    <div className="inline-flex min-w-0 items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-xs text-stone-300">
      {accent}
      <span className="text-stone-500">{label}:</span>
      <span className="truncate font-medium text-white">{value}</span>
    </div>
  );
}

import { ChevronRight } from 'lucide-react';

type DetailLinkRowProps = {
  label: string;
  description?: string;
  onClick: () => void;
};

export function DetailLinkRow({
  label,
  description,
  onClick,
}: DetailLinkRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full min-w-0 items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/6 px-3.5 py-3 text-left transition hover:border-white/14 hover:bg-white/8"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">{label}</p>
        {description ? (
          <p className="mt-1 truncate text-xs text-stone-500">{description}</p>
        ) : null}
      </div>
      <ChevronRight className="h-4.5 w-4.5 shrink-0 text-stone-500" />
    </button>
  );
}

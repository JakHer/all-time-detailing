import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';

type CollapsibleDetailSectionProps = {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  countLabel?: string;
};

export function CollapsibleDetailSection({
  title,
  icon,
  children,
  defaultOpen = false,
  countLabel,
}: CollapsibleDetailSectionProps) {
  return (
    <details
      className="group mt-4 overflow-hidden rounded-3xl border border-white/8 bg-black/18"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-white [&::-webkit-details-marker]:hidden">
        <div className="flex min-w-0 items-center gap-2">
          {icon ? <span className="shrink-0 opacity-45">{icon}</span> : null}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{title}</p>
            {countLabel ? (
              <p className="mt-0.5 text-[11px] text-stone-500">{countLabel}</p>
            ) : null}
          </div>
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-stone-400 transition group-open:rotate-180" />
      </summary>
      <div className="border-t border-white/8 px-4 py-3">{children}</div>
    </details>
  );
}

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export const inputClassName =
  'w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-stone-600 focus:border-amber-200/40 focus:bg-black/60 focus:ring-4 focus:ring-amber-200/5 disabled:cursor-not-allowed disabled:opacity-40';

type SectionTitleProps = {
  icon: LucideIcon;
  title: string;
};

export function SectionTitle({ icon: Icon, title }: SectionTitleProps) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="h-4 w-4 text-amber-400" />
      <h3 className="text-sm font-bold uppercase tracking-wider text-stone-200">
        {title}
      </h3>
    </div>
  );
}

type FieldProps = {
  label: string;
  children: ReactNode;
  error?: string;
};

export function Field({ label, children, error }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-stone-500 ml-1">
        {label}
      </span>
      {children}
      {error && (
        <span className="mt-1.5 block text-xs font-medium text-rose-400 ml-1">
          {error}
        </span>
      )}
    </label>
  );
}

import type { ReactNode } from 'react';

type DetailActionIconButtonProps = {
  children: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: 'default' | 'warning' | 'danger';
};

export function DetailActionIconButton({
  children,
  label,
  onClick,
  disabled = false,
  tone = 'default',
}: DetailActionIconButtonProps) {
  const toneClasses =
    tone === 'danger'
      ? 'border-rose-300/20 bg-rose-300/12 text-rose-50 hover:border-rose-300/30 hover:bg-rose-300/18'
      : tone === 'warning'
        ? 'border-amber-200/20 bg-amber-300/12 text-amber-50 hover:border-amber-200/30 hover:bg-amber-300/18'
        : 'border-white/10 bg-white/6 text-white hover:border-white/16 hover:bg-white/10';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border transition ${toneClasses} disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {children}
    </button>
  );
}

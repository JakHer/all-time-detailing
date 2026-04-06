import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type ActionButtonProps = {
  children: ReactNode;
  icon?: LucideIcon;
  variant?: 'amber' | 'solid';
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
};

export function ActionButton({
  children,
  icon: Icon,
  variant = 'amber',
  onClick,
  type = 'button',
  disabled = false,
  className = '',
}: ActionButtonProps) {
  const baseClassName =
    'inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50';

  const variantClassName =
    variant === 'solid'
      ? 'bg-white text-black hover:scale-[1.02] active:scale-[0.98]'
      : 'border border-amber-200/20 bg-amber-300/12 text-amber-100 hover:border-amber-200/30 hover:bg-amber-300/18';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClassName} ${variantClassName} ${className}`.trim()}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      <span>{children}</span>
    </button>
  );
}

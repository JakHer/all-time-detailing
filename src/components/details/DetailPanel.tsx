import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { surfaceStyles } from '../design/styles';

type DetailPanelProps = {
  children: ReactNode;
  variant?: 'card' | 'sheet';
  className?: string;
};

type DetailCloseButtonProps = {
  label: string;
  onClick: () => void;
};

type DetailPlaceholderProps = {
  icon?: ReactNode;
  title?: string;
  message: string;
};

export const DetailPanel = ({
  children,
  variant = 'card',
  className = '',
}: DetailPanelProps) => {
  const panelClassName =
    variant === 'sheet'
      ? 'w-full max-w-full overflow-hidden'
      : surfaceStyles.detailPanel;

  return (
    <article className={`${panelClassName} ${className}`.trim()}>
      {children}
    </article>
  );
};

export const DetailCloseButton = ({
  label,
  onClick,
}: DetailCloseButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      onPointerDown={(event) => {
        event.preventDefault();
        onClick();
      }}
      className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/6 text-white transition hover:border-white/16 hover:bg-white/10"
      aria-label={label}
      title={label}
    >
      <X className="h-4.5 w-4.5" />
    </button>
  );
};

export const DetailPlaceholder = ({
  icon,
  title,
  message,
}: DetailPlaceholderProps) => {
  return (
    <DetailPanel>
      <div className="flex min-h-128 items-center justify-center rounded-3xl border border-dashed border-white/10 bg-black/15 px-4 py-8 text-center text-sm leading-7 text-stone-400">
        <div>
          {icon ? (
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white/4">
              {icon}
            </div>
          ) : null}
          {title ? (
            <h3 className="mt-6 font-semibold text-white/40">{title}</h3>
          ) : null}
          <p
            className={
              title || icon ? 'mt-2 max-w-sm text-sm leading-relaxed' : ''
            }
          >
            {message}
          </p>
        </div>
      </div>
    </DetailPanel>
  );
};

import type { ReactNode } from 'react';

type ToolbarPanelProps = {
  children: ReactNode;
  className?: string;
};

export function ToolbarPanel({ children, className = '' }: ToolbarPanelProps) {
  return (
    <section
      className={`rounded-3xl border border-white/8 bg-white/4 p-3 shadow-lg sm:rounded-4xl sm:p-4 ${className}`.trim()}
    >
      {children}
    </section>
  );
}

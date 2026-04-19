import type { ReactNode } from 'react';

type SelectableListItemProps = {
  onClick: () => void;
  isActive: boolean;
  mobileLeading: ReactNode;
  mobileBody: ReactNode;
  mobileTrailing: ReactNode;
  desktopLeading: ReactNode;
  desktopBody: ReactNode;
  desktopTrailing: ReactNode;
};

export function SelectableListItem({
  onClick,
  isActive,
  mobileLeading,
  mobileBody,
  mobileTrailing,
  desktopLeading,
  desktopBody,
  desktopTrailing,
}: SelectableListItemProps) {
  const buttonClassName = isActive
    ? 'border-amber-200/30 bg-amber-300/10 shadow-[0_10px_30px_rgba(214,158,46,0.12)]'
    : 'border-white/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] hover:border-white/14 hover:bg-white/8';

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className={`grid w-full min-w-0 grid-cols-[4.75rem_minmax(0,1fr)_auto] items-center gap-3 rounded-[20px] border px-3 py-3 text-left transition sm:hidden ${buttonClassName}`}
      >
        <div className="min-w-0">{mobileLeading}</div>
        <div className="min-w-0">{mobileBody}</div>
        <div className="flex min-w-0 items-center justify-end gap-2">
          {mobileTrailing}
        </div>
      </button>

      <button
        type="button"
        onClick={onClick}
        className={`hidden w-full min-w-0 max-w-full grid-cols-[minmax(0,4.5rem)_minmax(0,1fr)_auto] items-center gap-3 rounded-[18px] border px-3 py-2.5 text-left transition sm:grid ${buttonClassName}`}
      >
        <div className="min-w-0">{desktopLeading}</div>
        <div className="min-w-0">{desktopBody}</div>
        <div className="min-w-0 text-right">{desktopTrailing}</div>
      </button>
    </>
  );
}

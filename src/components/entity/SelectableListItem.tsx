import type { ReactNode } from 'react';
import { selectableItemStyles } from '../design/styles';

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
    ? selectableItemStyles.active
    : selectableItemStyles.inactive;

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className={`${selectableItemStyles.mobile} ${buttonClassName}`}
      >
        <div className="min-w-0">{mobileLeading}</div>
        <div className="min-w-0">{mobileBody}</div>
        <div className={selectableItemStyles.trailing}>{mobileTrailing}</div>
      </button>

      <button
        type="button"
        onClick={onClick}
        className={`${selectableItemStyles.desktop} ${buttonClassName}`}
      >
        <div className="min-w-0">{desktopLeading}</div>
        <div className="min-w-0">{desktopBody}</div>
        <div className="min-w-0 text-right">{desktopTrailing}</div>
      </button>
    </>
  );
}

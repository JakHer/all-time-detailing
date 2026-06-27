import { ChevronRight } from 'lucide-react';
import { SelectableListItem } from '../entity/SelectableListItem';

type VehicleListEntryProps = {
  registration: string;
  make: string;
  model: string;
  ownerName: string;
  bookingCount?: number;
  color?: string | null;
  productionYear?: number | null;
  isActive?: boolean;
  onClick: () => void;
  trailingMode?: 'count' | 'detail';
};

export function VehicleListEntry({
  registration,
  make,
  model,
  ownerName,
  bookingCount = 0,
  color,
  productionYear,
  isActive = false,
  onClick,
  trailingMode = 'count',
}: VehicleListEntryProps) {
  return (
    <SelectableListItem
      onClick={onClick}
      isActive={isActive}
      mobileLeading={
        <div className="truncate text-sm font-semibold tracking-[-0.03em] text-white">
          {registration}
        </div>
      }
      mobileBody={
        <>
          <p className="truncate text-sm font-medium text-white">
            {make} {model} <span className="text-stone-500">|</span>{' '}
            <span className="text-stone-400">{ownerName}</span>
          </p>
          {trailingMode === 'detail' ? (
            <p className="mt-1 truncate text-xs text-stone-500">
              {productionYear ?? 'Rok nieznany'}
              <span className="px-1 text-stone-600">|</span>
              {color || 'Brak koloru'}
            </p>
          ) : null}
        </>
      }
      mobileTrailing={
        trailingMode === 'detail' ? (
          <ChevronRight
            className={`h-4.5 w-4.5 shrink-0 ${
              isActive ? 'text-amber-200' : 'text-stone-500'
            }`}
            aria-hidden="true"
          />
        ) : (
          <div
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${
              isActive ? 'bg-amber-300' : 'bg-stone-500'
            }`}
            aria-hidden="true"
          />
        )
      }
      desktopLeading={
        <div className="truncate text-base font-semibold tracking-[-0.03em] text-white">
          {registration}
        </div>
      }
      desktopBody={
        <>
          <p className="truncate text-sm font-semibold text-white">
            {make} {model}
          </p>
          <p className="mt-0.5 truncate text-xs text-stone-400">{ownerName}</p>
        </>
      }
      desktopTrailing={
        trailingMode === 'detail' ? (
          <div className="flex items-center justify-end gap-3">
            <p className="truncate text-xs text-stone-500">
              {productionYear ?? 'Rok nieznany'}
              <span className="px-1 text-stone-600">|</span>
              {color || 'Brak koloru'}
            </p>
            <ChevronRight
              className={`h-4.5 w-4.5 shrink-0 ${
                isActive ? 'text-amber-200' : 'text-stone-500'
              }`}
              aria-hidden="true"
            />
          </div>
        ) : (
          <p className="truncate text-xs text-stone-300">
            {bookingCount} {getBookingLabel(bookingCount)}
          </p>
        )
      }
    />
  );
}

function getBookingLabel(count: number) {
  if (count === 1) return 'wizyta';
  if (count >= 2 && count <= 4) return 'wizyty';
  return 'wizyt';
}

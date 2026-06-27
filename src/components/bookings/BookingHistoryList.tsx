import type { BookingStatus } from '../../data/bookings';
import { ChevronRight } from 'lucide-react';
import { StatusBadge } from '../primitives/StatusBadge';

export type BookingHistoryListItem = {
  id: string;
  title: string;
  subtitle?: string;
  meta?: string;
  status: string;
  onClick?: () => void;
  metaActionLabel?: string;
  metaOnClick?: () => void;
};

type BookingHistoryListProps = {
  items: BookingHistoryListItem[];
  emptyMessage: string;
};

export function BookingHistoryList({
  items,
  emptyMessage,
}: BookingHistoryListProps) {
  if (items.length === 0) {
    return <EmptyPanelMessage message={emptyMessage} />;
  }

  return (
    <div className="grid gap-2.5">
      {items.map((item) => (
        <div
          key={item.id}
          className={`flex min-w-0 max-w-full items-start justify-between gap-2.5 overflow-hidden rounded-2xl border border-white/8 bg-white/6 p-3.5 text-left transition sm:items-center sm:gap-3 ${
            item.onClick ? 'hover:border-white/14 hover:bg-white/8' : ''
          }`}
        >
          <div className="min-w-0 flex-1 overflow-hidden">
            {item.onClick ? (
              <button
                type="button"
                onClick={item.onClick}
                className="min-w-0 max-w-full text-left"
              >
                <p className="truncate text-sm font-semibold text-white">
                  {item.title}
                </p>
                {item.subtitle ? (
                  <p className="mt-1 truncate text-xs text-stone-400">
                    {item.subtitle}
                  </p>
                ) : null}
              </button>
            ) : (
              <>
                <p className="truncate text-sm font-semibold text-white">
                  {item.title}
                </p>
                {item.subtitle ? (
                  <p className="mt-1 truncate text-xs text-stone-400">
                    {item.subtitle}
                  </p>
                ) : null}
              </>
            )}
            {item.metaActionLabel ? (
              <button
                type="button"
                onClick={item.metaOnClick}
                className="mt-1 block max-w-full truncate text-[11px] text-stone-500 transition hover:text-stone-300"
              >
                {item.metaActionLabel}
              </button>
            ) : item.meta ? (
              <p className="mt-1 truncate text-[11px] text-stone-500">
                {item.meta}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1 self-start sm:flex-row sm:items-center sm:gap-2">
            <StatusBadge
              status={normalizeBookingStatus(item.status)}
              className="max-w-full px-2.5 text-[11px] sm:px-3 sm:text-xs"
            />
            {item.onClick ? (
              <button
                type="button"
                onClick={item.onClick}
                className="text-stone-500 transition hover:text-stone-300"
                aria-label="Przejdz do szczegolow rezerwacji"
              >
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyPanelMessage({ message }: { message: string }) {
  return (
    <p className="rounded-2xl border border-dashed border-white/8 bg-white/2 p-4 text-center text-sm text-stone-500">
      {message}
    </p>
  );
}

function normalizeBookingStatus(status: string): BookingStatus {
  switch (status) {
    case 'Nowa':
    case 'Potwierdzona':
    case 'W realizacji':
    case 'Gotowa do odbioru':
    case 'Anulowana':
      return status;
    default:
      return 'Nowa';
  }
}
